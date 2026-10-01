import { ExtraChargeType } from "@vertex/shared-types";
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Min, MinLength, MaxLength } from "class-validator";

export class UpdateExtraChargeDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsEnum(ExtraChargeType)
  type?: ExtraChargeType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
