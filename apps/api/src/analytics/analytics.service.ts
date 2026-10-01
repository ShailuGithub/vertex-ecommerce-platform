import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { OrderStatus } from "@vertex/shared-types";
import { Repository } from "typeorm";
import { Order } from "../orders/entities/order.entity";
import { OrderItem } from "../orders/entities/order-item.entity";

const REVENUE_EXCLUDED_STATUSES = [OrderStatus.PENDING_PAYMENT, OrderStatus.CANCELLED];

export interface StatusBreakdownRow {
  status: OrderStatus;
  count: number;
  total: number;
}

export interface TrendPoint {
  day: string;
  count: number;
  total: number;
}

export interface TopProductRow {
  productName: string;
  quantity: number;
  revenue: number;
}

export interface AnalyticsSummary {
  revenueThisMonth: number;
  orderCountThisMonth: number;
  avgOrderValueThisMonth: number;
  statusBreakdown: StatusBreakdownRow[];
  trend: TrendPoint[];
  topProducts: TopProductRow[];
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemsRepository: Repository<OrderItem>,
  ) {}

  async getSummary(storeId: number, days = 30): Promise<AnalyticsSummary> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const trendStart = new Date();
    trendStart.setDate(trendStart.getDate() - (days - 1));
    trendStart.setHours(0, 0, 0, 0);

    const thisMonth = await this.ordersRepository
      .createQueryBuilder("o")
      .select("COUNT(o.id)", "count")
      .addSelect("COALESCE(SUM(o.total), 0)", "total")
      .where("o.storeId = :storeId", { storeId })
      .andWhere("o.createdAt >= :startOfMonth", { startOfMonth })
      .andWhere("o.status NOT IN (:...excluded)", { excluded: REVENUE_EXCLUDED_STATUSES })
      .getRawOne<{ count: string; total: string }>();

    const orderCountThisMonth = Number(thisMonth?.count ?? 0);
    const revenueThisMonth = Number(thisMonth?.total ?? 0);

    const statusRows = await this.ordersRepository
      .createQueryBuilder("o")
      .select("o.status", "status")
      .addSelect("COUNT(o.id)", "count")
      .addSelect("COALESCE(SUM(o.total), 0)", "total")
      .where("o.storeId = :storeId", { storeId })
      .groupBy("o.status")
      .getRawMany<{ status: OrderStatus; count: string; total: string }>();

    const statusBreakdown: StatusBreakdownRow[] = statusRows.map((row) => ({
      status: row.status,
      count: Number(row.count),
      total: Number(row.total),
    }));

    const trendRows = await this.ordersRepository
      .createQueryBuilder("o")
      .select("CAST(o.createdAt AS DATE)", "day")
      .addSelect("COUNT(o.id)", "count")
      .addSelect("COALESCE(SUM(o.total), 0)", "total")
      .where("o.storeId = :storeId", { storeId })
      .andWhere("o.createdAt >= :trendStart", { trendStart })
      .andWhere("o.status NOT IN (:...excluded)", { excluded: REVENUE_EXCLUDED_STATUSES })
      .groupBy("CAST(o.createdAt AS DATE)")
      .orderBy("CAST(o.createdAt AS DATE)", "ASC")
      .getRawMany<{ day: string; count: string; total: string }>();

    const trend: TrendPoint[] = trendRows.map((row) => ({
      day: new Date(row.day).toISOString().slice(0, 10),
      count: Number(row.count),
      total: Number(row.total),
    }));

    const topProductRows = await this.orderItemsRepository
      .createQueryBuilder("oi")
      .innerJoin(Order, "o", "o.id = oi.orderId")
      .select("oi.productNameSnapshot", "productName")
      .addSelect("SUM(oi.quantity)", "quantity")
      .addSelect("SUM(oi.lineTotal)", "revenue")
      .where("o.storeId = :storeId", { storeId })
      .andWhere("o.status NOT IN (:...excluded)", { excluded: REVENUE_EXCLUDED_STATUSES })
      .groupBy("oi.productNameSnapshot")
      .orderBy("SUM(oi.lineTotal)", "DESC")
      .limit(5)
      .getRawMany<{ productName: string; quantity: string; revenue: string }>();

    const topProducts: TopProductRow[] = topProductRows.map((row) => ({
      productName: row.productName,
      quantity: Number(row.quantity),
      revenue: Number(row.revenue),
    }));

    return {
      revenueThisMonth,
      orderCountThisMonth,
      avgOrderValueThisMonth: orderCountThisMonth > 0 ? revenueThisMonth / orderCountThisMonth : 0,
      statusBreakdown,
      trend,
      topProducts,
    };
  }
}
