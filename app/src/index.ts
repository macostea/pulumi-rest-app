import * as Koa from "koa";
import * as Router from "koa-router";

import * as logger from "koa-logger";
import * as json from "koa-json";

const app = new Koa();
const router = new Router();

router.get("/", async (ctx, next) => {
  ctx.body = { msg: "Hello world!" };

  await next();
});

app.use(json());
app.use(logger());

app.use(router.routes()).use(router.allowedMethods());

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

function cleanup() {
  console.log("Cleaning up...");
  process.exit(0);
}
