import { IsOptional, IsString, MaxLength } from "class-validator";

export class CreateOrderDto {
  @IsString()
  @MaxLength(150)
  shippingName: string;

  @IsString()
  @MaxLength(255)
  shippingLine1: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  shippingLine2?: string;

  @IsString()
  @MaxLength(100)
  shippingCity: string;

  @IsString()
  @MaxLength(100)
  shippingState: string;

  @IsString()
  @MaxLength(20)
  shippingPostalCode: string;

  @IsString()
  @MaxLength(100)
  shippingCountry: string;

  @IsString()
  @MaxLength(30)
  shippingPhone: string;
}
