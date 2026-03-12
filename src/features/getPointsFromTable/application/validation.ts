/**
 * Validation for getPointsFromTable use case.
 * Exposes a GetPoisValidator class for injection into GetPois and separate testing.
 */

import { err, ok, type Result } from "neverthrow";
import type { Validator } from "../../../shared/index.js";
import type {
    GetPoisCommand,
    GetPoisError,
    GetPoisQuery,
    ValidationErrors,
} from "./types.js";

const DEFAULT_GEO_COLUMN = "geom";

/** Port: validator for GetPois params (shared Validator contract). */
export type IGetPoisValidator = Validator<
    GetPoisQuery,
    GetPoisCommand,
    GetPoisError
>;

/** Validates GetPoisParams and returns merged field errors or validated params. */
export class GetPoisValidator implements IGetPoisValidator {
    validate(params: GetPoisQuery): Result<GetPoisCommand, GetPoisError> {
        const errors: ValidationErrors = {};
        let tableFqn: string | null = null;
        let geoColumn: string | null = null;

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

        if (Object.keys(errors).length > 0) {
            return err({ kind: "ValidationError", errors });
        }

        return ok({
            tableFqn: tableFqn!,
            geoColumn: geoColumn!,
        });
    }
}

/** BigQuery-safe FQN: at least two segments (e.g. dataset.table), each part alphanumeric, underscore, or hyphen. */
const SAFE_TABLE_FQN = /^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;

/** Validate tableFqn: required, non-empty, BigQuery-safe identifier (e.g. project.dataset.table). */
export function validateTableFqn(
    tableFqn: string | undefined,
): Result<string, GetPoisError> {
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

/** BigQuery-safe column name: alphanumeric, underscore, hyphen. */
const SAFE_GEO_COLUMN = /^[a-zA-Z0-9_-]+$/;

/** Validate geoColumn: optional, default "geom"; if provided must be non-empty and BigQuery-safe. */
export function validateGeoColumn(
    geoColumn: string | undefined,
): Result<string, GetPoisError> {
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
