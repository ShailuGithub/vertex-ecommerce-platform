import { IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateStorePoliciesDto {
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  checkoutPolicyText?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  taxPolicyText?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  returnsPolicyText?: string;
}
