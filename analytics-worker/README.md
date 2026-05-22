# Visitor Analytics Worker

This Cloudflare Worker backs the visitor-count badge and visitor globe for the static Jekyll site.

It exposes:

- `POST /track`: increments the current visitor session using Cloudflare geolocation headers.
- `GET /stats`: returns aggregate visitor counts in the same shape as `_data/visitors.yml`.

The Worker stores only aggregate country/state counts. It does not store IP addresses, user agents, paths, or referrers.

## Deploy

1. Create a KV namespace:

   ```sh
   npx wrangler kv namespace create VISITOR_COUNTS
   ```

2. Copy `wrangler.toml.example` to `wrangler.toml` and fill in the generated KV namespace id.

3. Deploy:

   ```sh
   npx wrangler deploy
   ```

4. Put the deployed Worker URL in `_config.yml`:

   ```yml
   visitor_analytics:
     api_url: "https://your-worker.your-account.workers.dev"
     track: true
     refresh_interval_ms: 30000
   ```

After the site is rebuilt, each browser session will increment the counter once and the badge/map will poll for fresh counts.
