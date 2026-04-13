# myip

A minimal Cloudflare Worker that returns information about the caller's IP.

**Live:** [myip.cybai.re](https://myip.cybai.re)

## Usage

All endpoints return plain text, except `/json`.

```
GET /               → IP address
GET /user-agent     → User-Agent string
GET /continent      → 2-letter continent code (e.g. EU)
GET /country        → ISO 3166-1 Alpha-2 country code (e.g. FR)
GET /region         → Region / state name
GET /city           → City name
GET /postal-code    → Postal code
GET /timezone       → IANA timezone (e.g. Europe/Paris)
GET /asn            → Autonomous System Number
GET /org            → AS organisation name
GET /json           → All fields as JSON
```

```sh
curl myip.cybai.re
curl myip.cybai.re/json
```

## Stack

- [Hono](https://hono.dev) — routing
- [Cloudflare Workers](https://workers.cloudflare.com) — runtime
- All geo/ASN data comes from the `cf` object on the incoming request — no external API calls

## Development

```sh
npm run dev       # local dev server (wrangler)
npm run deploy    # deploy to Cloudflare
npm run typecheck # type-check without emitting
npm run cf-typegen # regenerate worker-configuration.d.ts
```

## License

MIT — see [LICENSE](LICENSE).
