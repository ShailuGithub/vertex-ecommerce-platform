import { IsString, MaxLength } from "class-validator";

export class ApplyCouponDto {
  @IsString()
  @MaxLength(40)
  code: string;
}
