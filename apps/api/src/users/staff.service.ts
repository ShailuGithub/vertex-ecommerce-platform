import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserRole } from "@vertex/shared-types";
import * as bcrypt from "bcrypt";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { CreateStaffDto } from "./dto/create-staff.dto";

const SALT_ROUNDS = 10;
const PUBLIC_COLUMNS: (keyof User)[] = [
  "id",
  "email",
  "firstName",
  "lastName",
  "role",
  "isActive",
  "createdAt",
];

export interface PublicStaffMember {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
}

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findAllForStore(storeId: number): Promise<PublicStaffMember[]> {
    return this.usersRepository.find({
      where: { storeId },
      order: { createdAt: "ASC" },
      select: PUBLIC_COLUMNS,
    });
  }

  private findByIdPublic(id: number): Promise<PublicStaffMember | null> {
    return this.usersRepository.findOne({ where: { id }, select: PUBLIC_COLUMNS });
  }

  async create(storeId: number, dto: CreateStaffDto): Promise<PublicStaffMember> {
    const existing = await this.usersRepository.findOne({ where: { email: dto.email.toLowerCase() } });
    if (existing) {
      throw new ConflictException("An account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const staff = this.usersRepository.create({
      email: dto.email.toLowerCase(),
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone ?? null,
      role: UserRole.STORE_STAFF,
      storeId,
    });
    const saved = await this.usersRepository.save(staff);
    return (await this.findByIdPublic(saved.id))!;
  }

  async setActive(
    storeId: number,
    currentUserId: number,
    id: number,
    isActive: boolean,
  ): Promise<PublicStaffMember> {
    if (id === currentUserId) {
      throw new BadRequestException("You cannot deactivate your own account");
    }

    const staff = await this.usersRepository.findOne({ where: { id, storeId } });
    if (!staff) {
      throw new NotFoundException(`Staff member #${id} not found`);
    }

    staff.isActive = isActive;
    await this.usersRepository.save(staff);
    return (await this.findByIdPublic(id))!;
  }
}
