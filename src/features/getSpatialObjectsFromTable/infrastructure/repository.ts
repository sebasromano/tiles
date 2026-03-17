import type { BigQuery } from "@google-cloud/bigquery";
import { errAsync, okAsync, ResultAsync, type Result } from "neverthrow";
import type {
    GetSpatialObjectsFromTableRepository,
    GetSpatialObjectsFromTableRepositoryError,
    GetSpatialObjectsRequest,
} from "../application/ports.js";
import type { SpatialObject } from "../domain/index.js";
import { mapRowToSpatialObject, type BigQueryRow } from "./mapper.js";

export class BigQueryGetSpatialObjectsRepository
    implements GetSpatialObjectsFromTableRepository
{
    constructor(private readonly bigquery: BigQuery) {}

    async getPoints(
        request: GetSpatialObjectsRequest,
    ): Promise<
        Result<SpatialObject[], GetSpatialObjectsFromTableRepositoryError>
    > {
        const geoCol = request.geoColumn;
        const table = request.tableFqn;

        let query: string;
        let params: Record<string, unknown>;

        if (request.bounds) {
            const { minLng, minLat, maxLng, maxLat } = request.bounds;
            query = `SELECT \`${geoCol}\` FROM \`${table}\` WHERE ST_IntersectsBox(\`${geoCol}\`, @minLng, @minLat, @maxLng, @maxLat) ORDER BY ST_X(ST_Centroid(\`${geoCol}\`)), ST_Y(ST_Centroid(\`${geoCol}\`))`;
            params = {
                minLng,
                minLat,
                maxLng,
                maxLat,
            };
        } else {
            query = `SELECT \`${geoCol}\` FROM \`${table}\` LIMIT @limit`;
            params = { limit: request.limit };
        }

        const resultAsync = ResultAsync.fromPromise(
            this.bigquery.query({
                query,
                params,
            }),
            (e: unknown): GetSpatialObjectsFromTableRepositoryError => ({
                kind: "RepositoryError",
                message: e instanceof Error ? e.message : String(e),
            }),
        );

        return resultAsync.andThen(([rows]) => {
            const objects: SpatialObject[] = [];
            for (const row of rows as BigQueryRow[]) {
                const result = mapRowToSpatialObject(row, request.geoColumn);
                if (result.isErr()) return errAsync(result.error);
                objects.push(result.value);
            }
            return okAsync(objects);
        });
    }
}
