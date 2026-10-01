import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Inventory } from "./entities/inventory.entity";

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
  ) {}

  createForVariant(variantId: number, quantityOnHand = 0, lowStockThreshold = 5): Promise<Inventory> {
    const inventory = this.inventoryRepository.create({
      variantId,
      quantityOnHand,
      lowStockThreshold,
    });
    return this.inventoryRepository.save(inventory);
  }

  findByVariantId(variantId: number): Promise<Inventory | null> {
    return this.inventoryRepository.findOne({ where: { variantId } });
  }

  async setQuantity(variantId: number, quantityOnHand: number): Promise<Inventory | null> {
    await this.inventoryRepository.update({ variantId }, { quantityOnHand });
    return this.findByVariantId(variantId);
  }

  async decrement(variantId: number, quantity: number): Promise<void> {
    await this.inventoryRepository.decrement({ variantId }, "quantityOnHand", quantity);
  }
}
