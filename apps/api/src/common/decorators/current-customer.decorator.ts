import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { AuthenticatedCustomer } from "../types/authenticated-customer";

export const CurrentCustomer = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AuthenticatedCustomer => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
