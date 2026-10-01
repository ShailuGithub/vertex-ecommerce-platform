# Vertex E-Commerce — Multi-Store Commerce Platform

A multi-tenant e-commerce platform: store owners get their own storefront and admin
dashboard, backed by a NestJS REST API on SQL Server, with Razorpay payments.

> Portfolio showcase. Environment files, production hosts and credentials are not
> included. Copy each `.env.example` to `.env` and fill in your own values.

## Features
- **Multi-store**: each store has its own storefront at `/store/<slug>`, settings and staff
- **Storefront** (Next.js): catalogue, cart, customer accounts, addresses, checkout
- **Admin dashboard** (Next.js): products, categories, orders, customers, coupons, staff, analytics and store settings
- **Platform admin**: tenant onboarding, store signup and platform-level controls
- **API** (NestJS): auth, customer auth, catalog, cart, orders, inventory, coupons, payments, analytics, uploads and health checks
- **Payments**: Razorpay order creation and verified webhooks
- **Security**: separate JWT access/refresh tokens for staff and customers, bcrypt password hashing, environment validation with Zod, input validation with `class-validator`

## Tech stack
| Layer | Technology |
|---|---|
| API | NestJS 10, TypeScript, TypeORM, Passport/JWT |
| Database | Microsoft SQL Server (`mssql`) |
| Storefront and Admin | Next.js 14, React 18, Tailwind CSS |
| Payments | Razorpay |
| Monorepo | pnpm workspaces, Turborepo, shared TypeScript types package |
| Deployment | PM2 (`ecosystem.config.js`) and Nginx (`deploy/`) on Ubuntu |

## Structure
```
apps/api          NestJS REST API
apps/storefront   Customer-facing Next.js storefront
apps/admin        Store-owner / platform admin dashboard
packages/shared-types   Types shared between apps
deploy/           Nginx template and deployment runbook
```

## Running locally
```sh
pnpm install
cp .env.example .env            # and the same for apps/api, apps/admin, apps/storefront
# set DB_* and the JWT secrets (min 16 chars) in apps/api/.env
pnpm --filter @vertex/api run seed      # optional demo data (override SEED_* passwords)
pnpm dev
```
Never reuse the demo seed passwords outside local development.

## What this demonstrates
A full-stack multi-tenant SaaS: tenant-aware API design, two separate auth realms
(staff and customers), payment integration with webhook verification, and a monorepo
shared across the API, storefront and admin apps.
