import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { OrderStatus } from "@vertex/shared-types";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { Repository } from "typeorm";
import { Order } from "../orders/entities/order.entity";
import { Customer } from "./entities/customer.entity";
import { CreateCustomerDto } from "./dto/create-customer.dto";

const REVENUE_EXCLUDED_STATUSES = [OrderStatus.PENDING_PAYMENT, OrderStatus.CANCELLED];
const SALT_ROUNDS = 10;

export interface CustomerWithStats {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  city: string | null;
  isActive: boolean;
  createdAt: Date;
  orderCount: number;
  lifetimeSpend: number;
}

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customersRepository: Repository<Customer>,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
  ) {}

  findByStoreAndEmail(storeId: number, email: string): Promise<Customer | null> {
    return this.customersRepository.findOne({ where: { storeId, email: email.toLowerCase() } });
  }

  findById(id: number): Promise<Customer | null> {
    return this.customersRepository.findOne({ where: { id } });
  }

  async create(params: {
    storeId: number;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }): Promise<Customer> {
    const existing = await this.findByStoreAndEmail(params.storeId, params.email);
    if (existing) {
      throw new ConflictException("An account with this email already exists for this store");
    }

    const customer = this.customersRepository.create({
      storeId: params.storeId,
      email: params.email.toLowerCase(),
      passwordHash: params.passwordHash,
      firstName: params.firstName,
      lastName: params.lastName,
      phone: params.phone ?? null,
    });
    return this.customersRepository.save(customer);
  }

  async findAllForStoreAdmin(storeId: number, search?: string): Promise<CustomerWithStats[]> {
    const qb = this.customersRepository
      .createQueryBuilder("c")
      .leftJoin(
        Order,
        "o",
        "o.customerId = c.id AND o.storeId = c.storeId AND o.status NOT IN (:...excluded)",
        { excluded: REVENUE_EXCLUDED_STATUSES },
      )
      .leftJoin("c.addresses", "a", "a.isDefault = 1")
      .select([
        "c.id AS id",
        "c.email AS email",
        "c.firstName AS firstName",
        "c.lastName AS lastName",
        "c.phone AS phone",
        "c.isActive AS isActive",
        "c.createdAt AS createdAt",
        "a.city AS city",
      ])
      .addSelect("COUNT(o.id)", "orderCount")
      .addSelect("COALESCE(SUM(o.total), 0)", "lifetimeSpend")
      .where("c.storeId = :storeId", { storeId })
      .groupBy("c.id, c.email, c.firstName, c.lastName, c.phone, c.isActive, c.createdAt, a.city")
      .orderBy("c.createdAt", "DESC");

    if (search) {
      qb.andWhere(
        "(c.email LIKE :search OR c.firstName LIKE :search OR c.lastName LIKE :search)",
        { search: `%${search}%` },
      );
    }

    const rows = await qb.getRawMany();
    return rows.map((row) => ({
      id: row.id,
      email: row.email,
      firstName: row.firstName,
      lastName: row.lastName,
      phone: row.phone,
      city: row.city,
      isActive: row.isActive,
      createdAt: row.createdAt,
      orderCount: Number(row.orderCount),
      lifetimeSpend: Number(row.lifetimeSpend),
    }));
  }

  async createByStoreAdmin(storeId: number, dto: CreateCustomerDto): Promise<Omit<Customer, "passwordHash">> {
    const existing = await this.findByStoreAndEmail(storeId, dto.email);
    if (existing) {
      throw new ConflictException("A customer with this email already exists for this store");
    }

    const randomPassword = crypto.randomBytes(24).toString("hex");
    const passwordHash = await bcrypt.hash(randomPassword, SALT_ROUNDS);

    const customer = this.customersRepository.create({
      storeId,
      email: dto.email.toLowerCase(),
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone ?? null,
    });
    const saved = await this.customersRepository.save(customer);
    const { passwordHash: _passwordHash, ...safeCustomer } = saved;
    return safeCustomer;
  }

  async findDetailForStoreAdmin(storeId: number, id: number) {
    const customer = await this.customersRepository.findOne({
      where: { id, storeId },
      relations: ["addresses"],
    });
    if (!customer) {
      throw new NotFoundException("Customer not found");
    }

    const orders = await this.ordersRepository.find({
      where: { storeId, customerId: id },
      order: { createdAt: "DESC" },
    });

    const { passwordHash: _passwordHash, ...safeCustomer } = customer;
    return { ...safeCustomer, orders };
  }
}
