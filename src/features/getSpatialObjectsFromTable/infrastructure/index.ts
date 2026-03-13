import { BigQuery } from "@google-cloud/bigquery";
import { getGoogleCloudProject } from "../../../shared/config.js";
import type { GetSpatialObjectsFromTableRepository } from "../application/ports.js";
import { BigQueryGetSpatialObjectsRepository } from "./repository.js";

export function createBigQueryGetSpatialObjectsRepository(): GetSpatialObjectsFromTableRepository {
    const projectId = getGoogleCloudProject();
    const bigquery = new BigQuery(projectId ? { projectId } : undefined);
    return new BigQueryGetSpatialObjectsRepository(bigquery);
}

export { BigQueryGetSpatialObjectsRepository } from "./repository.js";
export {
    mapRowToSpatialObject,
    parseGeometry,
    type BigQueryRow,
} from "./mapper.js";
