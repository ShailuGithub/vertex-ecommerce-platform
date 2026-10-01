import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Order } from "../orders/entities/order.entity";
import { Customer } from "./entities/customer.entity";
import { CustomersService } from "./customers.service";
import { AdminCustomersController } from "./admin-customers.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Customer, Order])],
  controllers: [AdminCustomersController],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}
