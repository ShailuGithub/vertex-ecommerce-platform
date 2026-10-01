import { IsString, MinLength } from "class-validator";

export class UpdateRazorpayCredentialsDto {
  @IsString()
  @MinLength(1)
  razorpayKeyId: string;

  @IsString()
  @MinLength(1)
  razorpayKeySecret: string;

  @IsString()
  @MinLength(1)
  razorpayWebhookSecret: string;
}
