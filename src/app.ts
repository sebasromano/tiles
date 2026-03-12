import Fastify from "fastify";
import {
    GetPois,
    GetPoisValidator,
    type GetPointsFromTableRepository,
    type IGetPois,
} from "./features/getPointsFromTable/application/index.js";
import { createBigQueryGetPointsRepository } from "./features/getPointsFromTable/infrastructure/index.js";
import { registerGetPoisRoute } from "./features/getPointsFromTable/presentation/index.js";

export function buildApp(
    opts: {
        getPois?: IGetPois;
        getPointsRepository?: GetPointsFromTableRepository;
    } = {},
) {
    const app = Fastify({ logger: true });

    app.get("/health", async (_request, reply) => {
        return reply.status(200).send({ status: "ok" });
    });

    const getPois =
        opts.getPois ??
        new GetPois(
            opts.getPointsRepository ?? createBigQueryGetPointsRepository(),
            new GetPoisValidator(),
        );
    registerGetPoisRoute(app, getPois);

    return app;
}
