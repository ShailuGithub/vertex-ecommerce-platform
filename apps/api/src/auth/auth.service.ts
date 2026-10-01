import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { StoreStatus, UserRole } from "@vertex/shared-types";
import * as bcrypt from "bcrypt";
import { UsersService } from "../users/users.service";
import { User } from "../users/entities/user.entity";
import { StoresService } from "../stores/stores.service";
import { Store } from "../stores/entities/store.entity";
import { RegisterStoreDto } from "./dto/register-store.dto";

const SALT_ROUNDS = 10;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly storesService: StoresService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async validateCredentials(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.isActive) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) {
      throw new UnauthorizedException("Invalid email or password");
    }

    if (user.storeId) {
      const store = await this.storesService.findById(user.storeId);
      if (store.status !== StoreStatus.ACTIVE) {
        throw new UnauthorizedException("This store is currently suspended");
      }
    }

    return user;
  }

  async registerStore(dto: RegisterStoreDto): Promise<{ user: User; store: Store; tokens: AuthTokens }> {
    const store = await this.storesService.create(dto.storeName, dto.storeSlug);

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.usersService.createUser({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      role: UserRole.STORE_OWNER,
      storeId: store.id,
    });

    return { user, store, tokens: this.issueTokens(user) };
  }

  login(user: User): { user: User; tokens: AuthTokens } {
    return { user, tokens: this.issueTokens(user) };
  }

  private issueTokens(user: User): AuthTokens {
    const payload = { sub: user.id, email: user.email, role: user.role, storeId: user.storeId };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>("JWT_SECRET"),
      expiresIn: this.config.get<string>("JWT_ACCESS_EXPIRES_IN"),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>("JWT_REFRESH_SECRET"),
      expiresIn: this.config.get<string>("JWT_REFRESH_EXPIRES_IN"),
    });

    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = this.jwtService.verify<{ sub: number }>(refreshToken, {
        secret: this.config.get<string>("JWT_REFRESH_SECRET"),
      });
      const user = await this.usersService.findById(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException("Invalid refresh token");
      }
      return this.issueTokens(user);
    } catch {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }
}
