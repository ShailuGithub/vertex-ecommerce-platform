import { IsEmail, IsOptional, IsString, IsUrl, MaxLength, ValidateIf } from "class-validator";

export class UpdateStoreSupportSocialDto {
  @ValidateIf((o) => !!o.supportEmail)
  @IsEmail()
  supportEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  supportPhone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  whatsappNumber?: string;

  @ValidateIf((o) => !!o.facebookUrl)
  @IsUrl()
  @MaxLength(255)
  facebookUrl?: string;

  @ValidateIf((o) => !!o.instagramUrl)
  @IsUrl()
  @MaxLength(255)
  instagramUrl?: string;

  @ValidateIf((o) => !!o.twitterUrl)
  @IsUrl()
  @MaxLength(255)
  twitterUrl?: string;

  @ValidateIf((o) => !!o.youtubeUrl)
  @IsUrl()
  @MaxLength(255)
  youtubeUrl?: string;
}
