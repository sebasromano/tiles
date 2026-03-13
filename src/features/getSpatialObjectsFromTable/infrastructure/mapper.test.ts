import { describe, it, expect } from "vitest";
import { parseGeometry, mapRowToSpatialObject } from "./mapper.js";

describe("parseGeometry – WKT", () => {
    it("parses POINT", () => {
        const result = parseGeometry("POINT(1 2)");
        expect(result.isOk()).toBe(true);
        expect(result._unsafeUnwrap()).toEqual({
            type: "Point",
            coordinates: [1, 2],
        });
    });

    it("parses POINT with negative coordinates", () => {
        const result = parseGeometry("POINT(-73.9857 40.7484)");
        expect(result._unsafeUnwrap()).toEqual({
            type: "Point",
            coordinates: [-73.9857, 40.7484],
        });
    });

    it("parses POINT with spaces around parens", () => {
        const result = parseGeometry("POINT ( 1 2 )");
        expect(result._unsafeUnwrap()).toEqual({
            type: "Point",
            coordinates: [1, 2],
        });
    });

    it("parses LINESTRING", () => {
        const result = parseGeometry("LINESTRING(30 10, 10 30, 40 40)");
        expect(result.isOk()).toBe(true);
        expect(result._unsafeUnwrap()).toEqual({
            type: "LineString",
            coordinates: [
                [30, 10],
                [10, 30],
                [40, 40],
            ],
        });
    });

    it("parses POLYGON", () => {
        const result = parseGeometry(
            "POLYGON((30 10, 40 40, 20 40, 10 20, 30 10))",
        );
        expect(result.isOk()).toBe(true);
        expect(result._unsafeUnwrap()).toEqual({
            type: "Polygon",
            coordinates: [
                [
                    [30, 10],
                    [40, 40],
                    [20, 40],
                    [10, 20],
                    [30, 10],
                ],
            ],
        });
    });

    it("parses POLYGON with hole", () => {
        const result = parseGeometry(
            "POLYGON((35 10, 45 45, 15 40, 10 20, 35 10), (20 30, 35 35, 30 20, 20 30))",
        );
        expect(result.isOk()).toBe(true);
        const geom = result._unsafeUnwrap();
        expect(geom.type).toBe("Polygon");
        if (geom.type === "Polygon") {
            expect(geom.coordinates).toHaveLength(2);
            expect(geom.coordinates[0]).toEqual([
                [35, 10],
                [45, 45],
                [15, 40],
                [10, 20],
                [35, 10],
            ]);
            expect(geom.coordinates[1]).toEqual([
                [20, 30],
                [35, 35],
                [30, 20],
                [20, 30],
            ]);
        }
    });

    it("parses MULTIPOINT", () => {
        const result = parseGeometry("MULTIPOINT((10 40), (40 30))");
        expect(result.isOk()).toBe(true);
        expect(result._unsafeUnwrap()).toEqual({
            type: "MultiPoint",
            coordinates: [
                [10, 40],
                [40, 30],
            ],
        });
    });

    it("parses MULTILINESTRING", () => {
        const result = parseGeometry(
            "MULTILINESTRING((10 10, 20 20, 10 40), (40 40, 30 30, 40 20, 30 10))",
        );
        expect(result.isOk()).toBe(true);
        expect(result._unsafeUnwrap()).toEqual({
            type: "MultiLineString",
            coordinates: [
                [
                    [10, 10],
                    [20, 20],
                    [10, 40],
                ],
                [
                    [40, 40],
                    [30, 30],
                    [40, 20],
                    [30, 10],
                ],
            ],
        });
    });

    it("parses MULTIPOLYGON", () => {
        const result = parseGeometry(
            "MULTIPOLYGON(((30 20, 45 40, 10 40, 30 20)), ((15 5, 40 10, 10 20, 5 10, 15 5)))",
        );
        expect(result.isOk()).toBe(true);
        const geom = result._unsafeUnwrap();
        expect(geom.type).toBe("MultiPolygon");
        if (geom.type === "MultiPolygon") {
            expect(geom.coordinates).toHaveLength(2);
            expect(geom.coordinates[0]).toEqual([
                [
                    [30, 20],
                    [45, 40],
                    [10, 40],
                    [30, 20],
                ],
            ]);
            expect(geom.coordinates[1]).toEqual([
                [
                    [15, 5],
                    [40, 10],
                    [10, 20],
                    [5, 10],
                    [15, 5],
                ],
            ]);
        }
    });

    it("parses GEOMETRYCOLLECTION", () => {
        const result = parseGeometry(
            "GEOMETRYCOLLECTION(POINT(4 6), LINESTRING(4 6, 7 10))",
        );
        expect(result.isOk()).toBe(true);
        expect(result._unsafeUnwrap()).toEqual({
            type: "GeometryCollection",
            geometries: [
                { type: "Point", coordinates: [4, 6] },
                {
                    type: "LineString",
                    coordinates: [
                        [4, 6],
                        [7, 10],
                    ],
                },
            ],
        });
    });
});

describe("parseGeometry – EWKT", () => {
    it("parses EWKT with SRID prefix", () => {
        const result = parseGeometry("SRID=4326;POINT(1 2)");
        expect(result.isOk()).toBe(true);
        expect(result._unsafeUnwrap()).toEqual({
            type: "Point",
            coordinates: [1, 2],
        });
    });
});

describe("parseGeometry – WKB", () => {
    it("parses WKB Point from hex buffer", () => {
        // WKB for POINT(1 2) — little-endian
        const hex =
            "0101000000000000000000F03F0000000000000040";
        const buffer = Buffer.from(hex, "hex");
        const result = parseGeometry(buffer);
        expect(result.isOk()).toBe(true);
        expect(result._unsafeUnwrap()).toEqual({
            type: "Point",
            coordinates: [1, 2],
        });
    });

    it("parses WKB Polygon from hex buffer", () => {
        // WKB for POLYGON((0 0, 1 0, 1 1, 0 1, 0 0)) — little-endian
        const hex =
            "01030000000100000005000000" +
            "00000000000000000000000000000000" +
            "000000000000F03F0000000000000000" +
            "000000000000F03F000000000000F03F" +
            "0000000000000000000000000000F03F" +
            "00000000000000000000000000000000";
        const buffer = Buffer.from(hex, "hex");
        const result = parseGeometry(buffer);
        expect(result.isOk()).toBe(true);
        const geom = result._unsafeUnwrap();
        expect(geom.type).toBe("Polygon");
        if (geom.type === "Polygon") {
            expect(geom.coordinates).toEqual([
                [
                    [0, 0],
                    [1, 0],
                    [1, 1],
                    [0, 1],
                    [0, 0],
                ],
            ]);
        }
    });
});

describe("parseGeometry – error cases", () => {
    it("returns error for malformed WKT", () => {
        const result = parseGeometry("NOT_A_GEOMETRY(1 2)");
        expect(result.isErr()).toBe(true);
        if (result.isErr()) {
            expect(result.error.kind).toBe("RepositoryError");
        }
    });

    it("returns error for empty string", () => {
        const result = parseGeometry("");
        expect(result.isErr()).toBe(true);
    });

    it("returns error for POINT EMPTY", () => {
        const result = parseGeometry("POINT EMPTY");
        expect(result.isErr()).toBe(true);
        if (result.isErr()) {
            expect(result.error.kind).toBe("RepositoryError");
            expect(result.error.message).toContain("Empty POINT");
        }
    });
});

describe("mapRowToSpatialObject", () => {
    it("maps row with string WKT to SpatialObject", () => {
        const row = { geom: "POINT(1 2)" };
        const result = mapRowToSpatialObject(row, "geom");
        expect(result.isOk()).toBe(true);
        expect(result._unsafeUnwrap()).toEqual({
            geometry: { type: "Point", coordinates: [1, 2] },
        });
    });

    it("maps row with BigQuery GEOGRAPHY object { value: wkt }", () => {
        const row = { geom: { value: "LINESTRING(0 0, 1 1)" } };
        const result = mapRowToSpatialObject(row, "geom");
        expect(result.isOk()).toBe(true);
        expect(result._unsafeUnwrap()).toEqual({
            geometry: {
                type: "LineString",
                coordinates: [
                    [0, 0],
                    [1, 1],
                ],
            },
        });
    });

    it("maps row with Buffer WKB", () => {
        const hex =
            "0101000000000000000000F03F0000000000000040";
        const row = { geom: Buffer.from(hex, "hex") };
        const result = mapRowToSpatialObject(row, "geom");
        expect(result.isOk()).toBe(true);
        expect(result._unsafeUnwrap()).toEqual({
            geometry: { type: "Point", coordinates: [1, 2] },
        });
    });

    it("returns error when geo column is missing", () => {
        const row = { other_column: "value" };
        const result = mapRowToSpatialObject(row, "geom");
        expect(result.isErr()).toBe(true);
        if (result.isErr()) {
            expect(result.error.message).toContain("geom");
        }
    });

    it("returns error when geo column is null", () => {
        const row = { geom: null };
        const result = mapRowToSpatialObject(row, "geom");
        expect(result.isErr()).toBe(true);
    });

    it("returns error when geo column is undefined", () => {
        const row = { geom: undefined };
        const result = mapRowToSpatialObject(row, "geom");
        expect(result.isErr()).toBe(true);
    });

    it("uses custom geoColumn name", () => {
        const row = { geometry: "POINT(5 10)" };
        const result = mapRowToSpatialObject(row, "geometry");
        expect(result.isOk()).toBe(true);
        expect(result._unsafeUnwrap()).toEqual({
            geometry: { type: "Point", coordinates: [5, 10] },
        });
    });
});
