import { ExtraChargeType } from "@vertex/shared-types";
import { IsEnum, IsNumber, IsString, Min, MinLength, MaxLength } from "class-validator";

export class CreateExtraChargeDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsEnum(ExtraChargeType)
  type: ExtraChargeType;

  @IsNumber()
  @Min(0)
  amount: number;
}
