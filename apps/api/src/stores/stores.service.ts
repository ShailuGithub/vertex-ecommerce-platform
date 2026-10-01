import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { StoreStatus } from "@vertex/shared-types";
import { Repository } from "typeorm";
import { Store } from "./entities/store.entity";
import { StoreExtraCharge } from "./entities/store-extra-charge.entity";
import { UpdateStoreProfileDto } from "./dto/update-store-profile.dto";
import { UpdateStoreDomainDto } from "./dto/update-store-domain.dto";
import { UpdateStorePoliciesDto } from "./dto/update-store-policies.dto";
import { UpdateStoreDeliveryDto } from "./dto/update-store-delivery.dto";
import { UpdateStoreTimingsDto } from "./dto/update-store-timings.dto";
import { UpdateStoreTaxDto } from "./dto/update-store-tax.dto";
import { UpdateStoreReturnsDto } from "./dto/update-store-returns.dto";
import { UpdateStoreSupportSocialDto } from "./dto/update-store-support-social.dto";
import { UpdateStoreSeoDto } from "./dto/update-store-seo.dto";
import { UpdateStoreNotificationsDto } from "./dto/update-store-notifications.dto";
import { CreateExtraChargeDto } from "./dto/create-extra-charge.dto";
import { UpdateExtraChargeDto } from "./dto/update-extra-charge.dto";

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private readonly storesRepository: Repository<Store>,
    @InjectRepository(StoreExtraCharge)
    private readonly extraChargesRepository: Repository<StoreExtraCharge>,
  ) {}

  findAll(): Promise<Store[]> {
    return this.storesRepository.find({ order: { createdAt: "DESC" } });
  }

  async findById(id: number): Promise<Store> {
    const store = await this.storesRepository.findOne({ where: { id } });
    if (!store) {
      throw new NotFoundException(`Store #${id} not found`);
    }
    return store;
  }

  async findActiveBySlug(slug: string): Promise<Store> {
    const store = await this.storesRepository.findOne({ where: { slug } });
    if (!store || store.status !== StoreStatus.ACTIVE) {
      throw new NotFoundException(`Store "${slug}" not found`);
    }
    return store;
  }

  async create(name: string, slug: string): Promise<Store> {
    const existing = await this.storesRepository.findOne({ where: { slug } });
    if (existing) {
      throw new ConflictException(`Store slug "${slug}" already in use`);
    }
    const store = this.storesRepository.create({ name, slug, status: StoreStatus.ACTIVE });
    return this.storesRepository.save(store);
  }

  async setStatus(id: number, status: StoreStatus): Promise<Store> {
    const store = await this.findById(id);
    store.status = status;
    return this.storesRepository.save(store);
  }

  async saveRazorpayCredentials(
    id: number,
    keyId: string,
    keySecretEncrypted: string,
    webhookSecretEncrypted: string,
  ): Promise<Store> {
    const store = await this.findById(id);
    store.razorpayKeyId = keyId;
    store.razorpayKeySecretEncrypted = keySecretEncrypted;
    store.razorpayWebhookSecretEncrypted = webhookSecretEncrypted;
    return this.storesRepository.save(store);
  }

  async updateProfile(id: number, dto: UpdateStoreProfileDto): Promise<Store> {
    const store = await this.findById(id);
    if (dto.name !== undefined) store.name = dto.name;
    if (dto.contactEmail !== undefined) store.contactEmail = dto.contactEmail;
    if (dto.contactPhone !== undefined) store.contactPhone = dto.contactPhone;
    if (dto.addressLine1 !== undefined) store.addressLine1 = dto.addressLine1;
    if (dto.addressLine2 !== undefined) store.addressLine2 = dto.addressLine2;
    if (dto.city !== undefined) store.city = dto.city;
    if (dto.state !== undefined) store.state = dto.state;
    if (dto.postalCode !== undefined) store.postalCode = dto.postalCode;
    if (dto.country !== undefined) store.country = dto.country;
    return this.storesRepository.save(store);
  }

  async updateDomain(id: number, dto: UpdateStoreDomainDto): Promise<Store> {
    const store = await this.findById(id);
    const domain = dto.customDomain?.trim() || null;
    if (domain) {
      const existing = await this.storesRepository.findOne({ where: { customDomain: domain } });
      if (existing && existing.id !== id) {
        throw new ConflictException(`Domain "${domain}" is already in use by another store`);
      }
    }
    store.customDomain = domain;
    return this.storesRepository.save(store);
  }

  async updatePolicies(id: number, dto: UpdateStorePoliciesDto): Promise<Store> {
    const store = await this.findById(id);
    if (dto.checkoutPolicyText !== undefined) store.checkoutPolicyText = dto.checkoutPolicyText;
    if (dto.taxPolicyText !== undefined) store.taxPolicyText = dto.taxPolicyText;
    if (dto.returnsPolicyText !== undefined) store.returnsPolicyText = dto.returnsPolicyText;
    return this.storesRepository.save(store);
  }

  async updateDelivery(id: number, dto: UpdateStoreDeliveryDto): Promise<Store> {
    const store = await this.findById(id);
    store.deliveryChargeType = dto.deliveryChargeType;
    store.deliveryChargeAmount = dto.deliveryChargeAmount;
    store.freeDeliveryAboveAmount = dto.freeDeliveryAboveAmount ?? null;
    store.averageDeliveryTime = dto.averageDeliveryTime ?? null;
    return this.storesRepository.save(store);
  }

  async updateTimings(id: number, dto: UpdateStoreTimingsDto): Promise<Store> {
    const store = await this.findById(id);
    store.storeTimingsJson = JSON.stringify(dto.timings);
    return this.storesRepository.save(store);
  }

  async updateTax(id: number, dto: UpdateStoreTaxDto): Promise<Store> {
    const store = await this.findById(id);
    store.taxEnabled = dto.taxEnabled;
    store.taxRatePercent = dto.taxRatePercent ?? null;
    store.taxInclusive = dto.taxInclusive;
    return this.storesRepository.save(store);
  }

  async updateReturns(id: number, dto: UpdateStoreReturnsDto): Promise<Store> {
    const store = await this.findById(id);
    store.returnsEnabled = dto.returnsEnabled;
    store.returnWindowDays = dto.returnWindowDays ?? null;
    return this.storesRepository.save(store);
  }

  async updateSupportSocial(id: number, dto: UpdateStoreSupportSocialDto): Promise<Store> {
    const store = await this.findById(id);
    if (dto.supportEmail !== undefined) store.supportEmail = dto.supportEmail || null;
    if (dto.supportPhone !== undefined) store.supportPhone = dto.supportPhone || null;
    if (dto.whatsappNumber !== undefined) store.whatsappNumber = dto.whatsappNumber || null;
    if (dto.facebookUrl !== undefined) store.facebookUrl = dto.facebookUrl || null;
    if (dto.instagramUrl !== undefined) store.instagramUrl = dto.instagramUrl || null;
    if (dto.twitterUrl !== undefined) store.twitterUrl = dto.twitterUrl || null;
    if (dto.youtubeUrl !== undefined) store.youtubeUrl = dto.youtubeUrl || null;
    return this.storesRepository.save(store);
  }

  async updateSeo(id: number, dto: UpdateStoreSeoDto): Promise<Store> {
    const store = await this.findById(id);
    if (dto.seoTitle !== undefined) store.seoTitle = dto.seoTitle || null;
    if (dto.seoDescription !== undefined) store.seoDescription = dto.seoDescription || null;
    if (dto.seoKeywords !== undefined) store.seoKeywords = dto.seoKeywords || null;
    return this.storesRepository.save(store);
  }

  async updateNotifications(id: number, dto: UpdateStoreNotificationsDto): Promise<Store> {
    const store = await this.findById(id);
    store.notificationEmail = dto.notificationEmail || null;
    store.notifyNewOrder = dto.notifyNewOrder;
    store.notifyLowStock = dto.notifyLowStock;
    store.notifyCustomerSignup = dto.notifyCustomerSignup;
    return this.storesRepository.save(store);
  }

  findExtraCharges(storeId: number): Promise<StoreExtraCharge[]> {
    return this.extraChargesRepository.find({ where: { storeId }, order: { createdAt: "ASC" } });
  }

  createExtraCharge(storeId: number, dto: CreateExtraChargeDto): Promise<StoreExtraCharge> {
    const charge = this.extraChargesRepository.create({
      storeId,
      name: dto.name,
      type: dto.type,
      amount: dto.amount,
    });
    return this.extraChargesRepository.save(charge);
  }

  async updateExtraCharge(storeId: number, id: number, dto: UpdateExtraChargeDto): Promise<StoreExtraCharge> {
    const charge = await this.extraChargesRepository.findOne({ where: { id, storeId } });
    if (!charge) {
      throw new NotFoundException(`Extra charge #${id} not found`);
    }
    if (dto.name !== undefined) charge.name = dto.name;
    if (dto.type !== undefined) charge.type = dto.type;
    if (dto.amount !== undefined) charge.amount = dto.amount;
    if (dto.isActive !== undefined) charge.isActive = dto.isActive;
    return this.extraChargesRepository.save(charge);
  }

  async deleteExtraCharge(storeId: number, id: number): Promise<void> {
    const charge = await this.extraChargesRepository.findOne({ where: { id, storeId } });
    if (!charge) {
      throw new NotFoundException(`Extra charge #${id} not found`);
    }
    await this.extraChargesRepository.remove(charge);
  }
}
