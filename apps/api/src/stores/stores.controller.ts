import { Controller, Get, Param } from "@nestjs/common";
import { StoresService } from "./stores.service";

@Controller("stores")
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get(":storeSlug")
  async getStore(@Param("storeSlug") storeSlug: string) {
    const store = await this.storesService.findActiveBySlug(storeSlug);
    return { id: store.id, name: store.name, slug: store.slug };
  }
}
