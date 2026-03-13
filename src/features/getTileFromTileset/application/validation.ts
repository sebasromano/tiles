import { err, ok, type Result } from "neverthrow";
import type { Validator } from "../../../shared/index.js";
import type {
    GetTileCommand,
    GetTileError,
    GetTileInput,
    ValidationErrors,
} from "./types.js";

const SAFE_TABLE_FQN = /^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;

export type IGetTileValidator = Validator<
    GetTileInput,
    GetTileCommand,
    GetTileError
>;

export class GetTileValidator implements IGetTileValidator {
    validate(
        params: GetTileInput,
    ): Result<GetTileCommand, GetTileError> {
        const errors: ValidationErrors = {};

        const tilesetFQN = validateTilesetFQN(params.tilesetFQN);
        if (tilesetFQN.isErr()) {
            Object.assign(errors, tilesetFQN.error);
        }

        const z = validateCoordinate("z", params.z);
        if (z.isErr()) {
            Object.assign(errors, z.error);
        }

        const x = validateCoordinate("x", params.x);
        if (x.isErr()) {
            Object.assign(errors, x.error);
        }

        const y = validateCoordinate("y", params.y);
        if (y.isErr()) {
            Object.assign(errors, y.error);
        }

        if (Object.keys(errors).length > 0) {
            return err({ kind: "ValidationError", errors });
        }

        return ok({
            tilesetFQN: tilesetFQN._unsafeUnwrap(),
            z: z._unsafeUnwrap(),
            x: x._unsafeUnwrap(),
            y: y._unsafeUnwrap(),
        });
    }
}

function validateTilesetFQN(
    value: string | undefined,
): Result<string, ValidationErrors> {
    const trimmed = typeof value === "string" ? value.trim() : "";
    if (!trimmed) {
        return err({
            tilesetFQN: [
                { code: "required", message: "tilesetFQN is required" },
            ],
        });
    }
    if (!SAFE_TABLE_FQN.test(trimmed)) {
        return err({
            tilesetFQN: [
                {
                    code: "invalid_format",
                    message:
                        "tilesetFQN must be a fully qualified name (e.g. project.dataset.tileset)",
                },
            ],
        });
    }
    return ok(trimmed);
}

function validateCoordinate(
    name: string,
    value: string | undefined,
): Result<number, ValidationErrors> {
    if (value === undefined || value === "") {
        return err({
            [name]: [{ code: "required", message: `${name} is required` }],
        });
    }
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 0) {
        return err({
            [name]: [
                {
                    code: "invalid",
                    message: `${name} must be a non-negative integer`,
                },
            ],
        });
    }
    return ok(parsed);
}
