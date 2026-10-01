import { IsEnum } from "class-validator";
import { StoreStatus } from "@vertex/shared-types";

export class UpdateStoreStatusDto {
  @IsEnum(StoreStatus)
  status: StoreStatus;
}
