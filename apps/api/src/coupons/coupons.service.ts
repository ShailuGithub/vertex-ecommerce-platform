import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CouponType, OrderStatus } from "@vertex/shared-types";
import { Repository } from "typeorm";
import { Coupon } from "./entities/coupon.entity";
import { CouponRedemption } from "./entities/coupon-redemption.entity";
import { CreateCouponDto } from "./dto/create-coupon.dto";
import { UpdateCouponDto } from "./dto/update-coupon.dto";

export interface CouponPricingResult {
  coupon: Coupon;
  discountAmount: number;
}

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponsRepository: Repository<Coupon>,
    @InjectRepository(CouponRedemption)
    private readonly redemptionsRepository: Repository<CouponRedemption>,
  ) {}

  private normalizeCode(code: string): string {
    return code.trim().toUpperCase();
  }

  async create(storeId: number, dto: CreateCouponDto): Promise<Coupon> {
    const code = this.normalizeCode(dto.code);
    const existing = await this.couponsRepository.findOne({ where: { storeId, code } });
    if (existing) {
      throw new BadRequestException(`A coupon with code "${code}" already exists`);
    }

    const coupon = this.couponsRepository.create({
      storeId,
      code,
      type: dto.type,
      value: dto.value,
      minOrderValue: dto.minOrderValue ?? null,
      maxDiscountAmount: dto.maxDiscountAmount ?? null,
      usageLimitTotal: dto.usageLimitTotal ?? null,
      usageLimitPerCustomer: dto.usageLimitPerCustomer ?? null,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      isActive: dto.isActive ?? true,
    });
    return this.couponsRepository.save(coupon);
  }

  findAllForStoreAdmin(storeId: number): Promise<Coupon[]> {
    return this.couponsRepository.find({ where: { storeId }, order: { createdAt: "DESC" } });
  }

  async findByIdForStoreAdmin(storeId: number, id: number): Promise<Coupon> {
    const coupon = await this.couponsRepository.findOne({ where: { id, storeId } });
    if (!coupon) {
      throw new NotFoundException("Coupon not found");
    }
    return coupon;
  }

  async update(storeId: number, id: number, dto: UpdateCouponDto): Promise<Coupon> {
    const coupon = await this.findByIdForStoreAdmin(storeId, id);

    if (dto.code !== undefined) {
      const code = this.normalizeCode(dto.code);
      if (code !== coupon.code) {
        const existing = await this.couponsRepository.findOne({ where: { storeId, code } });
        if (existing) {
          throw new BadRequestException(`A coupon with code "${code}" already exists`);
        }
      }
      coupon.code = code;
    }
    if (dto.type !== undefined) coupon.type = dto.type;
    if (dto.value !== undefined) coupon.value = dto.value;
    if (dto.minOrderValue !== undefined) coupon.minOrderValue = dto.minOrderValue;
    if (dto.maxDiscountAmount !== undefined) coupon.maxDiscountAmount = dto.maxDiscountAmount;
    if (dto.usageLimitTotal !== undefined) coupon.usageLimitTotal = dto.usageLimitTotal;
    if (dto.usageLimitPerCustomer !== undefined) coupon.usageLimitPerCustomer = dto.usageLimitPerCustomer;
    if (dto.startsAt !== undefined) coupon.startsAt = dto.startsAt ? new Date(dto.startsAt) : null;
    if (dto.expiresAt !== undefined) coupon.expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;
    if (dto.isActive !== undefined) coupon.isActive = dto.isActive;

    return this.couponsRepository.save(coupon);
  }

  async setStatus(storeId: number, id: number, isActive: boolean): Promise<Coupon> {
    const coupon = await this.findByIdForStoreAdmin(storeId, id);
    coupon.isActive = isActive;
    return this.couponsRepository.save(coupon);
  }

  async findRedemptions(storeId: number, couponId: number): Promise<CouponRedemption[]> {
    await this.findByIdForStoreAdmin(storeId, couponId);
    return this.redemptionsRepository.find({ where: { storeId, couponId }, order: { createdAt: "DESC" } });
  }

  private async countRedemptions(
    storeId: number,
    couponId: number,
    customerId?: number,
  ): Promise<number> {
    const qb = this.redemptionsRepository
      .createQueryBuilder("r")
      .innerJoin("orders", "o", "o.id = r.orderId")
      .where("r.storeId = :storeId", { storeId })
      .andWhere("r.couponId = :couponId", { couponId })
      .andWhere("o.status != :cancelled", { cancelled: OrderStatus.CANCELLED });
    if (customerId !== undefined) {
      qb.andWhere("r.customerId = :customerId", { customerId });
    }
    return qb.getCount();
  }

  async validateAndPrice(
    storeId: number,
    customerId: number | null,
    code: string,
    cartSubtotal: number,
  ): Promise<CouponPricingResult> {
    const normalized = this.normalizeCode(code);
    const coupon = await this.couponsRepository.findOne({ where: { storeId, code: normalized } });
    if (!coupon) {
      throw new BadRequestException("Invalid coupon code");
    }
    if (!coupon.isActive) {
      throw new BadRequestException("This coupon is no longer active");
    }
    const now = new Date();
    if (coupon.startsAt && now < coupon.startsAt) {
      throw new BadRequestException("This coupon is not active yet");
    }
    if (coupon.expiresAt && now > coupon.expiresAt) {
      throw new BadRequestException("This coupon has expired");
    }
    if (coupon.minOrderValue !== null && cartSubtotal < Number(coupon.minOrderValue)) {
      throw new BadRequestException(`This coupon requires a minimum order of ₹${coupon.minOrderValue}`);
    }
    if (coupon.usageLimitTotal !== null) {
      const totalUses = await this.countRedemptions(storeId, coupon.id);
      if (totalUses >= coupon.usageLimitTotal) {
        throw new BadRequestException("This coupon has reached its usage limit");
      }
    }
    if (coupon.usageLimitPerCustomer !== null && customerId !== null) {
      const customerUses = await this.countRedemptions(storeId, coupon.id, customerId);
      if (customerUses >= coupon.usageLimitPerCustomer) {
        throw new BadRequestException("You've already used this coupon the maximum number of times");
      }
    }

    let discountAmount: number;
    if (coupon.type === CouponType.PERCENTAGE) {
      discountAmount = (cartSubtotal * Number(coupon.value)) / 100;
      if (coupon.maxDiscountAmount !== null) {
        discountAmount = Math.min(discountAmount, Number(coupon.maxDiscountAmount));
      }
    } else {
      discountAmount = Number(coupon.value);
    }
    discountAmount = Math.min(discountAmount, cartSubtotal);
    discountAmount = Math.round(discountAmount * 100) / 100;

    return { coupon, discountAmount };
  }

  async recordRedemption(
    storeId: number,
    couponId: number,
    customerId: number,
    orderId: number,
    discountAmount: number,
  ): Promise<void> {
    await this.redemptionsRepository.save(
      this.redemptionsRepository.create({ storeId, couponId, customerId, orderId, discountAmount }),
    );
  }
}
