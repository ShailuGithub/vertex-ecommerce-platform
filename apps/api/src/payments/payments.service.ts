import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { OrderStatus, PaymentStatus } from "@vertex/shared-types";
import { Repository } from "typeorm";
import { Payment } from "./entities/payment.entity";
import { RazorpayService } from "./razorpay/razorpay.service";
import { OrdersService } from "../orders/orders.service";
import { InventoryService } from "../inventory/inventory.service";
import { Store } from "../stores/entities/store.entity";

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    private readonly razorpayService: RazorpayService,
    private readonly ordersService: OrdersService,
    private readonly inventoryService: InventoryService,
  ) {}

  async createRazorpayOrder(store: Store, customerId: number, orderNumber: string) {
    const order = await this.ordersService.findByOrderNumberForCustomer(orderNumber, store.id, customerId);

    if (order.status !== OrderStatus.PENDING_PAYMENT) {
      throw new BadRequestException(`Order is not awaiting payment (status: ${order.status})`);
    }

    const existing = await this.paymentsRepository.findOne({
      where: { orderId: order.id, status: PaymentStatus.CREATED },
      order: { createdAt: "DESC" },
    });
    if (existing) {
      const { keyId } = this.razorpayService.getCredentials(store);
      return {
        razorpayOrderId: existing.razorpayOrderId,
        amount: Math.round(Number(existing.amount) * 100),
        currency: existing.currency,
        keyId,
      };
    }

    const razorpayOrder = await this.razorpayService.createOrder(store, order.total, order.orderNumber);

    const payment = this.paymentsRepository.create({
      storeId: store.id,
      orderId: order.id,
      razorpayOrderId: razorpayOrder.id,
      amount: order.total,
      currency: typeof razorpayOrder.currency === "string" ? razorpayOrder.currency : "INR",
      status: PaymentStatus.CREATED,
    });
    await this.paymentsRepository.save(payment);

    const { keyId } = this.razorpayService.getCredentials(store);
    return {
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: payment.currency,
      keyId,
    };
  }

  async verifyPayment(
    store: Store,
    customerId: number,
    dto: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string },
  ) {
    const payment = await this.paymentsRepository.findOne({
      where: { storeId: store.id, razorpayOrderId: dto.razorpayOrderId },
    });
    if (!payment) {
      throw new NotFoundException("Payment not found");
    }

    const order = await this.ordersService.findByIdForStore(payment.orderId, store.id);
    if (order.customerId !== customerId) {
      throw new NotFoundException("Payment not found");
    }

    const valid = this.razorpayService.verifyPaymentSignature(
      store,
      dto.razorpayOrderId,
      dto.razorpayPaymentId,
      dto.razorpaySignature,
    );
    if (!valid) {
      payment.status = PaymentStatus.FAILED;
      await this.paymentsRepository.save(payment);
      throw new BadRequestException("Payment signature verification failed");
    }

    await this.markCaptured(payment, dto.razorpayPaymentId, dto.razorpaySignature);
    return { ok: true };
  }

  async handleWebhookPaymentCaptured(store: Store, razorpayOrderId: string, razorpayPaymentId: string) {
    const payment = await this.paymentsRepository.findOne({
      where: { storeId: store.id, razorpayOrderId },
    });
    if (!payment) return; // unknown order, nothing to reconcile

    if (payment.status === PaymentStatus.CAPTURED) {
      if (!payment.webhookVerifiedAt) {
        payment.webhookVerifiedAt = new Date();
        await this.paymentsRepository.save(payment);
      }
      return;
    }

    await this.markCaptured(payment, razorpayPaymentId, payment.razorpaySignature ?? "", true);
  }

  private async markCaptured(
    payment: Payment,
    razorpayPaymentId: string,
    razorpaySignature: string,
    fromWebhook = false,
  ): Promise<void> {
    if (payment.status === PaymentStatus.CAPTURED) return; // idempotent

    payment.status = PaymentStatus.CAPTURED;
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature || payment.razorpaySignature;
    if (fromWebhook) payment.webhookVerifiedAt = new Date();
    await this.paymentsRepository.save(payment);

    const order = await this.ordersService.findByIdForStore(payment.orderId, payment.storeId);
    if (order.status !== OrderStatus.PAID) {
      await this.ordersService.markPaid(order.id);
      for (const item of order.items) {
        await this.inventoryService.decrement(item.variantId, item.quantity);
      }
    }
  }
}
