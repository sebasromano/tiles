import { describe, it, expect } from "vitest";
import { ok } from "neverthrow";
import { buildApp } from "../app.js";

/** Mock repository so tests do not call BigQuery. */
const emptyRepo = {
    getPoints: () => Promise.resolve(ok([])),
};

const populatedRepo = {
    getPoints: () =>
        Promise.resolve(
            ok([
                {
                    coordinates: { longitude: -73.97, latitude: 40.77 },
                },
            ]),
        ),
};

describe("GET /pois", () => {
    const app = buildApp();

    it("returns 400 when tableFqn is missing", async () => {
        const res = await app.inject({
            method: "GET",
            url: "/pois",
        });

        expect(res.statusCode).toBe(400);
    });

    it("returns 400 when tableFqn is empty", async () => {
        const res = await app.inject({
            method: "GET",
            url: "/pois?tableFqn=",
        });

        expect(res.statusCode).toBe(400);
    });

    it("returns 200 and GeoJSON FeatureCollection when tableFqn is provided", async () => {
        const appWithMock = buildApp({ getPointsRepository: populatedRepo });
        const res = await appWithMock.inject({
            method: "GET",
            url: "/pois?tableFqn=my-project.my_dataset.my_poi_table",
        });

        expect(res.statusCode).toBe(200);
        expect(res.headers["content-type"]).toMatch(/application\/json/);
        const body = res.json();
        expect(body).toEqual({
            type: "FeatureCollection",
            features: [
                {
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [-73.97, 40.77],
                    },
                },
            ],
        });
    });

    it("returns 200 with empty features array when table has no rows", async () => {
        const appWithMock = buildApp({ getPointsRepository: emptyRepo });
        const res = await appWithMock.inject({
            method: "GET",
            url: "/pois?tableFqn=project.dataset.empty_table",
        });

        expect(res.statusCode).toBe(200);
        const body = res.json();
        expect(body.type).toBe("FeatureCollection");
        expect(body.features).toEqual([]);
    });

    it("accepts optional geoColumn (default geom)", async () => {
        const appWithMock = buildApp({ getPointsRepository: emptyRepo });
        const res = await appWithMock.inject({
            method: "GET",
            url: "/pois?tableFqn=project.dataset.table&geoColumn=geometry",
        });

        expect(res.statusCode).toBe(200);
        const body = res.json();
        expect(body.type).toBe("FeatureCollection");
        expect(body.features).toBeDefined();
    });
});
