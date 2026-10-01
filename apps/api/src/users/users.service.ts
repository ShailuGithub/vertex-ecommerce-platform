import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserRole } from "@vertex/shared-types";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email: email.toLowerCase() } });
  }

  findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async createUser(params: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: UserRole;
    storeId: number | null;
  }): Promise<User> {
    const existing = await this.findByEmail(params.email);
    if (existing) {
      throw new ConflictException("An account with this email already exists");
    }

    const user = this.usersRepository.create({
      email: params.email.toLowerCase(),
      passwordHash: params.passwordHash,
      firstName: params.firstName,
      lastName: params.lastName,
      phone: params.phone ?? null,
      role: params.role,
      storeId: params.storeId,
    });

    return this.usersRepository.save(user);
  }
}
