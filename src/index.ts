import { Hono, type Context } from "hono";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.use(logger());
app.use(prettyJSON());

/* Responses are visitor-specific and callable from browser JS. */
app.use(async (c, next) => {
  await next();
  c.header("Cache-Control", "no-store");
  c.header("Access-Control-Allow-Origin", "*");
});

type Cf = Partial<IncomingRequestCfProperties>;

function cf(c: { req: { raw: Request } }): Cf {
  return ((c.req.raw as Request<unknown, IncomingRequestCfProperties>).cf ??
    {}) as Cf;
}

function ip(c: { req: { header: (n: string) => string | undefined } }): string {
  return c.req.header("cf-connecting-ip") ?? "unknown";
}

/* Plain-text field: "\n"-terminated, "unknown" when unavailable. */
const line = (v: unknown) => `${v ?? "unknown"}\n`;

const USAGE = `myip — https://myip.cybai.re

GET /               IP address
GET /ip             IP address (always plain text)
GET /user-agent     User-Agent string
GET /continent      2-letter continent code
GET /country        ISO 3166-1 Alpha-2 country code
GET /region         Region / state name
GET /city           City name
GET /postal-code    Postal code
GET /timezone       IANA timezone
GET /asn            Autonomous System Number
GET /org            AS organisation name
GET /json           All fields as JSON
`;

const esc = (v: unknown) =>
  String(v ?? "unknown").replace(
    /[&<>"']/g,
    (ch) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[ch]!,
  );

function html(c: Context): string {
  const info = cf(c);
  const rows: [string, unknown][] = [
    ["City", info.city],
    ["Region", info.region],
    ["Country", info.country],
    ["Continent", info.continent],
    ["Postal code", info.postalCode],
    ["Timezone", info.timezone],
    ["ASN", info.asn ? `AS${info.asn}` : undefined],
    ["Organisation", info.asOrganization],
  ];
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${esc(ip(c))} — myip</title>
<style>
  :root { color-scheme: light dark; }
  body { margin: 0; min-height: 100vh; display: grid; place-items: center;
    font: 16px/1.5 system-ui, sans-serif; background: Canvas; color: CanvasText; }
  main { padding: 2rem 1.5rem; max-width: 32rem; width: 100%; }
  .ip { font-size: clamp(1.6rem, 6vw, 2.6rem); font-weight: 700;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace; word-break: break-all; }
  dl { display: grid; grid-template-columns: auto 1fr; gap: .35rem 1rem; margin: 1.5rem 0 0; }
  dt { opacity: .6; } dd { margin: 0; text-align: right; }
  footer { margin-top: 2rem; font-size: .85rem; opacity: .6; }
  a { color: inherit; }
</style>
</head>
<body>
<main>
  <div class="ip">${esc(ip(c))}</div>
  <dl>
    ${rows.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join("\n    ")}
  </dl>
  <footer>Plain text: <a href="/">curl myip.cybai.re</a> · <a href="/json">/json</a></footer>
</main>
</body>
</html>
`;
}

/* Routes */
app.get("/", (c) => {
  if ((c.req.header("accept") ?? "").includes("text/html")) {
    return c.html(html(c));
  }
  return c.text(line(ip(c)));
});
app.get("/ip", (c) => c.text(line(ip(c))));
app.get("/user-agent", (c) => c.text(line(c.req.header("user-agent"))));
app.get("/continent", (c) => c.text(line(cf(c).continent)));
app.get("/country", (c) => c.text(line(cf(c).country)));
app.get("/region", (c) => c.text(line(cf(c).region)));
app.get("/city", (c) => c.text(line(cf(c).city)));
app.get("/postal-code", (c) => c.text(line(cf(c).postalCode)));
app.get("/timezone", (c) => c.text(line(cf(c).timezone)));
app.get("/asn", (c) => c.text(line(cf(c).asn)));
app.get("/org", (c) => c.text(line(cf(c).asOrganization)));

app.get("/json", (c) => {
  const info = cf(c);
  return c.json({
    ip: ip(c),
    "user-agent": c.req.header("user-agent") ?? null,
    continent: info.continent ?? null,
    country: info.country ?? null,
    region: info.region ?? null,
    city: info.city ?? null,
    "postal-code": info.postalCode ?? null,
    timezone: info.timezone ?? null,
    latitude: info.latitude ?? null,
    longitude: info.longitude ?? null,
    asn: info.asn ?? null,
    org: info.asOrganization ?? null,
  });
});

app.notFound((c) => c.text(USAGE, 404));

export default app;
