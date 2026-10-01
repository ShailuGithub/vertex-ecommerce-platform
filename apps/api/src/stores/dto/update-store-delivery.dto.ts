import { AverageDeliveryTime, DeliveryChargeType } from "@vertex/shared-types";
import { IsEnum, IsNumber, IsOptional, Min } from "class-validator";

export class UpdateStoreDeliveryDto {
  @IsEnum(DeliveryChargeType)
  deliveryChargeType: DeliveryChargeType;

  @IsNumber()
  @Min(0)
  deliveryChargeAmount: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  freeDeliveryAboveAmount?: number;

  @IsOptional()
  @IsEnum(AverageDeliveryTime)
  averageDeliveryTime?: AverageDeliveryTime;
}
