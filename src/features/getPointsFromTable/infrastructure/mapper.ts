import { err, ok, type Result } from "neverthrow";
import type { Coordinates, PointOfInterest } from "../domain/index.js";
import type { GetPointsFromTableRepositoryError } from "../application/ports.js";

export type BigQueryRow = Record<string, unknown> & { [k: string]: unknown };

export function parseWktPoint(
    wkt: string,
): Result<Coordinates, GetPointsFromTableRepositoryError> {
    const match = /POINT\s*\(\s*(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s*\)/i.exec(
        wkt.trim(),
    );
    if (!match) {
        return err({
            kind: "RepositoryError",
            message: `Invalid WKT Point: ${wkt}`,
        });
    }
    const lon = parseFloat(match[1]);
    const lat = parseFloat(match[2]);
    if (Number.isNaN(lon) || Number.isNaN(lat)) {
        return err({
            kind: "RepositoryError",
            message: `Invalid coordinates in WKT: ${wkt}`,
        });
    }
    return ok({ longitude: lon, latitude: lat });
}

/**
 * Normalize geometry cell to WKT string. Handles both:
 * - Raw string: "POINT(-73.9 40.8)"
 * - BigQuery GEOGRAPHY: { value: "POINT(-73.9 40.8)" }
 */
function extractWkt(cell: unknown): string | null {
    if (typeof cell === "string") return cell;
    if (
        cell &&
        typeof cell === "object" &&
        "value" in cell &&
        typeof (cell as { value: unknown }).value === "string"
    ) {
        return (cell as { value: string }).value;
    }
    return null;
}

/** Map a single BigQuery row (single geo column) to a domain POI (coordinates only). */
export function mapRowToPointOfInterest(
    row: BigQueryRow,
    geoColumn: string,
): Result<PointOfInterest, GetPointsFromTableRepositoryError> {
    const wkt = extractWkt(row[geoColumn]);
    if (wkt === null) {
        return err({
            kind: "RepositoryError",
            message: `Missing or invalid geometry column: ${geoColumn}`,
        });
    }
    const parsed = parseWktPoint(wkt);
    if (parsed.isErr()) return err(parsed.error);

    return ok({
        coordinates: parsed.value,
    });
}
