import { buildApp } from "./app.js";

const app = buildApp();
const host = process.env.HOST ?? "localhost";
const port = parseInt(process.env.PORT ?? "3000", 10);

async function main() {
  try {
    await app.listen({ host, port });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
