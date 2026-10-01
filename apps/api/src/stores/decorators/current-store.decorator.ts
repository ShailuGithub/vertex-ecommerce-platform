import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Store } from "../entities/store.entity";

export const CurrentStore = createParamDecorator((_: unknown, ctx: ExecutionContext): Store => {
  const request = ctx.switchToHttp().getRequest();
  return request.store;
});
