import { BigQuery } from "@google-cloud/bigquery";
import { getGoogleCloudProject } from "../../../shared/config.js";
import type { GetTileRepository } from "../application/ports.js";
import { BigQueryGetTileRepository } from "./repository.js";

export function createBigQueryGetTileRepository(): GetTileRepository {
    const projectId = getGoogleCloudProject();
    const bigquery = new BigQuery(projectId ? { projectId } : undefined);
    return new BigQueryGetTileRepository(bigquery);
}

export { BigQueryGetTileRepository } from "./repository.js";
