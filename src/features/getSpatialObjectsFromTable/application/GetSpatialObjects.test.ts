import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";
import {
    GetSpatialObjects,
    GET_SPATIAL_OBJECTS_LIMIT,
} from "./GetSpatialObjects.js";

describe("GetSpatialObjects", () => {
    it("returns validation errors without calling the repository", async () => {
        const repo = {
            getPoints: vi.fn(),
        };
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

    it("passes validated input and application policy to the repository", async () => {
        const spatialObjects = [
            {
                geometry: {
                    type: "Point" as const,
                    coordinates: [-73.97, 40.77],
                },
            },
        ];
        const repo = {
            getPoints: vi.fn().mockResolvedValue(ok(spatialObjects)),
        };
        const validator = {
            validate: vi.fn().mockReturnValue(
                ok({
                    tableFqn: "project.dataset.table",
                    geoColumn: "geometry",
                }),
            ),
        };

        const useCase = new GetSpatialObjects(repo, validator);
        const result = await useCase.execute({
            tableFqn: "project.dataset.table",
            geoColumn: "geometry",
        });

        expect(repo.getPoints).toHaveBeenCalledWith({
            tableFqn: "project.dataset.table",
            geoColumn: "geometry",
            limit: GET_SPATIAL_OBJECTS_LIMIT,
        });
        expect(result).toEqual(ok({ spatialObjects }));
    });
});
