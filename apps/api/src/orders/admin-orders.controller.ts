import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { OrderStatus, UserRole } from "@vertex/shared-types";
import { MerchantJwtAuthGuard } from "../auth/guards/merchant-jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { OrdersService } from "./orders.service";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";
import { AddOrderNoteDto } from "./dto/add-order-note.dto";
import { ShipOrderDto } from "./dto/ship-order.dto";

@Controller("orders")
@UseGuards(MerchantJwtAuthGuard, RolesGuard)
@Roles(UserRole.STORE_OWNER, UserRole.STORE_STAFF)
export class AdminOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser, @Query("status") status?: OrderStatus) {
    const validStatus = status && Object.values(OrderStatus).includes(status) ? status : undefined;
    return this.ordersService.findAllForStoreAdmin(user.storeId!, validStatus);
  }

  @Get(":id")
  async findOne(@CurrentUser() user: AuthenticatedUser, @Param("id", ParseIntPipe) id: number) {
    const order = await this.ordersService.findDetailForStoreAdmin(user.storeId!, id);
    const history = await this.ordersService.getStatusHistory(id);
    return { ...order, statusHistory: history };
  }

  @Patch(":id/status")
  updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatusForStoreAdmin(user.storeId!, id, dto.status, dto.note, user.userId);
  }

  @Post(":id/ship")
  shipOrder(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: ShipOrderDto,
  ) {
    return this.ordersService.shipOrderForStoreAdmin(
      user.storeId!,
      id,
      dto.shippingMethod,
      dto.courierName,
      dto.trackingNumber,
      user.userId,
    );
  }

  @Post(":id/notes")
  addNote(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: AddOrderNoteDto,
  ) {
    return this.ordersService.addNoteForStoreAdmin(user.storeId!, id, dto.note, user.userId);
  }
}
