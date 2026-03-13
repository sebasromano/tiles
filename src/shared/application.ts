import type { Result } from "neverthrow";

export interface Validator<TParams, TValidated, TError> {
    validate(params: TParams): Result<TValidated, TError>;
}

export interface UseCase<TInput, TOutput, TError> {
    execute(input: TInput): Promise<Result<TOutput, TError>>;
}
