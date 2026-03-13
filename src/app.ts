import Fastify from "fastify";
import cors from "@fastify/cors";
import { previewHtml, tilePreviewHtml } from "./preview.js";
import {
    GetSpatialObjects,
    GetSpatialObjectsValidator,
    type GetSpatialObjectsFromTableRepository,
    type IGetSpatialObjects,
} from "./features/getSpatialObjectsFromTable/application/index.js";
import { createBigQueryGetSpatialObjectsRepository } from "./features/getSpatialObjectsFromTable/infrastructure/index.js";
import { registerGetSpatialObjectsRoute } from "./features/getSpatialObjectsFromTable/presentation/index.js";
import {
    GetTile,
    GetTileValidator,
    type GetTileRepository,
    type IGetTile,
} from "./features/getTileFromTileset/application/index.js";
import { createBigQueryGetTileRepository } from "./features/getTileFromTileset/infrastructure/index.js";
import { registerGetTileRoute } from "./features/getTileFromTileset/presentation/index.js";

export function buildApp(
    opts: {
        getSpatialObjects?: IGetSpatialObjects;
        getPointsRepository?: GetSpatialObjectsFromTableRepository;
        getTile?: IGetTile;
        getTileRepository?: GetTileRepository;
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

    const getTile =
        opts.getTile ??
        new GetTile(
            opts.getTileRepository ?? createBigQueryGetTileRepository(),
            new GetTileValidator(),
        );
    registerGetTileRoute(app, getTile);

    app.get<{ Querystring: { url?: string } }>(
        "/preview/spatial-objects",
        async (request, reply) => {
            const url =
                request.query.url ??
                "https://carto.backlogmd.com/spatial-objects?tableFqn=carto-demo-data.demo_tables.spain_earthquakes";
            return reply.type("text/html").send(previewHtml(url));
        },
    );

    app.get<{ Querystring: { tilesetFQN?: string } }>(
        "/preview/tiles",
        async (request, reply) => {
            const tilesetFQN =
                request.query.tilesetFQN ??
                "carto-demo-data.demo_tilesets.osm_buildings";
            const tilesUrl = `https://carto.backlogmd.com/tilesets/${tilesetFQN}/tiles/{z}/{x}/{y}`;
            return reply.type("text/html").send(tilePreviewHtml(tilesUrl));
        },
    );

    return app;
}
