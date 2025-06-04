import { Hono } from "hono";
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'

/* App */
const app = new Hono<{ Bindings: CloudflareBindings }>();

/* Middlewares */
app.use(logger())
app.use(prettyJSON())
app.use(async (c, next) => {
  const { headers, cf } = c.req.raw;
  c.set("headers", headers);
  c.set("cf", cf);
  await next();
});

/* Routes */
app.get("/", (c) => {
  return c.text(`${c.var.headers.get("cf-connecting-ip")}\n`);
});

app.get("/user-agent", (c) => {
  return c.text(`${c.var.headers.get("user-agent")}\n`);
});

app.get("/continent", (c) => {
  return c.text(`${c.var.cf.continent}\n`);
});

app.get("/country", (c) => {
  return c.text(`${c.var.cf.country}\n`);
});

app.get("/region", (c) => {
  return c.text(`${c.var.cf.region}\n`);
});

app.get("/city", (c) => {
  return c.text(`${c.var.cf.city}\n`);
});

app.get("/postal-code", (c) => {
  return c.text(`${c.var.cf.postalCode}\n`);
});

app.get("/asn", (c) => {
  return c.text(`${c.var.cf.asn}\n`);
});

app.get("/org", (c) => {
  return c.text(`${c.var.cf.asOrganization}\n`);
});

app.get("/json", (c) => {
  return c.json({
    "ip": c.var.headers.get("cf-connecting-ip"),
    "user-agent": c.var.headers.get("user-agent"),
    "continent": c.var.cf.continent,
    "country": c.var.cf.country,
    "region": c.var.cf.region,
    "city": c.var.cf.city,
    "asn": c.var.cf.asn,
    "org": c.var.cf.asOrganization,
  });
});

export default app;
