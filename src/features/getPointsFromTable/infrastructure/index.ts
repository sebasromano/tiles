/**
 * Infrastructure layer – getPointsFromTable slice.
 * Factory wires BigQuery client and repository; mapper does row → Feature.
 */

import { BigQuery } from "@google-cloud/bigquery";
import { getGoogleCloudProject } from "../../../shared/config.js";
import type { GetPointsFromTableRepository } from "../application/ports.js";
import { BigQueryGetPointsRepository } from "./repository.js";

/** Factory: creates a BigQuery-backed repository (client from env config). */
export function createBigQueryGetPointsRepository(): GetPointsFromTableRepository {
    const projectId = getGoogleCloudProject();
    const bigquery = new BigQuery(projectId ? { projectId } : undefined);
    return new BigQueryGetPointsRepository(bigquery);
}

export { BigQueryGetPointsRepository } from "./repository.js";
export {
    mapRowToPointOfInterest,
    parseWktPoint,
    type BigQueryRow,
} from "./mapper.js";
