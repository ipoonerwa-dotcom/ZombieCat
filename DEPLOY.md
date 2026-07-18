# Deploying ZombiesCat Store

Full-stack Next.js app (storefront + API + admin) → **Vercel**, with **PostgreSQL** (Neon) for the database.
The store works in **demo mode** until $ZCAT + the Store contract are live; you flip to real on-chain
burns just by filling two addresses in `/admin` (or env vars). No code change needed.

---

## 1. Create the database (Neon — free)

1. Sign up at https://neon.tech → **New Project** (pick a region close to your users).
2. Copy the **Pooled connection** string. It looks like:
   `postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require`

## 2. Push the schema to the database

Locally, in the project folder:

```bash
# put your Neon URL + admin creds in .env  (copy from .env.example)
cp .env.example .env
#   edit .env → set DATABASE_URL, ADMIN_PASSWORD, ADMIN_SECRET
npm install
npm run db:push        # creates the Order / OrderItem / Setting tables in Neon
npm run dev            # optional: verify locally at http://localhost:3000
```

## 3. Deploy to Vercel

**Option A — GitHub → Vercel (recommended, gives auto-deploy on push):**
1. Create a new **empty** GitHub repo (no README/gitignore/license).
2. Push this project (or upload the `zombiescat-store-source.zip` contents).
3. On Vercel → **Add New → Project → Import** the repo. Framework auto-detects as **Next.js**.

**Option B — Vercel CLI (no GitHub):**
```bash
npx vercel        # login, then follow prompts (accept Next.js defaults)
npx vercel --prod
```

## 4. Set environment variables on Vercel

Project → **Settings → Environment Variables** (add for Production + Preview):

| Key | Value |
|-----|-------|
| `DATABASE_URL` | your Neon pooled connection string |
| `ADMIN_PASSWORD` | a strong admin password |
| `ADMIN_SECRET` | a long random string (cookie signing) |

Optional (leave empty = demo checkout, no real burn — set later from /admin instead):
`NEXT_PUBLIC_TOKEN_ADDRESS`, `NEXT_PUBLIC_STORE_ADDRESS`, `NEXT_PUBLIC_TOKEN_DECIMALS`,
`NEXT_PUBLIC_TOKEN_SYMBOL`, `NEXT_PUBLIC_CHAIN_ID`, `SERVER_RPC_URL`.

Re-deploy after adding env vars (Deployments → ⋯ → Redeploy) so they take effect.

## 5. Connect the domain (optional)

Vercel → Settings → Domains → add your domain, then point DNS at Vercel (A `@` → `76.76.21.21`,
CNAME `www` → `cname.vercel-dns.com`, or use Vercel's shown records).

---

## Going live with real burns (later)

Once `$ZCAT` and the `ZombiesCatStore` contract are deployed on Robinhood Chain (4663):
1. Deploy `contracts/ZombiesCatStore.sol` (constructor takes the token address), then `freezeToken()`.
2. In `/admin → Settings`, fill **Token address** + **Store contract address** (and set the ZCAT/USD rate).
3. Checkout automatically switches from demo to: approve → `purchase()` burns 100% → backend verifies the
   `Purchased` event on-chain before marking the order paid.

Fulfillment stays off-chain: use each order's USD value (in /admin) to allocate treasury ETH → fiat →
buy & ship the goods, then mark the order **fulfilled**.

## Admin

`/admin` — password = `ADMIN_PASSWORD`. Shows every order: buyer address, $ZCAT burned, products, qty,
USD value, on-chain tx, and the shipping/contact details for fulfillment.

## Contracts (separate from the web deploy)

Solidity lives in `contracts/`. Test with Foundry: `forge test --root .` (8/8 passing).
