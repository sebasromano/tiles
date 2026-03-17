import { err, ok, type Result } from "neverthrow";
import type { Validator } from "../../../shared/index.js";
import type {
    Bounds,
    GetSpatialObjectsCommand,
    GetSpatialObjectsError,
    GetSpatialObjectsInput,
    ValidationErrors,
} from "./types.js";

const DEFAULT_GEO_COLUMN = "geom";
const DEFAULT_LAT_COLUMN = "lat";
const DEFAULT_LNG_COLUMN = "lng";
export const VIEWPORT_MAX_LIMIT = 5000;
export const VIEWPORT_DEFAULT_LIMIT = 1000;
export const LEGACY_MAX_LIMIT = 100000;
const MAX_BOUNDS_DEGREES = 45; // max side length in degrees to avoid full-table scans

export type IGetSpatialObjectsValidator = Validator<
    GetSpatialObjectsInput,
    GetSpatialObjectsCommand,
    GetSpatialObjectsError
>;

export class GetSpatialObjectsValidator
    implements IGetSpatialObjectsValidator
{
    validate(
        params: GetSpatialObjectsInput,
    ): Result<GetSpatialObjectsCommand, GetSpatialObjectsError> {
        const errors: ValidationErrors = {};
        let tableFqn: string | null = null;
        let geoColumn: string | null = null;
        let bounds: Bounds | undefined;
        let limit: number = LEGACY_MAX_LIMIT;
        let latColumn: string = DEFAULT_LAT_COLUMN;
        let lngColumn: string = DEFAULT_LNG_COLUMN;

        const tableFqnResult = validateTableFqn(params.tableFqn);
        if (tableFqnResult.isErr()) {
            const e = tableFqnResult.error;
            if (e.kind === "ValidationError") Object.assign(errors, e.errors);
        } else {
            tableFqn = tableFqnResult.value;
        }

        const geoColumnResult = validateGeoColumn(params.geoColumn);
        if (geoColumnResult.isErr()) {
            const e = geoColumnResult.error;
            if (e.kind === "ValidationError") Object.assign(errors, e.errors);
        } else {
            geoColumn = geoColumnResult.value;
        }

        const boundsResult = validateBounds(params);
        if (boundsResult.isErr()) {
            const e = boundsResult.error;
            if (e.kind === "ValidationError") Object.assign(errors, e.errors);
        } else {
            bounds = boundsResult.value;
        }

        const limitResult = validateLimit(params, bounds !== undefined);
        if (limitResult.isErr()) {
            const e = limitResult.error;
            if (e.kind === "ValidationError") Object.assign(errors, e.errors);
        } else {
            limit = limitResult.value;
        }

        const latColumnResult = validateColumnName(
            params.latColumn,
            "latColumn",
            DEFAULT_LAT_COLUMN,
        );
        if (latColumnResult.isErr()) {
            const e = latColumnResult.error;
            if (e.kind === "ValidationError") Object.assign(errors, e.errors);
        } else {
            latColumn = latColumnResult.value;
        }

        const lngColumnResult = validateColumnName(
            params.lngColumn,
            "lngColumn",
            DEFAULT_LNG_COLUMN,
        );
        if (lngColumnResult.isErr()) {
            const e = lngColumnResult.error;
            if (e.kind === "ValidationError") Object.assign(errors, e.errors);
        } else {
            lngColumn = lngColumnResult.value;
        }

        if (Object.keys(errors).length > 0) {
            return err({ kind: "ValidationError", errors });
        }

        return ok({
            tableFqn: tableFqn!,
            geoColumn: geoColumn!,
            bounds,
            limit,
            latColumn,
            lngColumn,
        });
    }
}

const SAFE_TABLE_FQN = /^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;

export function validateTableFqn(
    tableFqn: string | undefined,
): Result<string, GetSpatialObjectsError> {
    const trimmed = typeof tableFqn === "string" ? tableFqn.trim() : "";
    if (!trimmed) {
        return err({
            kind: "ValidationError",
            errors: {
                tableFqn: [
                    { code: "required", message: "tableFqn is required" },
                ],
            },
        });
    }
    if (!SAFE_TABLE_FQN.test(trimmed)) {
        return err({
            kind: "ValidationError",
            errors: {
                tableFqn: [
                    {
                        code: "invalid_format",
                        message:
                            "tableFqn must be a fully qualified name (e.g. project.dataset.table)",
                    },
                ],
            },
        });
    }
    return ok(trimmed);
}

const SAFE_GEO_COLUMN = /^[a-zA-Z0-9_-]+$/;
const SAFE_COLUMN = /^[a-zA-Z0-9_]+$/;

function parseNumber(
    value: unknown,
): Result<number, GetSpatialObjectsError> {
    if (value === undefined || value === null || value === "") {
        return err({
            kind: "ValidationError",
            errors: {},
        });
    }
    const n = typeof value === "string" ? parseFloat(value) : Number(value);
    if (Number.isNaN(n)) {
        return err({ kind: "ValidationError", errors: {} });
    }
    return ok(n);
}

export function validateBounds(
    params: GetSpatialObjectsInput,
): Result<Bounds | undefined, GetSpatialObjectsError> {
    const hasAny =
        params.minLng !== undefined ||
        params.minLat !== undefined ||
        params.maxLng !== undefined ||
        params.maxLat !== undefined;
    if (!hasAny) return ok(undefined);

    const errors: ValidationErrors = {};
    const minLngR = parseNumber(params.minLng);
    const minLatR = parseNumber(params.minLat);
    const maxLngR = parseNumber(params.maxLng);
    const maxLatR = parseNumber(params.maxLat);

    if (minLngR.isErr()) {
        errors.minLng = [{ code: "required", message: "minLng is required and must be a number when using viewport" }];
    }
    if (minLatR.isErr()) {
        errors.minLat = [{ code: "required", message: "minLat is required and must be a number when using viewport" }];
    }
    if (maxLngR.isErr()) {
        errors.maxLng = [{ code: "required", message: "maxLng is required and must be a number when using viewport" }];
    }
    if (maxLatR.isErr()) {
        errors.maxLat = [{ code: "required", message: "maxLat is required and must be a number when using viewport" }];
    }
    if (
        Object.keys(errors).length > 0 ||
        minLngR.isErr() ||
        minLatR.isErr() ||
        maxLngR.isErr() ||
        maxLatR.isErr()
    ) {
        return err({ kind: "ValidationError", errors });
    }

    const minLng = minLngR.value;
    const minLat = minLatR.value;
    const maxLng = maxLngR.value;
    const maxLat = maxLatR.value;

    if (minLng >= maxLng) {
        (errors.minLng ??= []).push({
            code: "invalid",
            message: "minLng must be less than maxLng",
        });
    }
    if (minLat >= maxLat) {
        (errors.minLat ??= []).push({
            code: "invalid",
            message: "minLat must be less than maxLat",
        });
    }
    const width = maxLng - minLng;
    const height = maxLat - minLat;
    if (width > MAX_BOUNDS_DEGREES || height > MAX_BOUNDS_DEGREES) {
        (errors.minLng ??= []).push({
            code: "invalid",
            message: `Bounding box side length must not exceed ${MAX_BOUNDS_DEGREES} degrees`,
        });
    }
    if (Object.keys(errors).length > 0) {
        return err({ kind: "ValidationError", errors });
    }

    return ok({ minLng, minLat, maxLng, maxLat });
}

export function validateLimit(
    params: GetSpatialObjectsInput,
    hasBounds: boolean,
): Result<number, GetSpatialObjectsError> {
    if (params.limit === undefined || params.limit === "") {
        return ok(
            hasBounds ? VIEWPORT_DEFAULT_LIMIT : LEGACY_MAX_LIMIT,
        );
    }
    const n = typeof params.limit === "string" ? parseInt(params.limit, 10) : Number(params.limit);
    if (Number.isNaN(n) || !Number.isInteger(n) || n < 1) {
        return err({
            kind: "ValidationError",
            errors: {
                limit: [
                    {
                        code: "invalid",
                        message: "limit must be a positive integer",
                    },
                ],
            },
        });
    }
    const max = hasBounds ? VIEWPORT_MAX_LIMIT : LEGACY_MAX_LIMIT;
    if (n > max) {
        return err({
            kind: "ValidationError",
            errors: {
                limit: [
                    {
                        code: "invalid",
                        message: `limit must not exceed ${max}`,
                    },
                ],
            },
        });
    }
    return ok(n);
}

function validateColumnName(
    value: string | undefined,
    field: "latColumn" | "lngColumn",
    defaultValue: string,
): Result<string, GetSpatialObjectsError> {
    if (value === undefined || value === null) {
        return ok(defaultValue);
    }
    const trimmed = typeof value === "string" ? value.trim() : "";
    if (trimmed === "") {
        return ok(defaultValue);
    }
    if (!SAFE_COLUMN.test(trimmed)) {
        return err({
            kind: "ValidationError",
            errors: {
                [field]: [
                    {
                        code: "invalid_format",
                        message: `${field} must be a valid column name (letters, numbers, underscore)`,
                    },
                ],
            },
        });
    }
    return ok(trimmed);
}

export function validateGeoColumn(
    geoColumn: string | undefined,
): Result<string, GetSpatialObjectsError> {
    if (geoColumn !== undefined && typeof geoColumn === "string") {
        const trimmed = geoColumn.trim();
        if (!trimmed) {
            return err({
                kind: "ValidationError",
                errors: {
                    geoColumn: [
                        {
                            code: "invalid",
                            message:
                                "geoColumn must be non-empty when provided",
                        },
                    ],
                },
            });
        }
        if (!SAFE_GEO_COLUMN.test(trimmed)) {
            return err({
                kind: "ValidationError",
                errors: {
                    geoColumn: [
                        {
                            code: "invalid_format",
                            message:
                                "geoColumn must be a valid column name (letters, numbers, underscore, hyphen)",
                        },
                    ],
                },
            });
        }
        return ok(trimmed);
    }
    return ok(DEFAULT_GEO_COLUMN);
}
