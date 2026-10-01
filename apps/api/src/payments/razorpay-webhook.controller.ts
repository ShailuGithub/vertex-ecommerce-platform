import { BadRequestException, Controller, Post, RawBodyRequest, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { StoreContextGuard } from "../stores/guards/store-context.guard";
import { CurrentStore } from "../stores/decorators/current-store.decorator";
import { Store } from "../stores/entities/store.entity";
import { PaymentsService } from "./payments.service";
import { RazorpayService } from "./razorpay/razorpay.service";

@Controller("stores/:storeSlug/webhooks/razorpay")
@UseGuards(StoreContextGuard)
export class RazorpayWebhookController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly razorpayService: RazorpayService,
  ) {}

  @Post()
  async handleWebhook(@Req() req: RawBodyRequest<Request>, @CurrentStore() store: Store) {
    const signature = req.headers["x-razorpay-signature"];
    const rawBody = req.rawBody;
    if (!signature || typeof signature !== "string" || !rawBody) {
      throw new BadRequestException("Missing webhook signature or body");
    }

    const valid = this.razorpayService.verifyWebhookSignature(store, rawBody.toString("utf8"), signature);
    if (!valid) {
      throw new BadRequestException("Invalid webhook signature");
    }

    const body = req.body as {
      event?: string;
      payload?: { payment?: { entity?: { id?: string; order_id?: string } } };
    };

    if (body.event === "payment.captured" || body.event === "order.paid") {
      const paymentEntity = body.payload?.payment?.entity;
      if (paymentEntity?.order_id && paymentEntity?.id) {
        await this.paymentsService.handleWebhookPaymentCaptured(store, paymentEntity.order_id, paymentEntity.id);
      }
    }

    return { ok: true };
  }
}
