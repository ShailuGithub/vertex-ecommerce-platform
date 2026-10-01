import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { StoresService } from "../stores.service";

@Injectable()
export class StoreContextGuard implements CanActivate {
  constructor(private readonly storesService: StoresService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const slug = request.params.storeSlug;
    request.store = await this.storesService.findActiveBySlug(slug);
    return true;
  }
}
