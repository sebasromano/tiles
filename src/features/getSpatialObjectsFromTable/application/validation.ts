import { err, ok, type Result } from "neverthrow";
import type { Validator } from "../../../shared/index.js";
import type {
    GetSpatialObjectsCommand,
    GetSpatialObjectsError,
    GetSpatialObjectsInput,
    ValidationErrors,
} from "./types.js";

const DEFAULT_GEO_COLUMN = "geom";

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
