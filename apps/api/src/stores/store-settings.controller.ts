import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { UserRole } from "@vertex/shared-types";
import { MerchantJwtAuthGuard } from "../auth/guards/merchant-jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { EncryptionService } from "../common/encryption.service";
import { StoresService } from "./stores.service";
import { Store } from "./entities/store.entity";
import { UpdateRazorpayCredentialsDto } from "./dto/update-razorpay-credentials.dto";
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

@Controller("store/settings")
@UseGuards(MerchantJwtAuthGuard, RolesGuard)
@Roles(UserRole.STORE_OWNER)
export class StoreSettingsController {
  constructor(
    private readonly storesService: StoresService,
    private readonly encryptionService: EncryptionService,
  ) {}

  private toSettingsResponse(store: Store) {
    return {
      id: store.id,
      name: store.name,
      slug: store.slug,
      razorpayKeyId: store.razorpayKeyId,
      razorpayConnected: Boolean(store.razorpayKeyId && store.razorpayKeySecretEncrypted),
      contactEmail: store.contactEmail,
      contactPhone: store.contactPhone,
      addressLine1: store.addressLine1,
      addressLine2: store.addressLine2,
      city: store.city,
      state: store.state,
      postalCode: store.postalCode,
      country: store.country,
      customDomain: store.customDomain,
      checkoutPolicyText: store.checkoutPolicyText,
      taxPolicyText: store.taxPolicyText,
      returnsPolicyText: store.returnsPolicyText,
      deliveryChargeType: store.deliveryChargeType,
      deliveryChargeAmount: store.deliveryChargeAmount,
      freeDeliveryAboveAmount: store.freeDeliveryAboveAmount,
      averageDeliveryTime: store.averageDeliveryTime,
      storeTimings: store.storeTimingsJson ? JSON.parse(store.storeTimingsJson) : [],
      taxEnabled: store.taxEnabled,
      taxRatePercent: store.taxRatePercent,
      taxInclusive: store.taxInclusive,
      returnsEnabled: store.returnsEnabled,
      returnWindowDays: store.returnWindowDays,
      supportEmail: store.supportEmail,
      supportPhone: store.supportPhone,
      whatsappNumber: store.whatsappNumber,
      facebookUrl: store.facebookUrl,
      instagramUrl: store.instagramUrl,
      twitterUrl: store.twitterUrl,
      youtubeUrl: store.youtubeUrl,
      seoTitle: store.seoTitle,
      seoDescription: store.seoDescription,
      seoKeywords: store.seoKeywords,
      notificationEmail: store.notificationEmail,
      notifyNewOrder: store.notifyNewOrder,
      notifyLowStock: store.notifyLowStock,
      notifyCustomerSignup: store.notifyCustomerSignup,
    };
  }

  @Get()
  async getSettings(@CurrentUser() user: AuthenticatedUser) {
    const store = await this.storesService.findById(user.storeId!);
    return this.toSettingsResponse(store);
  }

  @Patch("razorpay")
  async updateRazorpay(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateRazorpayCredentialsDto) {
    const store = await this.storesService.saveRazorpayCredentials(
      user.storeId!,
      dto.razorpayKeyId,
      this.encryptionService.encrypt(dto.razorpayKeySecret),
      this.encryptionService.encrypt(dto.razorpayWebhookSecret),
    );
    return {
      razorpayKeyId: store.razorpayKeyId,
      razorpayConnected: true,
    };
  }

  @Patch("profile")
  async updateProfile(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateStoreProfileDto) {
    const store = await this.storesService.updateProfile(user.storeId!, dto);
    return this.toSettingsResponse(store);
  }

  @Patch("domain")
  async updateDomain(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateStoreDomainDto) {
    const store = await this.storesService.updateDomain(user.storeId!, dto);
    return this.toSettingsResponse(store);
  }

  @Patch("policies")
  async updatePolicies(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateStorePoliciesDto) {
    const store = await this.storesService.updatePolicies(user.storeId!, dto);
    return this.toSettingsResponse(store);
  }

  @Patch("delivery")
  async updateDelivery(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateStoreDeliveryDto) {
    const store = await this.storesService.updateDelivery(user.storeId!, dto);
    return this.toSettingsResponse(store);
  }

  @Patch("timings")
  async updateTimings(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateStoreTimingsDto) {
    const store = await this.storesService.updateTimings(user.storeId!, dto);
    return this.toSettingsResponse(store);
  }

  @Patch("tax")
  async updateTax(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateStoreTaxDto) {
    const store = await this.storesService.updateTax(user.storeId!, dto);
    return this.toSettingsResponse(store);
  }

  @Patch("returns")
  async updateReturns(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateStoreReturnsDto) {
    const store = await this.storesService.updateReturns(user.storeId!, dto);
    return this.toSettingsResponse(store);
  }

  @Patch("support-social")
  async updateSupportSocial(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateStoreSupportSocialDto) {
    const store = await this.storesService.updateSupportSocial(user.storeId!, dto);
    return this.toSettingsResponse(store);
  }

  @Patch("seo")
  async updateSeo(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateStoreSeoDto) {
    const store = await this.storesService.updateSeo(user.storeId!, dto);
    return this.toSettingsResponse(store);
  }

  @Patch("notifications")
  async updateNotifications(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateStoreNotificationsDto) {
    const store = await this.storesService.updateNotifications(user.storeId!, dto);
    return this.toSettingsResponse(store);
  }

  @Get("extra-charges")
  getExtraCharges(@CurrentUser() user: AuthenticatedUser) {
    return this.storesService.findExtraCharges(user.storeId!);
  }

  @Post("extra-charges")
  createExtraCharge(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateExtraChargeDto) {
    return this.storesService.createExtraCharge(user.storeId!, dto);
  }

  @Patch("extra-charges/:id")
  updateExtraCharge(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateExtraChargeDto,
  ) {
    return this.storesService.updateExtraCharge(user.storeId!, id, dto);
  }

  @Delete("extra-charges/:id")
  deleteExtraCharge(@CurrentUser() user: AuthenticatedUser, @Param("id", ParseIntPipe) id: number) {
    return this.storesService.deleteExtraCharge(user.storeId!, id);
  }
}
