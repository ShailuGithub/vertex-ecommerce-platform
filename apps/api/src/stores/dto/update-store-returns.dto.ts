import { IsBoolean, IsInt, IsOptional, Max, Min } from "class-validator";

export class UpdateStoreReturnsDto {
  @IsBoolean()
  returnsEnabled: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(365)
  returnWindowDays?: number;
}
