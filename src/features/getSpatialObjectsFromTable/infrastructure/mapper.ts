import { err, ok, type Result } from "neverthrow";
import * as wkx from "wkx";
import type { Geometry, Position, SpatialObject } from "../domain/index.js";
import type { GetSpatialObjectsFromTableRepositoryError } from "../application/ports.js";

export type BigQueryRow = Record<string, unknown>;

function pointToPosition(p: wkx.Point): Position {
    return [p.x, p.y];
}

function wkxToGeometry(
    parsed: wkx.Geometry,
): Result<Geometry, GetSpatialObjectsFromTableRepositoryError> {
    if (parsed instanceof wkx.Point) {
        if (parsed.x === undefined || parsed.y === undefined) {
            return err({
                kind: "RepositoryError",
                message: "Empty POINT geometry",
            });
        }
        return ok({
            type: "Point",
            coordinates: pointToPosition(parsed),
        });
    }

    if (parsed instanceof wkx.LineString) {
        return ok({
            type: "LineString",
            coordinates: parsed.points.map(pointToPosition),
        });
    }

    if (parsed instanceof wkx.Polygon) {
        const rings: Position[][] = [
            parsed.exteriorRing.map(pointToPosition),
            ...parsed.interiorRings.map((ring) =>
                ring.map(pointToPosition),
            ),
        ];
        return ok({ type: "Polygon", coordinates: rings });
    }

    if (parsed instanceof wkx.MultiPoint) {
        return ok({
            type: "MultiPoint",
            coordinates: parsed.points.map(pointToPosition),
        });
    }

    if (parsed instanceof wkx.MultiLineString) {
        return ok({
            type: "MultiLineString",
            coordinates: parsed.lineStrings.map((ls) =>
                ls.points.map(pointToPosition),
            ),
        });
    }

    if (parsed instanceof wkx.MultiPolygon) {
        return ok({
            type: "MultiPolygon",
            coordinates: parsed.polygons.map((poly) => [
                poly.exteriorRing.map(pointToPosition),
                ...poly.interiorRings.map((ring) =>
                    ring.map(pointToPosition),
                ),
            ]),
        });
    }

    if (parsed instanceof wkx.GeometryCollection) {
        const geometries: Geometry[] = [];
        for (const child of parsed.geometries) {
            const result = wkxToGeometry(child);
            if (result.isErr()) return result;
            geometries.push(result.value);
        }
        return ok({ type: "GeometryCollection", geometries });
    }

    return err({
        kind: "RepositoryError",
        message: `Unsupported geometry type: ${parsed.constructor.name}`,
    });
}

export function parseGeometry(
    raw: string | Buffer,
): Result<Geometry, GetSpatialObjectsFromTableRepositoryError> {
    try {
        const parsed = wkx.Geometry.parse(raw);
        return wkxToGeometry(parsed);
    } catch (e: unknown) {
        return err({
            kind: "RepositoryError",
            message: e instanceof Error ? e.message : `Failed to parse geometry: ${String(e)}`,
        });
    }
}

/**
 * Extract the geometry value from a BigQuery cell. Handles:
 * - Raw string (WKT): "POINT(-73.9 40.8)"
 * - BigQuery GEOGRAPHY object: { value: "POINT(-73.9 40.8)" }
 * - Buffer (WKB)
 */
function extractGeometryValue(cell: unknown): string | Buffer | null {
    if (typeof cell === "string") return cell;
    if (Buffer.isBuffer(cell)) return cell;
    if (
        cell &&
        typeof cell === "object" &&
        "value" in cell
    ) {
        const val = (cell as { value: unknown }).value;
        if (typeof val === "string") return val;
        if (Buffer.isBuffer(val)) return val;
    }
    return null;
}

export function mapRowToSpatialObject(
    row: BigQueryRow,
    geoColumn: string,
): Result<SpatialObject, GetSpatialObjectsFromTableRepositoryError> {
    const raw = extractGeometryValue(row[geoColumn]);
    if (raw === null) {
        return err({
            kind: "RepositoryError",
            message: `Missing or invalid geometry column: ${geoColumn}`,
        });
    }
    const parsed = parseGeometry(raw);
    if (parsed.isErr()) return err(parsed.error);

    return ok({ geometry: parsed.value });
}
