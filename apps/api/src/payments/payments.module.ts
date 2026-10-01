import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Payment } from "./entities/payment.entity";
import { PaymentsController } from "./payments.controller";
import { RazorpayWebhookController } from "./razorpay-webhook.controller";
import { PaymentsService } from "./payments.service";
import { RazorpayService } from "./razorpay/razorpay.service";
import { OrdersModule } from "../orders/orders.module";
import { InventoryModule } from "../inventory/inventory.module";

@Module({
  imports: [TypeOrmModule.forFeature([Payment]), OrdersModule, InventoryModule],
  controllers: [PaymentsController, RazorpayWebhookController],
  providers: [PaymentsService, RazorpayService],
})
export class PaymentsModule {}
