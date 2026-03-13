import { gunzipSync } from "node:zlib";
import type { BigQuery } from "@google-cloud/bigquery";
import { okAsync, ResultAsync, type Result } from "neverthrow";
import type {
    GetTileRepository,
    GetTileRepositoryError,
    GetTileRequest,
} from "../application/ports.js";
import type { Tile } from "../domain/index.js";

export class BigQueryGetTileRepository implements GetTileRepository {
    constructor(private readonly bigquery: BigQuery) {}

    async getTile(
        request: GetTileRequest,
    ): Promise<Result<Tile | null, GetTileRepositoryError>> {
        const query = `SELECT data FROM \`${request.tilesetFQN}\` WHERE z = @z AND x = @x AND y = @y LIMIT 1`;

        const resultAsync = ResultAsync.fromPromise(
            this.bigquery.query({
                query,
                params: { z: request.z, x: request.x, y: request.y },
            }),
            (e: unknown): GetTileRepositoryError => ({
                kind: "RepositoryError",
                message: e instanceof Error ? e.message : String(e),
            }),
        );

        return resultAsync.andThen(([rows]) => {
            const typedRows = rows as Array<{ data: string }>;
            if (typedRows.length === 0) {
                return okAsync(null);
            }

            const gzipped = Buffer.from(typedRows[0].data, "base64");
            const mvt = gunzipSync(gzipped);

            return okAsync({
                z: request.z,
                x: request.x,
                y: request.y,
                data: mvt,
            } as Tile);
        });
    }
}
