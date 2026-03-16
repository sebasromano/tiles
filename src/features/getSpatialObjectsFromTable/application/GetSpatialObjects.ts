import { err, ok, type Result } from "neverthrow";
import type { UseCase } from "../../../shared/index.js";
import type { GetSpatialObjectsFromTableRepository } from "./ports.js";
import type {
    GetSpatialObjectsError,
    GetSpatialObjectsInput,
    GetSpatialObjectsResult,
} from "./types.js";
import type { IGetSpatialObjectsValidator } from "./validation.js";

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

        const result = await this.repo.getPoints(validated.value);
        if (result.isErr()) return err(result.error);

        return ok(result.value);
    }
}
