import "reflect-metadata";
import * as bcrypt from "bcrypt";
import * as dotenv from "dotenv";
import { StoreStatus, UserRole } from "@vertex/shared-types";
import { AppDataSource } from "./data-source";
import { User } from "../users/entities/user.entity";
import { Store } from "../stores/entities/store.entity";

dotenv.config();

const SALT_ROUNDS = 10;

async function seed() {
  await AppDataSource.initialize();
  const usersRepo = AppDataSource.getRepository(User);
  const storesRepo = AppDataSource.getRepository(Store);

  const platformAdminEmail = process.env.SEED_PLATFORM_ADMIN_EMAIL ?? "platform-admin@vertex.local";
  const platformAdminPassword = process.env.SEED_PLATFORM_ADMIN_PASSWORD ?? "ChangeMe123!";

  const existingPlatformAdmin = await usersRepo.findOne({ where: { email: platformAdminEmail } });
  if (existingPlatformAdmin) {
    console.log(`Platform admin already exists: ${platformAdminEmail}`);
  } else {
    const passwordHash = await bcrypt.hash(platformAdminPassword, SALT_ROUNDS);
    const platformAdmin = usersRepo.create({
      email: platformAdminEmail,
      passwordHash,
      firstName: "Platform",
      lastName: "Admin",
      role: UserRole.PLATFORM_ADMIN,
      storeId: null,
      isActive: true,
    });
    await usersRepo.save(platformAdmin);
    console.log(`Created platform admin: ${platformAdminEmail} / ${platformAdminPassword}`);
  }

  const demoStoreSlug = "demo-store";
  const demoOwnerEmail = process.env.SEED_STORE_OWNER_EMAIL ?? "owner@demo-store.local";
  const demoOwnerPassword = process.env.SEED_STORE_OWNER_PASSWORD ?? "ChangeMe123!";

  let demoStore = await storesRepo.findOne({ where: { slug: demoStoreSlug } });
  if (!demoStore) {
    demoStore = storesRepo.create({ name: "Demo Store", slug: demoStoreSlug, status: StoreStatus.ACTIVE });
    demoStore = await storesRepo.save(demoStore);
    console.log(`Created demo store: ${demoStoreSlug} (#${demoStore.id})`);
  } else {
    console.log(`Demo store already exists: ${demoStoreSlug} (#${demoStore.id})`);
  }

  const existingOwner = await usersRepo.findOne({ where: { email: demoOwnerEmail } });
  if (existingOwner) {
    console.log(`Demo store owner already exists: ${demoOwnerEmail}`);
  } else {
    const passwordHash = await bcrypt.hash(demoOwnerPassword, SALT_ROUNDS);
    const owner = usersRepo.create({
      email: demoOwnerEmail,
      passwordHash,
      firstName: "Demo",
      lastName: "Owner",
      role: UserRole.STORE_OWNER,
      storeId: demoStore.id,
      isActive: true,
    });
    await usersRepo.save(owner);
    console.log(`Created demo store owner: ${demoOwnerEmail} / ${demoOwnerPassword}`);
  }

  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
