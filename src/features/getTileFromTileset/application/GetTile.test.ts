import { describe, it, expect } from "vitest";
import { ok, err } from "neverthrow";
import { GetTile } from "./GetTile.js";
import { GetTileValidator } from "./validation.js";
import type { GetTileRepository } from "./ports.js";

const validInput = {
    tilesetFQN: "project.dataset.tileset",
    z: "14",
    x: "4602",
    y: "9819",
};

const tileData = Buffer.from("fake-mvt-data");

const foundRepo: GetTileRepository = {
    getTile: () =>
        Promise.resolve(ok({ z: 14, x: 4602, y: 9819, data: tileData })),
};

const notFoundRepo: GetTileRepository = {
    getTile: () => Promise.resolve(ok(null)),
};

const failingRepo: GetTileRepository = {
    getTile: () =>
        Promise.resolve(
            err({ kind: "RepositoryError" as const, message: "BigQuery down" }),
        ),
};

describe("GetTile use case", () => {
    it("returns tile data on success", async () => {
        const useCase = new GetTile(foundRepo, new GetTileValidator());
        const result = await useCase.execute(validInput);

        expect(result.isOk()).toBe(true);
        expect(result._unsafeUnwrap().data).toEqual(tileData);
    });

    it("returns ValidationError for invalid input", async () => {
        const useCase = new GetTile(foundRepo, new GetTileValidator());
        const result = await useCase.execute({});

        expect(result.isErr()).toBe(true);
        expect(result._unsafeUnwrapErr().kind).toBe("ValidationError");
    });

    it("returns TileNotFoundError when repo returns null", async () => {
        const useCase = new GetTile(notFoundRepo, new GetTileValidator());
        const result = await useCase.execute(validInput);

        expect(result.isErr()).toBe(true);
        expect(result._unsafeUnwrapErr().kind).toBe("TileNotFoundError");
    });

    it("returns RepositoryError when repo fails", async () => {
        const useCase = new GetTile(failingRepo, new GetTileValidator());
        const result = await useCase.execute(validInput);

        expect(result.isErr()).toBe(true);
        const error = result._unsafeUnwrapErr();
        expect(error.kind).toBe("RepositoryError");
        if (error.kind === "RepositoryError") {
            expect(error.message).toBe("BigQuery down");
        }
    });
});
