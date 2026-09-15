# Be3a deployment

The current application is built for Cloudflare Workers with D1 and R2 bindings. The production build is a Worker build (`npm run build`), so it can be deployed to Cloudflare Pages/Workers after connecting the D1 database and R2 bucket used by the project.

GitHub is prepared with `.github/workflows/verify.yml`. It runs `npm ci`, TypeScript checks, and the production build for every push to `main` and every pull request.

## Important Vercel limitation

This code cannot be deployed directly to Vercel without a storage/runtime migration. The server imports `cloudflare:workers` and uses Cloudflare D1/R2 bindings; Vercel does not provide those bindings. A Vercel deployment requires replacing `lib/server.ts`, upload handling, migrations, and the Worker build target with Vercel-compatible services such as Postgres/SQLite plus object storage, then configuring authentication and secrets in Vercel.

Do not point Vercel at this repository and claim it is live until that migration is complete. The GitHub verification workflow is safe to enable now; the production hosting target for this version is Cloudflare Workers/Pages.

## Before production launch

1. Create or connect the GitHub repository and push the `main` branch.
2. Create the D1 database and R2 bucket in the hosting account, apply the schema/migrations, and set the binding names expected by the Worker.
3. Configure the authorized admin identity and production secrets in the hosting provider.
4. Add the real products, delivery regions, policies, and social links from the admin panel.
5. Enable browser notifications from `/admin/notifications` on the admin device.
