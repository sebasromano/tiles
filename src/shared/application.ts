import type { Result } from "neverthrow";

export interface Validator<TParams, TValidated, TError> {
    validate(params: TParams): Result<TValidated, TError>;
}

export interface UseCase<TRequest, TOutput, TError> {
    execute(request: TRequest): Promise<Result<TOutput, TError>>;
}
