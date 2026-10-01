import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class RegisterStoreDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  @MaxLength(150)
  storeName: string;

  @IsString()
  @MaxLength(100)
  @Matches(/^[a-z0-9](-?[a-z0-9])*$/, {
    message: "storeSlug may only contain lowercase letters, numbers, and hyphens",
  })
  storeSlug: string;
}
