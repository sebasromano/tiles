import { err, ok, type Result } from "neverthrow";
import type { UseCase } from "../../../shared/index.js";
import type { GetSpatialObjectsFromTableRepository } from "./ports.js";
import type {
    GetSpatialObjectsError,
    GetSpatialObjectsInput,
    GetSpatialObjectsResult,
} from "./types.js";
import type { IGetSpatialObjectsValidator } from "./validation.js";

export const GET_SPATIAL_OBJECTS_LIMIT = 100000;

export type IGetSpatialObjects = UseCase<
    GetSpatialObjectsInput,
    GetSpatialObjectsResult,
    GetSpatialObjectsError
>;

export class GetSpatialObjects implements IGetSpatialObjects {
    constructor(
        private readonly repo: GetSpatialObjectsFromTableRepository,
        private readonly validator: IGetSpatialObjectsValidator,
    ) {}

    async execute(
        input: GetSpatialObjectsInput,
    ): Promise<Result<GetSpatialObjectsResult, GetSpatialObjectsError>> {
        const validated = this.validator.validate(input);
        if (validated.isErr()) return err(validated.error);

        const result = await this.repo.getPoints({
            tableFqn: validated.value.tableFqn,
            geoColumn: validated.value.geoColumn,
            bounds: validated.value.bounds,
            limit: validated.value.limit,
            latColumn: validated.value.latColumn,
            lngColumn: validated.value.lngColumn,
        });
        if (result.isErr()) return err(result.error);

        return ok({ spatialObjects: result.value });
    }
}
