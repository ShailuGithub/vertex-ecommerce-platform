import { Controller, Get } from "@nestjs/common";
import { DataSource } from "typeorm";

@Controller("health")
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Get()
  async check() {
    const dbConnected = this.dataSource.isInitialized;
    return {
      status: "ok",
      db: dbConnected ? "connected" : "disconnected",
      timestamp: new Date().toISOString(),
    };
  }
}
