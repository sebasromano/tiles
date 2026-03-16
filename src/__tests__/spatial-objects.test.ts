import { describe, it, expect } from "vitest";
import { ok } from "neverthrow";
import { buildApp } from "../app.js";

const emptyRepo = {
    getPoints: () =>
        Promise.resolve(ok({ spatialObjects: [], nextCursor: null })),
};

const populatedRepo = {
    getPoints: () =>
        Promise.resolve(
            ok({
                spatialObjects: [
                    {
                        geometry: {
                            type: "Point" as const,
                            coordinates: [-73.97, 40.77] as [number, number],
                        },
                    },
                    {
                        geometry: {
                            type: "LineString" as const,
                            coordinates: [
                                [0, 0],
                                [1, 1],
                                [2, 2],
                            ] as [number, number][],
                        },
                    },
                    {
                        geometry: {
                            type: "Polygon" as const,
                            coordinates: [
                                [
                                    [0, 0],
                                    [1, 0],
                                    [1, 1],
                                    [0, 1],
                                    [0, 0],
                                ],
                            ] as [number, number][][],
                        },
                    },
                ],
                nextCursor: "some-cursor-value",
            }),
        ),
};

describe("GET /spatial-objects", () => {
    it("returns 400 when tableFqn is missing", async () => {
        const app = buildApp();
        const res = await app.inject({
            method: "GET",
            url: "/spatial-objects",
        });

        expect(res.statusCode).toBe(400);
    });

    it("returns 400 when tableFqn is empty", async () => {
        const app = buildApp();
        const res = await app.inject({
            method: "GET",
            url: "/spatial-objects?tableFqn=",
        });

        expect(res.statusCode).toBe(400);
    });

    it("returns 200 with paginated response containing mixed geometry types", async () => {
        const appWithMock = buildApp({
            getPointsRepository: populatedRepo,
        });
        const res = await appWithMock.inject({
            method: "GET",
            url: "/spatial-objects?tableFqn=my-project.my_dataset.my_table",
        });

        expect(res.statusCode).toBe(200);
        expect(res.headers["content-type"]).toMatch(/application\/json/);
        const body = res.json();

        expect(body.type).toBe("FeatureCollection");
        expect(body.features).toHaveLength(3);
        expect(body.nextCursor).toBe("some-cursor-value");

        expect(body.features[0]).toEqual({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [-73.97, 40.77],
            },
        });
        expect(body.features[1]).toEqual({
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [
                    [0, 0],
                    [1, 1],
                    [2, 2],
                ],
            },
        });
        expect(body.features[2]).toEqual({
            type: "Feature",
            geometry: {
                type: "Polygon",
                coordinates: [
                    [
                        [0, 0],
                        [1, 0],
                        [1, 1],
                        [0, 1],
                        [0, 0],
                    ],
                ],
            },
        });
    });

    it("returns 200 with empty features and nextCursor null when table has no rows", async () => {
        const appWithMock = buildApp({
            getPointsRepository: emptyRepo,
        });
        const res = await appWithMock.inject({
            method: "GET",
            url: "/spatial-objects?tableFqn=project.dataset.empty_table",
        });

        expect(res.statusCode).toBe(200);
        const body = res.json();
        expect(body.type).toBe("FeatureCollection");
        expect(body.features).toEqual([]);
        expect(body.nextCursor).toBeNull();
    });

    it("accepts optional geoColumn (default geom)", async () => {
        const appWithMock = buildApp({
            getPointsRepository: emptyRepo,
        });
        const res = await appWithMock.inject({
            method: "GET",
            url: "/spatial-objects?tableFqn=project.dataset.table&geoColumn=geometry",
        });

        expect(res.statusCode).toBe(200);
        const body = res.json();
        expect(body.type).toBe("FeatureCollection");
        expect(body.features).toBeDefined();
        expect(body).toHaveProperty("nextCursor");
    });

    it("accepts optional pageSize query param", async () => {
        const appWithMock = buildApp({
            getPointsRepository: emptyRepo,
        });
        const res = await appWithMock.inject({
            method: "GET",
            url: "/spatial-objects?tableFqn=project.dataset.table&pageSize=5000",
        });

        expect(res.statusCode).toBe(200);
    });

    it("returns 400 for invalid pageSize", async () => {
        const app = buildApp();
        const res = await app.inject({
            method: "GET",
            url: "/spatial-objects?tableFqn=project.dataset.table&pageSize=0",
        });

        expect(res.statusCode).toBe(400);
    });
});

describe("GET /pois (old endpoint)", () => {
    it("returns 404 after rename", async () => {
        const app = buildApp();
        const res = await app.inject({
            method: "GET",
            url: "/pois?tableFqn=project.dataset.table",
        });

        expect(res.statusCode).toBe(404);
    });
});
