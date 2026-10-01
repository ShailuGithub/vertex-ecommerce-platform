import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Address } from "./entities/address.entity";
import { CreateAddressDto } from "./dto/create-address.dto";
import { UpdateAddressDto } from "./dto/update-address.dto";

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private readonly addressesRepository: Repository<Address>,
  ) {}

  findAllForCustomer(customerId: number): Promise<Address[]> {
    return this.addressesRepository.find({
      where: { customerId },
      order: { isDefault: "DESC", createdAt: "DESC" },
    });
  }

  async findOneForCustomer(customerId: number, id: number): Promise<Address> {
    const address = await this.addressesRepository.findOne({ where: { id, customerId } });
    if (!address) {
      throw new NotFoundException(`Address #${id} not found`);
    }
    return address;
  }

  async create(customerId: number, dto: CreateAddressDto): Promise<Address> {
    const existingCount = await this.addressesRepository.count({ where: { customerId } });
    const makeDefault = dto.isDefault ?? existingCount === 0;

    if (makeDefault) {
      await this.addressesRepository.update({ customerId }, { isDefault: false });
    }

    const address = this.addressesRepository.create({
      customerId,
      label: dto.label ?? null,
      recipientName: dto.recipientName,
      line1: dto.line1,
      line2: dto.line2 ?? null,
      city: dto.city,
      state: dto.state,
      postalCode: dto.postalCode,
      country: dto.country ?? "India",
      phone: dto.phone ?? null,
      isDefault: makeDefault,
    });
    return this.addressesRepository.save(address);
  }

  async update(customerId: number, id: number, dto: UpdateAddressDto): Promise<Address> {
    const address = await this.findOneForCustomer(customerId, id);

    if (dto.isDefault) {
      await this.addressesRepository.update({ customerId }, { isDefault: false });
    }

    Object.assign(address, dto);
    return this.addressesRepository.save(address);
  }

  async setDefault(customerId: number, id: number): Promise<Address> {
    await this.findOneForCustomer(customerId, id); // throws if not found/not owned
    await this.addressesRepository.update({ customerId }, { isDefault: false });
    await this.addressesRepository.update({ id }, { isDefault: true });
    return this.findOneForCustomer(customerId, id);
  }

  async remove(customerId: number, id: number): Promise<void> {
    const address = await this.findOneForCustomer(customerId, id);
    await this.addressesRepository.remove(address);
  }
}
