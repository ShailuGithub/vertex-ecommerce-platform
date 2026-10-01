import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { CustomerJwtAuthGuard } from "../customer-auth/guards/customer-jwt-auth.guard";
import { StoreContextGuard } from "../stores/guards/store-context.guard";
import { CurrentStore } from "../stores/decorators/current-store.decorator";
import { CurrentCustomer } from "../common/decorators/current-customer.decorator";
import { AuthenticatedCustomer } from "../common/types/authenticated-customer";
import { Store } from "../stores/entities/store.entity";
import { PaymentsService } from "./payments.service";
import { CreateRazorpayOrderDto } from "./dto/create-razorpay-order.dto";
import { VerifyPaymentDto } from "./dto/verify-payment.dto";

@Controller("stores/:storeSlug/payments/razorpay")
@UseGuards(StoreContextGuard, CustomerJwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post("create-order")
  createOrder(
    @CurrentStore() store: Store,
    @CurrentCustomer() customer: AuthenticatedCustomer,
    @Body() dto: CreateRazorpayOrderDto,
  ) {
    return this.paymentsService.createRazorpayOrder(store, customer.customerId, dto.orderNumber);
  }

  @Post("verify")
  verify(
    @CurrentStore() store: Store,
    @CurrentCustomer() customer: AuthenticatedCustomer,
    @Body() dto: VerifyPaymentDto,
  ) {
    return this.paymentsService.verifyPayment(store, customer.customerId, dto);
  }
}
