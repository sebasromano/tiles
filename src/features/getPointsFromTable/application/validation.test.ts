import { describe, it, expect } from "vitest";
import { GetPoisValidator } from "./validation.js";

const validator = new GetPoisValidator();

describe("GetPoisValidator", () => {
    it("returns error when tableFqn is missing", () => {
        const result = validator.validate({});

        expect(result.isErr()).toBe(true);
        if (result.isErr() && result.error.kind === "ValidationError") {
            expect(result.error.errors.tableFqn).toEqual([
                { code: "required", message: "tableFqn is required" },
            ]);
        }
    });

    it("returns error when tableFqn is empty string", () => {
        const result = validator.validate({ tableFqn: "" });

        expect(result.isErr()).toBe(true);
        if (result.isErr() && result.error.kind === "ValidationError") {
            expect(result.error.errors.tableFqn).toEqual([
                { code: "required", message: "tableFqn is required" },
            ]);
        }
    });

    it("returns error when tableFqn is invalid format", () => {
        const result = validator.validate({
            tableFqn: "not-a-fqn",
        });

        expect(result.isErr()).toBe(true);
        if (result.isErr() && result.error.kind === "ValidationError") {
            expect(result.error.errors.tableFqn).toEqual([
                {
                    code: "invalid_format",
                    message:
                        "tableFqn must be a fully qualified name (e.g. project.dataset.table)",
                },
            ]);
        }
    });

    it("returns ok with default geoColumn when only tableFqn provided", () => {
        const result = validator.validate({
            tableFqn: "my-project.my_dataset.my_table",
        });

        expect(result.isOk()).toBe(true);
        if (result.isOk()) {
            expect(result.value.tableFqn).toBe(
                "my-project.my_dataset.my_table",
            );
            expect(result.value.geoColumn).toBe("geom");
        }
    });

    it("returns ok with custom geoColumn when provided", () => {
        const result = validator.validate({
            tableFqn: "project.dataset.table",
            geoColumn: "geometry",
        });

        expect(result.isOk()).toBe(true);
        if (result.isOk()) {
            expect(result.value.tableFqn).toBe("project.dataset.table");
            expect(result.value.geoColumn).toBe("geometry");
        }
    });

    it("returns error when geoColumn is empty string", () => {
        const result = validator.validate({
            tableFqn: "project.dataset.table",
            geoColumn: "   ",
        });

        expect(result.isErr()).toBe(true);
        if (result.isErr() && result.error.kind === "ValidationError") {
            expect(result.error.errors.geoColumn).toEqual([
                {
                    code: "invalid",
                    message: "geoColumn must be non-empty when provided",
                },
            ]);
        }
    });

    it("returns merged errors when tableFqn missing and geoColumn empty", () => {
        const result = validator.validate({
            geoColumn: "",
        });

        expect(result.isErr()).toBe(true);
        if (result.isErr() && result.error.kind === "ValidationError") {
            expect(result.error.errors.tableFqn).toEqual([
                { code: "required", message: "tableFqn is required" },
            ]);
            expect(result.error.errors.geoColumn).toEqual([
                {
                    code: "invalid",
                    message: "geoColumn must be non-empty when provided",
                },
            ]);
        }
    });

    it("trims tableFqn and geoColumn", () => {
        const result = validator.validate({
            tableFqn: "  p.d.t  ",
            geoColumn: "  geom_col  ",
        });

        expect(result.isOk()).toBe(true);
        if (result.isOk()) {
            expect(result.value.tableFqn).toBe("p.d.t");
            expect(result.value.geoColumn).toBe("geom_col");
        }
    });
});
