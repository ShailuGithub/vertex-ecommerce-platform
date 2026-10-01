import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { CustomerJwtAuthGuard } from "../customer-auth/guards/customer-jwt-auth.guard";
import { StoreContextGuard } from "../stores/guards/store-context.guard";
import { CurrentCustomer } from "../common/decorators/current-customer.decorator";
import { AuthenticatedCustomer } from "../common/types/authenticated-customer";
import { AddressesService } from "./addresses.service";
import { CreateAddressDto } from "./dto/create-address.dto";
import { UpdateAddressDto } from "./dto/update-address.dto";

@Controller("stores/:storeSlug/addresses")
@UseGuards(StoreContextGuard, CustomerJwtAuthGuard)
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  findAll(@CurrentCustomer() customer: AuthenticatedCustomer) {
    return this.addressesService.findAllForCustomer(customer.customerId);
  }

  @Post()
  create(@CurrentCustomer() customer: AuthenticatedCustomer, @Body() dto: CreateAddressDto) {
    return this.addressesService.create(customer.customerId, dto);
  }

  @Patch(":id")
  update(
    @CurrentCustomer() customer: AuthenticatedCustomer,
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.addressesService.update(customer.customerId, id, dto);
  }

  @Patch(":id/default")
  setDefault(@CurrentCustomer() customer: AuthenticatedCustomer, @Param("id", ParseIntPipe) id: number) {
    return this.addressesService.setDefault(customer.customerId, id);
  }

  @Delete(":id")
  @HttpCode(204)
  async remove(@CurrentCustomer() customer: AuthenticatedCustomer, @Param("id", ParseIntPipe) id: number) {
    await this.addressesService.remove(customer.customerId, id);
  }
}
