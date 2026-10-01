import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from "@nestjs/common";
import { UserRole } from "@vertex/shared-types";
import { MerchantJwtAuthGuard } from "../auth/guards/merchant-jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { CustomersService } from "./customers.service";
import { CreateCustomerDto } from "./dto/create-customer.dto";

@Controller("customers")
@UseGuards(MerchantJwtAuthGuard, RolesGuard)
@Roles(UserRole.STORE_OWNER, UserRole.STORE_STAFF)
export class AdminCustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser, @Query("search") search?: string) {
    return this.customersService.findAllForStoreAdmin(user.storeId!, search);
  }

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateCustomerDto) {
    return this.customersService.createByStoreAdmin(user.storeId!, dto);
  }

  @Get(":id")
  findOne(@CurrentUser() user: AuthenticatedUser, @Param("id", ParseIntPipe) id: number) {
    return this.customersService.findDetailForStoreAdmin(user.storeId!, id);
  }
}
