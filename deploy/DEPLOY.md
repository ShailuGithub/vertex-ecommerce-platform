# Deploying VertexECommerce to the Ubuntu server

This is the runbook for Phase 7. It assumes: you have SSH access to the
Ubuntu server, Node isn't installed there yet, and MSSQL is already
running there (or reachable from there) per the original setup.

## 1. One-time server setup

SSH in, then:

```bash
# nvm + Node LTS
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install --lts
node -v   # should print a v20.x or v22.x

# pnpm + pm2, globally
corepack enable || npm install -g pnpm
npm install -g pm2

# confirm MSSQL is reachable from this box (adjust host/port if MSSQL is elsewhere)
# sqlcmd or telnet <db-host> 1433 - whatever you have available
```

## 2. Get the code onto the server

```bash
cd ~
git clone <your-repo-url> VertexECommerce   # or git pull if already cloned
cd VertexECommerce
pnpm install
```

## 3. Create the `.env` files directly on the server

**Never commit these. Never paste real secrets into chat.** Create each
file directly on the server (`nano apps/api/.env`, etc.), using
`apps/api/.env.example` / `apps/storefront/.env.example` /
`apps/admin/.env.example` as the templates for required keys.

Things that differ from your local `.env`:

- `NODE_ENV=production`
- `DB_HOST` / `DB_PORT` / `DB_USERNAME` / `DB_PASSWORD` / `DB_NAME` — point at
  the server's MSSQL instance (or wherever it's reachable from).
- `DB_ENCRYPT` / `DB_TRUST_SERVER_CERTIFICATE` — the `.env.example` defaults
  (`false` / `true`) are dev-only. **If MSSQL is not on this same server**
  (reached over a network instead of localhost), set `DB_ENCRYPT=true` so
  credentials and order/customer data aren't sent in plaintext, and get a
  real certificate on the DB server so you can set
  `DB_TRUST_SERVER_CERTIFICATE=false` — leaving it `true` blindly trusts
  whatever certificate is presented.
- `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CUSTOMER_JWT_SECRET`,
  `CUSTOMER_JWT_REFRESH_SECRET`, `ENCRYPTION_KEY` — generate **fresh** random
  values for production, don't reuse your local dev ones
  (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`).
- `CORS_ORIGINS` — your real storefront/admin URLs once you have a domain
  (e.g. `https://storefront.yourdomain.com,https://admin.yourdomain.com`);
  until then, whatever origin you're actually hitting the API from.
- `apps/storefront/.env` and `apps/admin/.env`: `NEXT_PUBLIC_API_URL` must
  point at the API's public URL (e.g. `https://api.yourdomain.com` once
  Nginx/SSL is set up, or `http://<server-ip>:3001` before that).

Razorpay keys are **not** in `.env` anymore — each store connects its own
via the admin app's Settings page after deployment (Phase 4). Use
**test-mode** keys there first; only switch a store to live keys after a
verified test-mode checkout works end to end in production.

## 4. Run migrations and build

```bash
cd ~/VertexECommerce
pnpm --filter @vertex/api migration:run
pnpm build
```

`pnpm build` runs `tsc`/`nest build`/`next build` across all three apps
(via Turborepo) - if this fails, fix it before starting PM2, don't debug
against a half-built app under a process manager.

## 5. Start with PM2

```bash
cd ~/VertexECommerce
pm2 start ecosystem.config.js
pm2 save
pm2 startup   # follow the printed instructions (one-time, survives reboots)
pm2 list      # all three processes should show "online"
pm2 logs      # tail logs, ctrl+c to stop tailing (doesn't stop the apps)
```

## 6. Nginx + SSL (once you have a domain)

See `deploy/nginx.conf.template` - copy it, replace `YOURDOMAIN.COM` and
`YOURUSER`, enable the site, then run certbot. Full commands are in the
comment header of that file.

**No domain yet?** Skip this step. Open ports 3000/3001/3002 in your
server's firewall/security group and hit the apps directly at
`http://<server-ip>:3000` etc. Come back to this step once you have a
domain — it's a routing change, not a rebuild.

**Important if running without TLS:** with `NODE_ENV=production`, auth
cookies default to `Secure`, which browsers silently drop over plain HTTP —
login will appear to succeed (200 response) but no session gets stored, and
you'll seem logged out immediately. Set `COOKIE_SECURE=false` in
`apps/api/.env` until Nginx + TLS is set up, then remove it (or set it to
`true`) once HTTPS is live.

## 7. Verify

- `pm2 list` — all three `online`, no restart loops (check the restart
  count isn't climbing).
- `curl http://localhost:3001/health` on the server itself — should report
  `db: connected`.
- Visit the storefront and admin URLs (or `<server-ip>:3000` / `:3002`) in
  a browser. Sign up a fresh store via the admin app's "Create your store"
  flow, confirm you land on an empty dashboard.
- In that store's admin Settings page, connect **test-mode** Razorpay
  keys, then run a full checkout on the storefront using Razorpay's test
  card/UPI numbers. Confirm the order flips to `PAID` and stock decrements.
- Only after that works: switch that store's Razorpay keys to live in
  Settings, and do one small real transaction to confirm.

## Redeploying after code changes

```bash
cd ~/VertexECommerce
git pull
pnpm install
pnpm --filter @vertex/api migration:run   # only if there are new migrations
pnpm build
pm2 restart ecosystem.config.js
```

## Rollback

`pm2` doesn't version your code — if a deploy breaks something, the fix is
`git checkout <previous-good-commit>`, `pnpm install`, `pnpm build`,
`pm2 restart ecosystem.config.js`. Keep migrations forward-only; don't
`migration:revert` in production unless you're certain no data depends on
the columns being dropped.
