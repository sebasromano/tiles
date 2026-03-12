import { describe, it, expect } from "vitest";
import { buildApp } from "../app.js";

describe("GET /health", () => {
    it("returns 200 and JSON with status ok", async () => {
        const app = buildApp();
        const res = await app.inject({
            method: "GET",
            url: "/health",
        });

        expect(res.statusCode).toBe(200);
        expect(res.headers["content-type"]).toMatch(/application\/json/);
        const body = res.json();
        expect(body).toEqual({ status: "ok" });
    });
});
