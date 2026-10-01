import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { CustomersService } from "../customers/customers.service";
import { Customer } from "../customers/entities/customer.entity";
import { CustomerRegisterDto } from "./dto/customer-register.dto";

const SALT_ROUNDS = 10;

export interface CustomerAuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class CustomerAuthService {
  constructor(
    private readonly customersService: CustomersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async validateCredentials(storeId: number, email: string, password: string): Promise<Customer> {
    const customer = await this.customersService.findByStoreAndEmail(storeId, email);
    if (!customer || !customer.isActive) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const matches = await bcrypt.compare(password, customer.passwordHash);
    if (!matches) {
      throw new UnauthorizedException("Invalid email or password");
    }

    return customer;
  }

  async register(storeId: number, dto: CustomerRegisterDto): Promise<{ customer: Customer; tokens: CustomerAuthTokens }> {
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const customer = await this.customersService.create({
      storeId,
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
    });

    return { customer, tokens: this.issueTokens(customer) };
  }

  login(customer: Customer): { customer: Customer; tokens: CustomerAuthTokens } {
    return { customer, tokens: this.issueTokens(customer) };
  }

  private issueTokens(customer: Customer): CustomerAuthTokens {
    const payload = { sub: customer.id, email: customer.email, storeId: customer.storeId };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>("CUSTOMER_JWT_SECRET"),
      expiresIn: this.config.get<string>("JWT_ACCESS_EXPIRES_IN"),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>("CUSTOMER_JWT_REFRESH_SECRET"),
      expiresIn: this.config.get<string>("JWT_REFRESH_EXPIRES_IN"),
    });

    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string): Promise<CustomerAuthTokens> {
    try {
      const payload = this.jwtService.verify<{ sub: number }>(refreshToken, {
        secret: this.config.get<string>("CUSTOMER_JWT_REFRESH_SECRET"),
      });
      const customer = await this.customersService.findById(payload.sub);
      if (!customer || !customer.isActive) {
        throw new UnauthorizedException("Invalid refresh token");
      }
      return this.issueTokens(customer);
    } catch {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }
}
