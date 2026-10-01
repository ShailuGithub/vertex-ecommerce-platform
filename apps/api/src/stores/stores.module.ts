import { Global, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Store } from "./entities/store.entity";
import { StoreExtraCharge } from "./entities/store-extra-charge.entity";
import { StoresService } from "./stores.service";
import { StoresController } from "./stores.controller";
import { StoreSettingsController } from "./store-settings.controller";
import { StoreContextGuard } from "./guards/store-context.guard";

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Store, StoreExtraCharge])],
  controllers: [StoresController, StoreSettingsController],
  providers: [StoresService, StoreContextGuard],
  exports: [StoresService, StoreContextGuard],
})
export class StoresModule {}
