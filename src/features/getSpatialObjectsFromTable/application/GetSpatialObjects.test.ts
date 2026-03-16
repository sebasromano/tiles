import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";
import { GetSpatialObjects } from "./GetSpatialObjects.js";
import { DEFAULT_PAGE_SIZE, encodeCursor } from "./validation.js";
import type { CursorPayload } from "./types.js";

const point = {
    geometry: {
        type: "Point" as const,
        coordinates: [-73.97, 40.77],
    },
};

describe("GetSpatialObjects", () => {
    it("returns validation errors without calling the repository", async () => {
        const repo = { getPoints: vi.fn() };
        const validator = {
            validate: vi.fn().mockReturnValue(
                err({
                    kind: "ValidationError",
                    errors: {
                        tableFqn: [
                            {
                                code: "required",
                                message: "tableFqn is required",
                            },
                        ],
                    },
                }),
            ),
        };

        const useCase = new GetSpatialObjects(repo, validator);
        const result = await useCase.execute({});

        expect(result.isErr()).toBe(true);
        expect(repo.getPoints).not.toHaveBeenCalled();
    });

    it("passes initial request to the repository with pageSize", async () => {
        const repo = {
            getPoints: vi.fn().mockResolvedValue(
                ok({
                    spatialObjects: [point],
                    nextCursor: "some-cursor",
                }),
            ),
        };
        const validator = {
            validate: vi.fn().mockReturnValue(
                ok({
                    kind: "initial",
                    tableFqn: "project.dataset.table",
                    geoColumn: "geometry",
                    pageSize: DEFAULT_PAGE_SIZE,
                }),
            ),
        };

        const useCase = new GetSpatialObjects(repo, validator);
        const result = await useCase.execute({
            tableFqn: "project.dataset.table",
            geoColumn: "geometry",
        });

        expect(repo.getPoints).toHaveBeenCalledWith({
            kind: "initial",
            tableFqn: "project.dataset.table",
            geoColumn: "geometry",
            pageSize: DEFAULT_PAGE_SIZE,
        });
        expect(result).toEqual(
            ok({
                spatialObjects: [point],
                nextCursor: "some-cursor",
            }),
        );
    });

    it("passes cursor request to the repository", async () => {
        const cursorPayload: CursorPayload = {
            jobId: "bquxjob_123",
            pageToken: "next-page-token",
            location: "us-central1",
            projectId: "my-project",
            pageSize: 5000,
        };
        const repo = {
            getPoints: vi.fn().mockResolvedValue(
                ok({
                    spatialObjects: [point],
                    nextCursor: null,
                }),
            ),
        };
        const validator = {
            validate: vi.fn().mockReturnValue(
                ok({
                    kind: "cursor",
                    cursor: cursorPayload,
                }),
            ),
        };

        const useCase = new GetSpatialObjects(repo, validator);
        const cursor = encodeCursor(cursorPayload);
        const result = await useCase.execute({ cursor });

        expect(repo.getPoints).toHaveBeenCalledWith({
            kind: "cursor",
            cursor: cursorPayload,
        });
        expect(result).toEqual(
            ok({
                spatialObjects: [point],
                nextCursor: null,
            }),
        );
    });

    it("returns nextCursor: null on the last page", async () => {
        const repo = {
            getPoints: vi.fn().mockResolvedValue(
                ok({
                    spatialObjects: [point],
                    nextCursor: null,
                }),
            ),
        };
        const validator = {
            validate: vi.fn().mockReturnValue(
                ok({
                    kind: "initial",
                    tableFqn: "project.dataset.table",
                    geoColumn: "geom",
                    pageSize: 5000,
                }),
            ),
        };

        const useCase = new GetSpatialObjects(repo, validator);
        const result = await useCase.execute({
            tableFqn: "project.dataset.table",
            pageSize: "5000",
        });

        expect(result.isOk()).toBe(true);
        if (result.isOk()) {
            expect(result.value.nextCursor).toBeNull();
        }
    });

    it("propagates repository errors", async () => {
        const repo = {
            getPoints: vi.fn().mockResolvedValue(
                err({
                    kind: "RepositoryError",
                    message: "BigQuery failed",
                }),
            ),
        };
        const validator = {
            validate: vi.fn().mockReturnValue(
                ok({
                    kind: "initial",
                    tableFqn: "project.dataset.table",
                    geoColumn: "geom",
                    pageSize: 10000,
                }),
            ),
        };

        const useCase = new GetSpatialObjects(repo, validator);
        const result = await useCase.execute({
            tableFqn: "project.dataset.table",
        });

        expect(result.isErr()).toBe(true);
        if (result.isErr()) {
            expect(result.error).toEqual({
                kind: "RepositoryError",
                message: "BigQuery failed",
            });
        }
    });
});
