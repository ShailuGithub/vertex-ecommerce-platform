import { IsBoolean, IsEmail, ValidateIf } from "class-validator";

export class UpdateStoreNotificationsDto {
  @ValidateIf((o) => !!o.notificationEmail)
  @IsEmail()
  notificationEmail?: string;

  @IsBoolean()
  notifyNewOrder: boolean;

  @IsBoolean()
  notifyLowStock: boolean;

  @IsBoolean()
  notifyCustomerSignup: boolean;
}
