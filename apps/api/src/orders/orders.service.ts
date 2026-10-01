import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { OrderStatus, ShippingMethod } from "@vertex/shared-types";
import { Repository } from "typeorm";
import { Order } from "./entities/order.entity";
import { OrderItem } from "./entities/order-item.entity";
import { OrderStatusHistory } from "./entities/order-status-history.entity";
import { CreateOrderDto } from "./dto/create-order.dto";
import { CartService } from "../cart/cart.service";
import { CouponsService } from "../coupons/coupons.service";

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(OrderStatusHistory)
    private readonly orderStatusHistoryRepository: Repository<OrderStatusHistory>,
    private readonly cartService: CartService,
    private readonly couponsService: CouponsService,
  ) {}

  private async generateOrderNumber(storeId: number): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.ordersRepository.count({ where: { storeId } });
    return `VX-${year}-${String(count + 1).padStart(5, "0")}`;
  }

  async createFromCart(storeId: number, customerId: number, dto: CreateOrderDto): Promise<Order> {
    const cart = await this.cartService.getOrCreateCart(storeId, customerId, null);
    this.cartService.assertNotEmpty(cart);

    const subtotal = this.cartService.computeSubtotal(cart);
    const shippingCost = 0;
    const tax = 0;

    let discountAmount = 0;
    let couponCode: string | null = null;
    let couponId: number | null = null;
    if (cart.couponCode) {
      const result = await this.couponsService.validateAndPrice(
        storeId,
        customerId,
        cart.couponCode,
        subtotal,
      );
      discountAmount = result.discountAmount;
      couponCode = result.coupon.code;
      couponId = result.coupon.id;
    }

    const total = subtotal - discountAmount + shippingCost + tax;

    const order = this.ordersRepository.create({
      orderNumber: await this.generateOrderNumber(storeId),
      storeId,
      customerId,
      status: OrderStatus.PENDING_PAYMENT,
      subtotal,
      shippingCost,
      tax,
      couponCode,
      discountAmount,
      total,
      shippingName: dto.shippingName,
      shippingLine1: dto.shippingLine1,
      shippingLine2: dto.shippingLine2 ?? null,
      shippingCity: dto.shippingCity,
      shippingState: dto.shippingState,
      shippingPostalCode: dto.shippingPostalCode,
      shippingCountry: dto.shippingCountry,
      shippingPhone: dto.shippingPhone,
    });
    const savedOrder = await this.ordersRepository.save(order);

    for (const item of cart.items) {
      await this.orderItemsRepository.save(
        this.orderItemsRepository.create({
          orderId: savedOrder.id,
          variantId: item.variantId,
          productNameSnapshot: item.variant.product.name,
          skuSnapshot: item.variant.sku,
          unitPrice: item.priceAtAdd,
          quantity: item.quantity,
          lineTotal: Number(item.priceAtAdd) * item.quantity,
        }),
      );
    }

    if (couponId !== null) {
      await this.couponsService.recordRedemption(storeId, couponId, customerId, savedOrder.id, discountAmount);
    }

    await this.cartService.markConverted(cart.id);

    return this.findByIdForCustomer(savedOrder.id, storeId, customerId);
  }

  async findAllForCustomer(storeId: number, customerId: number): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { storeId, customerId },
      relations: ["items"],
      order: { createdAt: "DESC" },
    });
  }

  async findByIdForCustomer(id: number, storeId: number, customerId: number): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id, storeId, customerId },
      relations: ["items"],
    });
    if (!order) {
      throw new NotFoundException(`Order #${id} not found`);
    }
    return order;
  }

  async findByOrderNumberForCustomer(orderNumber: string, storeId: number, customerId: number): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { orderNumber, storeId, customerId },
      relations: ["items"],
    });
    if (!order) {
      throw new NotFoundException(`Order "${orderNumber}" not found`);
    }
    return order;
  }

  async findByIdForStore(id: number, storeId: number): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id, storeId },
      relations: ["items"],
    });
    if (!order) {
      throw new NotFoundException(`Order #${id} not found`);
    }
    return order;
  }

  async markPaid(id: number): Promise<void> {
    await this.ordersRepository.update(id, { status: OrderStatus.PAID });
  }

  async findAllForStoreAdmin(storeId: number, status?: OrderStatus): Promise<Order[]> {
    return this.ordersRepository.find({
      where: status ? { storeId, status } : { storeId },
      relations: ["items", "customer"],
      select: { customer: { id: true, firstName: true, lastName: true, email: true } },
      order: { createdAt: "DESC" },
    });
  }

  async findDetailForStoreAdmin(storeId: number, id: number): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id, storeId },
      relations: ["items", "customer"],
      select: { customer: { id: true, firstName: true, lastName: true, email: true } },
    });
    if (!order) {
      throw new NotFoundException(`Order #${id} not found`);
    }
    return order;
  }

  async getStatusHistory(orderId: number): Promise<OrderStatusHistory[]> {
    return this.orderStatusHistoryRepository.find({
      where: { orderId },
      relations: ["changedByUser"],
      select: { changedByUser: { id: true, firstName: true, lastName: true } },
      order: { createdAt: "DESC" },
    });
  }

  async updateStatusForStoreAdmin(
    storeId: number,
    id: number,
    status: OrderStatus,
    note: string | undefined,
    changedByUserId: number,
  ): Promise<Order> {
    const order = await this.findDetailForStoreAdmin(storeId, id);
    order.status = status;
    await this.ordersRepository.save(order);

    await this.orderStatusHistoryRepository.save(
      this.orderStatusHistoryRepository.create({
        orderId: order.id,
        status,
        note: note ?? null,
        changedByUserId,
      }),
    );

    return this.findDetailForStoreAdmin(storeId, id);
  }

  async shipOrderForStoreAdmin(
    storeId: number,
    id: number,
    shippingMethod: ShippingMethod,
    courierName: string | undefined,
    trackingNumber: string | undefined,
    changedByUserId: number,
  ): Promise<Order> {
    const order = await this.findDetailForStoreAdmin(storeId, id);
    order.status = OrderStatus.SHIPPED;
    order.shippingMethod = shippingMethod;
    order.courierName = courierName ?? null;
    order.trackingNumber = trackingNumber ?? null;
    await this.ordersRepository.save(order);

    const note =
      shippingMethod === ShippingMethod.COURIER
        ? `Shipped via ${courierName}${trackingNumber ? ` (Tracking: ${trackingNumber})` : ""}`
        : `Self shipped${trackingNumber ? ` (Tracking: ${trackingNumber})` : ""}`;

    await this.orderStatusHistoryRepository.save(
      this.orderStatusHistoryRepository.create({
        orderId: order.id,
        status: OrderStatus.SHIPPED,
        note,
        changedByUserId,
      }),
    );

    return this.findDetailForStoreAdmin(storeId, id);
  }

  async addNoteForStoreAdmin(
    storeId: number,
    id: number,
    note: string,
    changedByUserId: number,
  ): Promise<OrderStatusHistory[]> {
    const order = await this.findDetailForStoreAdmin(storeId, id);

    await this.orderStatusHistoryRepository.save(
      this.orderStatusHistoryRepository.create({
        orderId: order.id,
        status: order.status,
        note,
        changedByUserId,
      }),
    );

    return this.getStatusHistory(id);
  }
}
