import { Hono } from "hono";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.use(logger());
app.use(prettyJSON());

function cf(c: { req: { raw: Request } }): IncomingRequestCfProperties {
  return (c.req.raw as Request<unknown, IncomingRequestCfProperties>).cf!;
}

/* Routes */
app.get("/", (c) => c.text(`${c.req.header("cf-connecting-ip")}\n`));
app.get("/user-agent", (c) => c.text(`${c.req.header("user-agent")}\n`));
app.get("/continent", (c) => c.text(`${cf(c).continent}\n`));
app.get("/country", (c) => c.text(`${cf(c).country}\n`));
app.get("/region", (c) => c.text(`${cf(c).region}\n`));
app.get("/city", (c) => c.text(`${cf(c).city}\n`));
app.get("/postal-code", (c) => c.text(`${cf(c).postalCode}\n`));
app.get("/timezone", (c) => c.text(`${cf(c).timezone}\n`));
app.get("/asn", (c) => c.text(`${cf(c).asn}\n`));
app.get("/org", (c) => c.text(`${cf(c).asOrganization}\n`));

app.get("/json", (c) => {
  const info = cf(c);
  return c.json({
    ip: c.req.header("cf-connecting-ip"),
    "user-agent": c.req.header("user-agent"),
    continent: info.continent,
    country: info.country,
    region: info.region,
    city: info.city,
    "postal-code": info.postalCode,
    timezone: info.timezone,
    latitude: info.latitude,
    longitude: info.longitude,
    asn: info.asn,
    org: info.asOrganization,
  });
});

export default app;
