import "dotenv/config";
import { buildApp } from "./app.js";

const app = buildApp();
const host = process.env.HOST ?? "0.0.0.0";
const port = parseInt(process.env.PORT ?? "3003", 10);

async function main() {
    try {
        await app.listen({ host, port });
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
}

main();
