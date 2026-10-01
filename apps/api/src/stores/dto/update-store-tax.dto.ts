import { IsBoolean, IsNumber, IsOptional, Max, Min } from "class-validator";

export class UpdateStoreTaxDto {
  @IsBoolean()
  taxEnabled: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  taxRatePercent?: number;

  @IsBoolean()
  taxInclusive: boolean;
}
