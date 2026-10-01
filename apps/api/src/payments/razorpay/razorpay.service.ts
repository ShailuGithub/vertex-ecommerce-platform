import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { createHmac } from "crypto";
import Razorpay from "razorpay";
import { EncryptionService } from "../../common/encryption.service";
import { Store } from "../../stores/entities/store.entity";

export interface RazorpayCredentials {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
}

@Injectable()
export class RazorpayService {
  private readonly logger = new Logger(RazorpayService.name);

  constructor(private readonly encryptionService: EncryptionService) {}

  getCredentials(store: Store): RazorpayCredentials {
    if (!store.razorpayKeyId || !store.razorpayKeySecretEncrypted || !store.razorpayWebhookSecretEncrypted) {
      throw new BadRequestException("This store has not connected a Razorpay account yet");
    }
    return {
      keyId: store.razorpayKeyId,
      keySecret: this.encryptionService.decrypt(store.razorpayKeySecretEncrypted),
      webhookSecret: this.encryptionService.decrypt(store.razorpayWebhookSecretEncrypted),
    };
  }

  private getClient(store: Store): Razorpay {
    const { keyId, keySecret } = this.getCredentials(store);
    return new Razorpay({ key_id: keyId, key_secret: keySecret });
  }

  async createOrder(store: Store, amountInRupees: number, receipt: string) {
    const client = this.getClient(store);
    try {
      return await client.orders.create({
        amount: Math.round(amountInRupees * 100),
        currency: "INR",
        receipt,
      });
    } catch (err) {
      this.logger.error(`Razorpay order creation failed for store #${store.id}`, err as Error);
      throw new BadRequestException(
        "Could not reach Razorpay with this store's saved keys. Check the Key ID/Secret in store settings.",
      );
    }
  }

  verifyPaymentSignature(
    store: Store,
    razorpayOrderId: string,
    razorpayPaymentId: string,
    signature: string,
  ): boolean {
    const { keySecret } = this.getCredentials(store);
    const expected = createHmac("sha256", keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");
    return expected === signature;
  }

  verifyWebhookSignature(store: Store, rawBody: string, signature: string): boolean {
    const { webhookSecret } = this.getCredentials(store);
    return Razorpay.validateWebhookSignature(rawBody, signature, webhookSecret);
  }
}
