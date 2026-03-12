import type { FastifyInstance, FastifyRequest } from "fastify";
import type {
    GetPoisError,
    GetPoisQuery,
    GetPoisResult,
    IGetPois,
} from "../application/index.js";

type Querystring = GetPoisQuery;

interface GeoJsonPoint {
    type: "Point";
    coordinates: [number, number];
}

interface GeoJsonFeature {
    type: "Feature";
    geometry: GeoJsonPoint;
}

interface GeoJsonFeatureCollection {
    type: "FeatureCollection";
    features: GeoJsonFeature[];
}

export function registerGetPoisRoute(
    app: FastifyInstance,
    getPois: IGetPois,
): void {
    app.get<{ Querystring: Querystring }>(
        "/pois",
        async (
            request: FastifyRequest<{ Querystring: Querystring }>,
            reply,
        ) => {
            const result = await getPois.execute(request.query);

            if (result.isErr()) {
                return mapErrorToReply(reply, result.error);
            }

            return reply.status(200).send(toFeatureCollection(result.value));
        },
    );
}

function mapErrorToReply(reply: FastifyReplyLike, error: GetPoisError) {
    if (error.kind === "ValidationError") {
        return reply.status(400).send({ errors: error.errors });
    }

    return reply.status(500).send({ error: error.message });
}

function toFeatureCollection(result: GetPoisResult): GeoJsonFeatureCollection {
    return {
        type: "FeatureCollection",
        features: result.pois.map((poi) => ({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [
                    poi.coordinates.longitude,
                    poi.coordinates.latitude,
                ],
            },
        })),
    };
}

type FastifyReplyLike = {
    status(code: number): {
        send(payload: unknown): unknown;
    };
};
