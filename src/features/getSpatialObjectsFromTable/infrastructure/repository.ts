import type { BigQuery } from "@google-cloud/bigquery";
import { err, ok, ResultAsync, type Result } from "neverthrow";
import type {
    GetSpatialObjectsFromTableRepository,
    GetSpatialObjectsFromTableRepositoryError,
    GetSpatialObjectsRepositoryResult,
    GetSpatialObjectsRequest,
} from "../application/ports.js";
import type { SpatialObject } from "../domain/index.js";
import { encodeCursor } from "../application/validation.js";
import { mapRowToSpatialObject, type BigQueryRow } from "./mapper.js";

const GEO_ALIAS = "geom";

export class BigQueryGetSpatialObjectsRepository
    implements GetSpatialObjectsFromTableRepository
{
    constructor(private readonly bigquery: BigQuery) {}

    async getPoints(
        request: GetSpatialObjectsRequest,
    ): Promise<
        Result<
            GetSpatialObjectsRepositoryResult,
            GetSpatialObjectsFromTableRepositoryError
        >
    > {
        if (request.kind === "initial") {
            return this.executeInitialQuery(request);
        }
        return this.executeFollowUpQuery(request);
    }

    private async executeInitialQuery(
        request: Extract<GetSpatialObjectsRequest, { kind: "initial" }>,
    ): Promise<
        Result<
            GetSpatialObjectsRepositoryResult,
            GetSpatialObjectsFromTableRepositoryError
        >
    > {
        const query = `SELECT \`${request.geoColumn}\` AS ${GEO_ALIAS} FROM \`${request.tableFqn}\``;

        const jobResult = await ResultAsync.fromPromise(
            this.bigquery.createQueryJob({ query }),
            (e: unknown): GetSpatialObjectsFromTableRepositoryError => ({
                kind: "RepositoryError",
                message: e instanceof Error ? e.message : String(e),
            }),
        );

        if (jobResult.isErr()) return err(jobResult.error);
        const [job] = jobResult.value;

        const metadata = job.metadata;
        const location =
            metadata?.jobReference?.location ??
            metadata?.configuration?.query?.location ??
            "";
        const projectId =
            metadata?.jobReference?.projectId ??
            metadata?.configuration?.query?.projectId ??
            "";

        const queryResult = await ResultAsync.fromPromise(
            job.getQueryResults({
                maxResults: request.pageSize,
                autoPaginate: false,
            }),
            (e: unknown): GetSpatialObjectsFromTableRepositoryError => ({
                kind: "RepositoryError",
                message: e instanceof Error ? e.message : String(e),
            }),
        );

        if (queryResult.isErr()) return err(queryResult.error);
        const [rows, , response] = queryResult.value;

        return this.mapResults(
            rows as BigQueryRow[],
            GEO_ALIAS,
            response?.pageToken ?? null,
            job.id!,
            location,
            projectId,
            request.pageSize,
        );
    }

    private async executeFollowUpQuery(
        request: Extract<GetSpatialObjectsRequest, { kind: "cursor" }>,
    ): Promise<
        Result<
            GetSpatialObjectsRepositoryResult,
            GetSpatialObjectsFromTableRepositoryError
        >
    > {
        const job = this.bigquery.job(request.cursor.jobId, {
            location: request.cursor.location,
            projectId: request.cursor.projectId,
        });

        const queryResult = await ResultAsync.fromPromise(
            job.getQueryResults({
                pageToken: request.cursor.pageToken,
                maxResults: request.cursor.pageSize,
                autoPaginate: false,
            }),
            (e: unknown): GetSpatialObjectsFromTableRepositoryError => ({
                kind: "RepositoryError",
                message: e instanceof Error ? e.message : String(e),
            }),
        );

        if (queryResult.isErr()) return err(queryResult.error);
        const [rows, , response] = queryResult.value;

        return this.mapResults(
            rows as BigQueryRow[],
            GEO_ALIAS,
            response?.pageToken ?? null,
            request.cursor.jobId,
            request.cursor.location,
            request.cursor.projectId,
            request.cursor.pageSize,
        );
    }

    private mapResults(
        rows: BigQueryRow[],
        geoColumn: string,
        pageToken: string | null,
        jobId: string,
        location: string,
        projectId: string,
        pageSize: number,
    ): Result<
        GetSpatialObjectsRepositoryResult,
        GetSpatialObjectsFromTableRepositoryError
    > {
        const objects: SpatialObject[] = [];
        for (const row of rows) {
            const result = mapRowToSpatialObject(row, geoColumn);
            if (result.isErr()) return err(result.error);
            objects.push(result.value);
        }

        const nextCursor = pageToken
            ? encodeCursor({
                  jobId,
                  pageToken,
                  location,
                  projectId,
                  pageSize,
              })
            : null;

        return ok({
            spatialObjects: objects,
            nextCursor,
        });
    }
}
