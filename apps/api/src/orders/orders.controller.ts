import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CustomerJwtAuthGuard } from "../customer-auth/guards/customer-jwt-auth.guard";
import { StoreContextGuard } from "../stores/guards/store-context.guard";
import { CurrentStore } from "../stores/decorators/current-store.decorator";
import { CurrentCustomer } from "../common/decorators/current-customer.decorator";
import { AuthenticatedCustomer } from "../common/types/authenticated-customer";
import { Store } from "../stores/entities/store.entity";
import { OrdersService } from "./orders.service";
import { CreateOrderDto } from "./dto/create-order.dto";

@Controller("stores/:storeSlug/orders")
@UseGuards(StoreContextGuard, CustomerJwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(
    @Body() dto: CreateOrderDto,
    @CurrentStore() store: Store,
    @CurrentCustomer() customer: AuthenticatedCustomer,
  ) {
    return this.ordersService.createFromCart(store.id, customer.customerId, dto);
  }

  @Get()
  findAll(@CurrentStore() store: Store, @CurrentCustomer() customer: AuthenticatedCustomer) {
    return this.ordersService.findAllForCustomer(store.id, customer.customerId);
  }

  @Get(":orderNumber")
  async findOne(
    @Param("orderNumber") orderNumber: string,
    @CurrentStore() store: Store,
    @CurrentCustomer() customer: AuthenticatedCustomer,
  ) {
    const order = await this.ordersService.findByOrderNumberForCustomer(orderNumber, store.id, customer.customerId);
    const statusHistory = await this.ordersService.getStatusHistory(order.id);
    return { ...order, statusHistory };
  }
}
