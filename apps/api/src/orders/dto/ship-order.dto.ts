import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateIf } from "class-validator";
import { ShippingMethod } from "@vertex/shared-types";

export class ShipOrderDto {
  @IsEnum(ShippingMethod)
  shippingMethod: ShippingMethod;

  @ValidateIf((o) => o.shippingMethod === ShippingMethod.COURIER)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  courierName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  trackingNumber?: string;
}
