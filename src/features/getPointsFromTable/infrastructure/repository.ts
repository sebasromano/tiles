import type { BigQuery } from "@google-cloud/bigquery";
import { errAsync, okAsync, ResultAsync, type Result } from "neverthrow";
import type {
    GetPointsFromTableRepository,
    GetPointsFromTableRepositoryError,
    GetPointsRequest,
} from "../application/ports.js";
import type { PointOfInterest } from "../domain/index.js";
import { mapRowToPointOfInterest, type BigQueryRow } from "./mapper.js";

export class BigQueryGetPointsRepository implements GetPointsFromTableRepository {
    constructor(private readonly bigquery: BigQuery) {}

    async getPoints(
        request: GetPointsRequest,
    ): Promise<Result<PointOfInterest[], GetPointsFromTableRepositoryError>> {
        const query = `SELECT \`${request.geoColumn}\` FROM \`${request.tableFqn}\` LIMIT ?`;
        const resultAsync = ResultAsync.fromPromise(
            this.bigquery.query({
                query,
                params: [request.limit],
            }),
            (e: unknown): GetPointsFromTableRepositoryError => ({
                kind: "RepositoryError",
                message: e instanceof Error ? e.message : String(e),
            }),
        );

        return resultAsync.andThen(([rows]) => {
            const pois: PointOfInterest[] = [];
            for (const row of rows as BigQueryRow[]) {
                const fr = mapRowToPointOfInterest(row, request.geoColumn);
                if (fr.isErr()) return errAsync(fr.error);
                pois.push(fr.value);
            }
            return okAsync(pois);
        });
    }
}
