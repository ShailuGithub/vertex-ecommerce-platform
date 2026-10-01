import { IsString } from "class-validator";

export class CreateRazorpayOrderDto {
  @IsString()
  orderNumber: string;
}
