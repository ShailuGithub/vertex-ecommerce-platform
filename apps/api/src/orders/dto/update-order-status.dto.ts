import { IsEnum, IsOptional, IsString } from "class-validator";
import { OrderStatus } from "@vertex/shared-types";

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsOptional()
  @IsString()
  note?: string;
}
