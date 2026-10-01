import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: "mssql" as const,
        host: config.get<string>("DB_HOST"),
        port: config.get<number>("DB_PORT"),
        username: config.get<string>("DB_USERNAME"),
        password: config.get<string>("DB_PASSWORD"),
        database: config.get<string>("DB_NAME"),
        options: {
          encrypt: config.get<boolean>("DB_ENCRYPT"),
          trustServerCertificate: config.get<boolean>("DB_TRUST_SERVER_CERTIFICATE"),
        },
        autoLoadEntities: true,
        synchronize: false,
        logging: config.get<string>("NODE_ENV") === "development",
      }),
    }),
  ],
})
export class DatabaseModule {}
