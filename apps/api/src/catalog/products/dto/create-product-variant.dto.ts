import { IsInt, IsNumber, IsObject, IsOptional, IsString, Min } from "class-validator";

export class CreateProductVariantDto {
  @IsString()
  sku: string;

  @IsObject()
  attributes: Record<string, string>;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  quantityOnHand?: number;
}
