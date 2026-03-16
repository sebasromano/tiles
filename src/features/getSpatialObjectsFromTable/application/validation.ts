import { err, ok, type Result } from "neverthrow";
import type { Validator } from "../../../shared/index.js";
import type {
    CursorPayload,
    GetSpatialObjectsCommand,
    GetSpatialObjectsError,
    GetSpatialObjectsInput,
    ValidationErrors,
} from "./types.js";

const DEFAULT_GEO_COLUMN = "geom";
export const DEFAULT_PAGE_SIZE = 10000;
export const MAX_PAGE_SIZE = 100000;

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
        if (params.cursor !== undefined && params.cursor !== "") {
            return validateCursorRequest(params);
        }
        return validateInitialRequest(params);
    }
}

function validateInitialRequest(
    params: GetSpatialObjectsInput,
): Result<GetSpatialObjectsCommand, GetSpatialObjectsError> {
    const errors: ValidationErrors = {};
    let tableFqn: string | null = null;
    let geoColumn: string | null = null;
    let pageSize: number | null = null;

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

    const pageSizeResult = validatePageSize(params.pageSize);
    if (pageSizeResult.isErr()) {
        const e = pageSizeResult.error;
        if (e.kind === "ValidationError") Object.assign(errors, e.errors);
    } else {
        pageSize = pageSizeResult.value;
    }

    if (Object.keys(errors).length > 0) {
        return err({ kind: "ValidationError", errors });
    }

    return ok({
        kind: "initial",
        tableFqn: tableFqn!,
        geoColumn: geoColumn!,
        pageSize: pageSize!,
    });
}

function validateCursorRequest(
    params: GetSpatialObjectsInput,
): Result<GetSpatialObjectsCommand, GetSpatialObjectsError> {
    const cursorResult = decodeCursor(params.cursor!);
    if (cursorResult.isErr()) return err(cursorResult.error);

    return ok({
        kind: "cursor",
        cursor: cursorResult.value,
    });
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

export function validatePageSize(
    pageSize: string | undefined,
): Result<number, GetSpatialObjectsError> {
    if (pageSize === undefined || pageSize === "") {
        return ok(DEFAULT_PAGE_SIZE);
    }

    const parsed = Number(pageSize);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > MAX_PAGE_SIZE) {
        return err({
            kind: "ValidationError",
            errors: {
                pageSize: [
                    {
                        code: "invalid",
                        message: `pageSize must be an integer between 1 and ${MAX_PAGE_SIZE}`,
                    },
                ],
            },
        });
    }

    return ok(parsed);
}

export function encodeCursor(payload: CursorPayload): string {
    const json = JSON.stringify(payload);
    return Buffer.from(json).toString("base64url");
}

export function decodeCursor(
    cursor: string,
): Result<CursorPayload, GetSpatialObjectsError> {
    let json: string;
    try {
        json = Buffer.from(cursor, "base64url").toString("utf-8");
    } catch {
        return err({
            kind: "ValidationError",
            errors: {
                cursor: [
                    {
                        code: "invalid_format",
                        message: "cursor must be a valid base64url string",
                    },
                ],
            },
        });
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(json);
    } catch {
        return err({
            kind: "ValidationError",
            errors: {
                cursor: [
                    {
                        code: "invalid_format",
                        message: "cursor must contain valid JSON",
                    },
                ],
            },
        });
    }

    if (typeof parsed !== "object" || parsed === null) {
        return err({
            kind: "ValidationError",
            errors: {
                cursor: [
                    {
                        code: "invalid_format",
                        message: "cursor must contain a JSON object",
                    },
                ],
            },
        });
    }

    const obj = parsed as Record<string, unknown>;
    const missing: string[] = [];
    for (const field of [
        "jobId",
        "pageToken",
        "location",
        "projectId",
    ] as const) {
        if (typeof obj[field] !== "string" || obj[field] === "") {
            missing.push(field);
        }
    }

    if (missing.length > 0) {
        return err({
            kind: "ValidationError",
            errors: {
                cursor: [
                    {
                        code: "missing_fields",
                        message: `cursor is missing required fields: ${missing.join(", ")}`,
                    },
                ],
            },
        });
    }

    if (
        typeof obj.pageSize !== "number" ||
        !Number.isInteger(obj.pageSize) ||
        obj.pageSize < 1 ||
        obj.pageSize > MAX_PAGE_SIZE
    ) {
        return err({
            kind: "ValidationError",
            errors: {
                cursor: [
                    {
                        code: "invalid",
                        message: `cursor pageSize must be an integer between 1 and ${MAX_PAGE_SIZE}`,
                    },
                ],
            },
        });
    }

    return ok({
        jobId: obj.jobId as string,
        pageToken: obj.pageToken as string,
        location: obj.location as string,
        projectId: obj.projectId as string,
        pageSize: obj.pageSize as number,
    });
}
