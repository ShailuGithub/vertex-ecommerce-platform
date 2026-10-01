import { createHmac } from "crypto";
import { BadRequestException } from "@nestjs/common";
import Razorpay from "razorpay";
import { RazorpayService } from "./razorpay.service";
import { EncryptionService } from "../../common/encryption.service";
import { Store } from "../../stores/entities/store.entity";

const KEY_SECRET = "test_key_secret";
const WEBHOOK_SECRET = "test_webhook_secret";

function makeConnectedStore(): Store {
  return {
    id: 1,
    razorpayKeyId: "rzp_test_keyid",
    razorpayKeySecretEncrypted: "encrypted-key-secret-blob",
    razorpayWebhookSecretEncrypted: "encrypted-webhook-secret-blob",
  } as Store;
}

function makeService(): RazorpayService {
  const encryptionService = {
    decrypt: (cipherText: string) => {
      if (cipherText === "encrypted-key-secret-blob") return KEY_SECRET;
      if (cipherText === "encrypted-webhook-secret-blob") return WEBHOOK_SECRET;
      throw new Error(`unexpected ciphertext in test: ${cipherText}`);
    },
  } as unknown as EncryptionService;

  return new RazorpayService(encryptionService);
}

describe("RazorpayService", () => {
  describe("getCredentials", () => {
    it("throws BadRequestException when the store has no Razorpay keys saved", () => {
      const service = makeService();
      const disconnectedStore = { id: 2, razorpayKeyId: null } as Store;

      expect(() => service.getCredentials(disconnectedStore)).toThrow(BadRequestException);
    });
  });

  describe("verifyPaymentSignature", () => {
    it("accepts a signature computed the same way Razorpay computes it", () => {
      const service = makeService();
      const store = makeConnectedStore();
      const orderId = "order_abc123";
      const paymentId = "pay_xyz789";
      const validSignature = createHmac("sha256", KEY_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

      expect(service.verifyPaymentSignature(store, orderId, paymentId, validSignature)).toBe(true);
    });

    it("rejects a forged or mismatched signature", () => {
      const service = makeService();
      const store = makeConnectedStore();

      expect(
        service.verifyPaymentSignature(store, "order_abc123", "pay_xyz789", "not-a-real-signature"),
      ).toBe(false);
    });

    it("rejects a signature computed with the wrong order/payment id (replay across orders)", () => {
      const service = makeService();
      const store = makeConnectedStore();
      const signatureForDifferentOrder = createHmac("sha256", KEY_SECRET)
        .update("order_other|pay_other")
        .digest("hex");

      expect(
        service.verifyPaymentSignature(store, "order_abc123", "pay_xyz789", signatureForDifferentOrder),
      ).toBe(false);
    });
  });

  describe("verifyWebhookSignature", () => {
    it("accepts a signature Razorpay's own utility would produce for this body/secret", () => {
      const service = makeService();
      const store = makeConnectedStore();
      const rawBody = JSON.stringify({ event: "payment.captured" });
      const validSignature = createHmac("sha256", WEBHOOK_SECRET).update(rawBody).digest("hex");

      expect(service.verifyWebhookSignature(store, rawBody, validSignature)).toBe(true);
    });

    it("rejects a webhook signature that doesn't match the body", () => {
      const service = makeService();
      const store = makeConnectedStore();
      const rawBody = JSON.stringify({ event: "payment.captured" });

      expect(service.verifyWebhookSignature(store, rawBody, "bogus-signature")).toBe(false);
    });

    it("rejects a valid signature for a different body (tampered payload)", () => {
      const service = makeService();
      const store = makeConnectedStore();
      const originalBody = JSON.stringify({ event: "payment.captured", amount: 100 });
      const signatureForOriginal = createHmac("sha256", WEBHOOK_SECRET).update(originalBody).digest("hex");
      const tamperedBody = JSON.stringify({ event: "payment.captured", amount: 999999 });

      expect(service.verifyWebhookSignature(store, tamperedBody, signatureForOriginal)).toBe(false);
    });
  });
});

// Sanity check that Razorpay.validateWebhookSignature really is the HMAC-SHA256
// scheme this suite assumes - if the SDK changes its algorithm, this fails loudly
// instead of the service tests above silently testing the wrong thing.
describe("Razorpay.validateWebhookSignature (SDK sanity check)", () => {
  it("matches a manually computed HMAC-SHA256 signature", () => {
    const body = "some body";
    const secret = "some secret";
    const signature = createHmac("sha256", secret).update(body).digest("hex");

    expect(Razorpay.validateWebhookSignature(body, signature, secret)).toBe(true);
  });
});
