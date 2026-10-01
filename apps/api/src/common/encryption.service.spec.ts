import { ConfigService } from "@nestjs/config";
import { EncryptionService } from "./encryption.service";

function makeService(key: string): EncryptionService {
  const config = { get: () => key } as unknown as ConfigService;
  return new EncryptionService(config);
}

describe("EncryptionService", () => {
  it("round-trips a plaintext value through encrypt/decrypt", () => {
    const service = makeService("test-encryption-key-1");
    const secret = "rzp_test_1234567890abcdef";

    const encrypted = service.encrypt(secret);

    expect(encrypted).not.toEqual(secret);
    expect(service.decrypt(encrypted)).toEqual(secret);
  });

  it("produces different ciphertext for the same plaintext on each call", () => {
    // a random IV per call is what makes this non-deterministic - without it,
    // encrypting the same Razorpay secret twice would leak that they're identical.
    const service = makeService("test-encryption-key-1");
    const secret = "rzp_test_1234567890abcdef";

    const first = service.encrypt(secret);
    const second = service.encrypt(secret);

    expect(first).not.toEqual(second);
    expect(service.decrypt(first)).toEqual(secret);
    expect(service.decrypt(second)).toEqual(secret);
  });

  it("fails to decrypt with the wrong key instead of silently returning garbage", () => {
    const encrypted = makeService("correct-key").encrypt("rzp_test_secret");
    const wrongKeyService = makeService("wrong-key");

    expect(() => wrongKeyService.decrypt(encrypted)).toThrow();
  });

  it("fails to decrypt tampered ciphertext (authentication tag check)", () => {
    const service = makeService("test-encryption-key-1");
    const encrypted = service.encrypt("rzp_test_secret");

    const tampered = Buffer.from(encrypted, "base64");
    tampered[tampered.length - 1] ^= 0xff; // flip a bit near the end of the ciphertext
    const tamperedBase64 = tampered.toString("base64");

    expect(() => service.decrypt(tamperedBase64)).toThrow();
  });
});
