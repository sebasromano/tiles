import { err, ok, type Result } from "neverthrow";
import type { UseCase } from "../../../shared/index.js";
import type { GetPointsFromTableRepository } from "./ports.js";
import type { GetPoisError, GetPoisQuery, GetPoisResult } from "./types.js";
import type { IGetPoisValidator } from "./validation.js";

export const GET_POIS_LIMIT = 1000;

/** Use case interface with a single application entrypoint. */
export type IGetPois = UseCase<GetPoisQuery, GetPoisResult, GetPoisError>;

export class GetPois implements IGetPois {
    constructor(
        private readonly repo: GetPointsFromTableRepository,
        private readonly validator: IGetPoisValidator,
    ) {}

    async execute(
        query: GetPoisQuery,
    ): Promise<Result<GetPoisResult, GetPoisError>> {
        const validated = this.validator.validate(query);
        if (validated.isErr()) return err(validated.error);

        const featuresResult = await this.repo.getPoints({
            tableFqn: validated.value.tableFqn,
            geoColumn: validated.value.geoColumn,
            limit: GET_POIS_LIMIT,
        });
        if (featuresResult.isErr()) return err(featuresResult.error);

        return ok({ pois: featuresResult.value });
    }
}
