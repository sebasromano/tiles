import type { FastifyInstance, FastifyRequest } from "fastify";
import type {
    GetTileError,
    GetTileInput,
    IGetTile,
} from "../application/index.js";

type Params = {
    tilesetFQN: string;
    z: string;
    x: string;
    y: string;
};

export function registerGetTileRoute(
    app: FastifyInstance,
    getTile: IGetTile,
): void {
    app.get<{ Params: Params }>(
        "/tilesets/:tilesetFQN/tiles/:z/:x/:y",
        async (request: FastifyRequest<{ Params: Params }>, reply) => {
            const input: GetTileInput = {
                tilesetFQN: request.params.tilesetFQN,
                z: request.params.z,
                x: request.params.x,
                y: request.params.y,
            };

            const result = await getTile.execute(input);

            if (result.isErr()) {
                return mapErrorToReply(reply, result.error);
            }

            return reply
                .status(200)
                .type("application/vnd.mapbox-vector-tile")
                .send(result.value.data);
        },
    );
}

type FastifyReplyLike = {
    status(code: number): {
        send(payload: unknown): unknown;
    };
};

function mapErrorToReply(reply: FastifyReplyLike, error: GetTileError) {
    if (error.kind === "ValidationError") {
        return reply.status(400).send({ errors: error.errors });
    }
    if (error.kind === "TileNotFoundError") {
        return reply.status(404).send({ error: "Tile not found" });
    }
    return reply.status(500).send({ error: error.message });
}
