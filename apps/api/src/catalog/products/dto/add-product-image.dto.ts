import { IsBoolean, IsOptional, IsString } from "class-validator";

export class AddProductImageDto {
  @IsString()
  url: string;

  @IsOptional()
  @IsString()
  altText?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
