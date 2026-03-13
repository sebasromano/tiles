import Fastify from "fastify";
import cors from "@fastify/cors";
import { previewHtml } from "./preview.js";
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

    app.register(cors);

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

    app.get<{ Querystring: { url?: string } }>(
        "/preview",
        async (request, reply) => {
            const url =
                request.query.url ??
                "https://carto.backlogmd.com/spatial-objects?tableFqn=carto-demo-data.demo_tables.usa_census_tracts";
            return reply.type("text/html").send(previewHtml(url));
        },
    );
    return app;
}
