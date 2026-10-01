import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MulterModule } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname, join } from "path";
import { mkdirSync } from "fs";
import { randomUUID } from "crypto";
import { UploadsController } from "./uploads.controller";
import { AuthenticatedUser } from "../common/types/authenticated-user";

@Module({
  imports: [
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        storage: diskStorage({
          destination: (req, _file, callback) => {
            const storeId = (req.user as AuthenticatedUser | undefined)?.storeId;
            const dir = join(process.cwd(), config.get<string>("UPLOAD_DIR", "uploads"), String(storeId));
            mkdirSync(dir, { recursive: true });
            callback(null, dir);
          },
          filename: (_req, file, callback) => {
            callback(null, `${randomUUID()}${extname(file.originalname)}`);
          },
        }),
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: (_req, file, callback) => {
          if (!/^image\/(png|jpe?g|webp|gif)$/.test(file.mimetype)) {
            return callback(new Error("Only image uploads are allowed"), false);
          }
          callback(null, true);
        },
      }),
    }),
  ],
  controllers: [UploadsController],
})
export class UploadsModule {}
