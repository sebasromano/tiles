import { describe, it, expect } from "vitest";
import { ok, err } from "neverthrow";
import { buildApp } from "../app.js";
import type { GetTileRepository } from "../features/getTileFromTileset/application/index.js";

const mvtBytes = Buffer.from([0x1a, 0x03, 0x66, 0x6f, 0x6f]);

const foundRepo: GetTileRepository = {
    getTile: () =>
        Promise.resolve(ok({ z: 14, x: 4602, y: 9819, data: mvtBytes })),
};

const notFoundRepo: GetTileRepository = {
    getTile: () => Promise.resolve(ok(null)),
};

const failingRepo: GetTileRepository = {
    getTile: () =>
        Promise.resolve(
            err({
                kind: "RepositoryError" as const,
                message: "BigQuery connection failed",
            }),
        ),
};

describe("GET /tilesets/:tilesetFQN/tiles/:z/:x/:y", () => {
    it("returns 200 with MVT binary for a valid tile", async () => {
        const app = buildApp({ getTileRepository: foundRepo });
        const res = await app.inject({
            method: "GET",
            url: "/tilesets/project.dataset.tileset/tiles/14/4602/9819",
        });

        expect(res.statusCode).toBe(200);
        expect(res.headers["content-type"]).toMatch(
            /application\/vnd\.mapbox-vector-tile/,
        );
        expect(res.rawPayload.length).toBeGreaterThan(0);
        expect(Buffer.from(res.rawPayload)).toEqual(mvtBytes);
    });

    it("returns 400 when z is not a valid integer", async () => {
        const app = buildApp({ getTileRepository: foundRepo });
        const res = await app.inject({
            method: "GET",
            url: "/tilesets/project.dataset.tileset/tiles/abc/4602/9819",
        });

        expect(res.statusCode).toBe(400);
        const body = res.json();
        expect(body.errors).toBeDefined();
        expect(body.errors.z).toBeDefined();
    });

    it("returns 400 when z is negative", async () => {
        const app = buildApp({ getTileRepository: foundRepo });
        const res = await app.inject({
            method: "GET",
            url: "/tilesets/project.dataset.tileset/tiles/-1/4602/9819",
        });

        expect(res.statusCode).toBe(400);
        const body = res.json();
        expect(body.errors).toBeDefined();
        expect(body.errors.z).toBeDefined();
    });

    it("returns 404 when tile is not found", async () => {
        const app = buildApp({ getTileRepository: notFoundRepo });
        const res = await app.inject({
            method: "GET",
            url: "/tilesets/project.dataset.tileset/tiles/0/0/0",
        });

        expect(res.statusCode).toBe(404);
        const body = res.json();
        expect(body.error).toBeDefined();
    });

    it("returns 500 when repository fails", async () => {
        const app = buildApp({ getTileRepository: failingRepo });
        const res = await app.inject({
            method: "GET",
            url: "/tilesets/project.dataset.tileset/tiles/14/4602/9819",
        });

        expect(res.statusCode).toBe(500);
        const body = res.json();
        expect(body.error).toBeDefined();
    });
});
