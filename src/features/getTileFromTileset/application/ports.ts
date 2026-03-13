import type { Result } from "neverthrow";
import type { Tile } from "../domain/index.js";

export interface GetTileRequest {
    tilesetFQN: string;
    z: number;
    x: number;
    y: number;
}

export interface GetTileRepositoryError {
    kind: "RepositoryError";
    message: string;
}

export interface GetTileRepository {
    getTile(
        request: GetTileRequest,
    ): Promise<Result<Tile | null, GetTileRepositoryError>>;
}
