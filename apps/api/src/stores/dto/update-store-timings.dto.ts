import { Weekday } from "@vertex/shared-types";
import { Type } from "class-transformer";
import { ArrayMaxSize, IsArray, IsBoolean, IsEnum, IsOptional, IsString, ValidateNested } from "class-validator";

export class DayTimingDto {
  @IsEnum(Weekday)
  day: Weekday;

  @IsBoolean()
  isOpen: boolean;

  @IsOptional()
  @IsString()
  openTime?: string;

  @IsOptional()
  @IsString()
  closeTime?: string;
}

export class UpdateStoreTimingsDto {
  @IsArray()
  @ArrayMaxSize(7)
  @ValidateNested({ each: true })
  @Type(() => DayTimingDto)
  timings: DayTimingDto[];
}
