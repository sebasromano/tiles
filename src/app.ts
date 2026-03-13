import Fastify from "fastify";
import {
    GetSpatialObjects,
    GetSpatialObjectsValidator,
    type GetSpatialObjectsFromTableRepository,
    type IGetSpatialObjects,
} from "./features/getSpatialObjectsFromTable/application/index.js";
import { createBigQueryGetSpatialObjectsRepository } from "./features/getSpatialObjectsFromTable/infrastructure/index.js";
import { registerGetSpatialObjectsRoute } from "./features/getSpatialObjectsFromTable/presentation/index.js";

export function buildApp(
    opts: {
        getSpatialObjects?: IGetSpatialObjects;
        getPointsRepository?: GetSpatialObjectsFromTableRepository;
    } = {},
) {
    const app = Fastify({ logger: true });

    app.get("/health", async (_request, reply) => {
        return reply.status(200).send({ status: "ok" });
    });

    const getSpatialObjects =
        opts.getSpatialObjects ??
        new GetSpatialObjects(
            opts.getPointsRepository ??
                createBigQueryGetSpatialObjectsRepository(),
            new GetSpatialObjectsValidator(),
        );
    registerGetSpatialObjectsRoute(app, getSpatialObjects);

    return app;
}
