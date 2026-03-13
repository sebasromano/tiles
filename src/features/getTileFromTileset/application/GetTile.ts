import { err, ok, type Result } from "neverthrow";
import type { UseCase } from "../../../shared/index.js";
import type { GetTileRepository } from "./ports.js";
import type {
    GetTileError,
    GetTileInput,
    GetTileResult,
} from "./types.js";
import type { IGetTileValidator } from "./validation.js";

export type IGetTile = UseCase<GetTileInput, GetTileResult, GetTileError>;

export class GetTile implements IGetTile {
    constructor(
        private readonly repo: GetTileRepository,
        private readonly validator: IGetTileValidator,
    ) {}

    async execute(
        input: GetTileInput,
    ): Promise<Result<GetTileResult, GetTileError>> {
        const validated = this.validator.validate(input);
        if (validated.isErr()) return err(validated.error);

        const result = await this.repo.getTile({
            tilesetFQN: validated.value.tilesetFQN,
            z: validated.value.z,
            x: validated.value.x,
            y: validated.value.y,
        });
        if (result.isErr()) return err(result.error);

        if (result.value === null) {
            return err({ kind: "TileNotFoundError" });
        }

        return ok({ data: result.value.data });
    }
}
