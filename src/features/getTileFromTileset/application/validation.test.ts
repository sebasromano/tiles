import { describe, it, expect } from "vitest";
import { GetTileValidator } from "./validation.js";

const validator = new GetTileValidator();

describe("GetTileValidator", () => {
    it("accepts valid input", () => {
        const result = validator.validate({
            tilesetFQN: "project.dataset.tileset",
            z: "14",
            x: "4602",
            y: "9819",
        });
        expect(result.isOk()).toBe(true);
        expect(result._unsafeUnwrap()).toEqual({
            tilesetFQN: "project.dataset.tileset",
            z: 14,
            x: 4602,
            y: 9819,
        });
    });

    it("accepts zero coordinates", () => {
        const result = validator.validate({
            tilesetFQN: "p.d.t",
            z: "0",
            x: "0",
            y: "0",
        });
        expect(result.isOk()).toBe(true);
    });

    it("rejects missing tilesetFQN", () => {
        const result = validator.validate({ z: "0", x: "0", y: "0" });
        expect(result.isErr()).toBe(true);
        const error = result._unsafeUnwrapErr();
        expect(error.kind).toBe("ValidationError");
        if (error.kind === "ValidationError") {
            expect(error.errors.tilesetFQN).toBeDefined();
        }
    });

    it("rejects invalid tilesetFQN format", () => {
        const result = validator.validate({
            tilesetFQN: "no-dots",
            z: "0",
            x: "0",
            y: "0",
        });
        expect(result.isErr()).toBe(true);
        const error = result._unsafeUnwrapErr();
        if (error.kind === "ValidationError") {
            expect(error.errors.tilesetFQN[0].code).toBe("invalid_format");
        }
    });

    it("rejects missing z", () => {
        const result = validator.validate({
            tilesetFQN: "p.d.t",
            x: "0",
            y: "0",
        });
        expect(result.isErr()).toBe(true);
        const error = result._unsafeUnwrapErr();
        if (error.kind === "ValidationError") {
            expect(error.errors.z).toBeDefined();
            expect(error.errors.z[0].code).toBe("required");
        }
    });

    it("rejects non-numeric z", () => {
        const result = validator.validate({
            tilesetFQN: "p.d.t",
            z: "abc",
            x: "0",
            y: "0",
        });
        expect(result.isErr()).toBe(true);
        const error = result._unsafeUnwrapErr();
        if (error.kind === "ValidationError") {
            expect(error.errors.z[0].code).toBe("invalid");
        }
    });

    it("rejects negative z", () => {
        const result = validator.validate({
            tilesetFQN: "p.d.t",
            z: "-1",
            x: "0",
            y: "0",
        });
        expect(result.isErr()).toBe(true);
        const error = result._unsafeUnwrapErr();
        if (error.kind === "ValidationError") {
            expect(error.errors.z[0].code).toBe("invalid");
        }
    });

    it("rejects float z", () => {
        const result = validator.validate({
            tilesetFQN: "p.d.t",
            z: "1.5",
            x: "0",
            y: "0",
        });
        expect(result.isErr()).toBe(true);
    });

    it("collects multiple validation errors at once", () => {
        const result = validator.validate({});
        expect(result.isErr()).toBe(true);
        const error = result._unsafeUnwrapErr();
        if (error.kind === "ValidationError") {
            expect(Object.keys(error.errors)).toContain("tilesetFQN");
            expect(Object.keys(error.errors)).toContain("z");
            expect(Object.keys(error.errors)).toContain("x");
            expect(Object.keys(error.errors)).toContain("y");
        }
    });
});
