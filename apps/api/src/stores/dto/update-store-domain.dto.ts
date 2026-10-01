import { IsOptional, Matches, MaxLength } from "class-validator";

export class UpdateStoreDomainDto {
  @IsOptional()
  @Matches(/^$|^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/, {
    message: "Enter a valid domain, e.g. shop.example.com",
  })
  @MaxLength(255)
  customDomain?: string;
}
