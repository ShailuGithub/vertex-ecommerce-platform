import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { UserRole } from "@vertex/shared-types";
import { MerchantJwtAuthGuard } from "../auth/guards/merchant-jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../common/types/authenticated-user";

@Controller("uploads")
@UseGuards(MerchantJwtAuthGuard, RolesGuard)
@Roles(UserRole.STORE_OWNER, UserRole.STORE_STAFF)
export class UploadsController {
  @Post()
  @UseInterceptors(FileInterceptor("file"))
  uploadFile(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: AuthenticatedUser) {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }
    return { url: `/uploads/${user.storeId}/${file.filename}` };
  }
}
