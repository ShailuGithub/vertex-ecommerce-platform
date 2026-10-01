import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthenticatedCustomer } from "../../common/types/authenticated-customer";

function cookieExtractor(req: Request): string | null {
  return req?.cookies?.customer_access_token ?? null;
}

@Injectable()
export class CustomerJwtStrategy extends PassportStrategy(Strategy, "customer-jwt") {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get<string>("CUSTOMER_JWT_SECRET")!,
    });
  }

  validate(payload: { sub: number; email: string; storeId: number }): AuthenticatedCustomer {
    return { customerId: payload.sub, email: payload.email, storeId: payload.storeId };
  }
}
