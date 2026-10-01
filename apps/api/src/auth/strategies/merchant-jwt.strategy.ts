import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthenticatedUser } from "../../common/types/authenticated-user";

function cookieExtractor(req: Request): string | null {
  return req?.cookies?.merchant_access_token ?? null;
}

@Injectable()
export class MerchantJwtStrategy extends PassportStrategy(Strategy, "merchant-jwt") {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get<string>("JWT_SECRET")!,
    });
  }

  validate(payload: {
    sub: number;
    email: string;
    role: AuthenticatedUser["role"];
    storeId: number | null;
  }): AuthenticatedUser {
    return { userId: payload.sub, email: payload.email, role: payload.role, storeId: payload.storeId };
  }
}
