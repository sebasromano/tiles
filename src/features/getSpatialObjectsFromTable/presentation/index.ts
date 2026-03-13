import type { FastifyInstance, FastifyRequest } from "fastify";
import type {
    GetSpatialObjectsError,
    GetSpatialObjectsInput,
    GetSpatialObjectsResult,
    IGetSpatialObjects,
} from "../application/index.js";
import type { Geometry } from "../domain/index.js";

type Querystring = GetSpatialObjectsInput;

interface GeoJsonFeature {
    type: "Feature";
    geometry: Geometry;
}

interface GeoJsonFeatureCollection {
    type: "FeatureCollection";
    features: GeoJsonFeature[];
}

export function registerGetSpatialObjectsRoute(
    app: FastifyInstance,
    getSpatialObjects: IGetSpatialObjects,
): void {
    app.get<{ Querystring: Querystring }>(
        "/spatial-objects",
        async (
            request: FastifyRequest<{ Querystring: Querystring }>,
            reply,
        ) => {
            const result = await getSpatialObjects.execute(request.query);

            if (result.isErr()) {
                return mapErrorToReply(reply, result.error);
            }

            return reply.status(200).send(toFeatureCollection(result.value));
        },
    );
}

function mapErrorToReply(reply: FastifyReplyLike, error: GetSpatialObjectsError) {
    if (error.kind === "ValidationError") {
        return reply.status(400).send({ errors: error.errors });
    }

    return reply.status(500).send({ error: error.message });
}

function toFeatureCollection(
    result: GetSpatialObjectsResult,
): GeoJsonFeatureCollection {
    return {
        type: "FeatureCollection",
        features: result.spatialObjects.map((obj) => ({
            type: "Feature",
            geometry: obj.geometry,
        })),
    };
}

type FastifyReplyLike = {
    status(code: number): {
        send(payload: unknown): unknown;
    };
};
