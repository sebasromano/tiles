import { describe, it, expect } from "vitest";
import {
    GetSpatialObjectsValidator,
    DEFAULT_PAGE_SIZE,
    MAX_PAGE_SIZE,
    encodeCursor,
    decodeCursor,
} from "./validation.js";
import type { CursorPayload } from "./types.js";

const validator = new GetSpatialObjectsValidator();

describe("GetSpatialObjectsValidator", () => {
    describe("initial request (no cursor)", () => {
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
            const result = validator.validate({ tableFqn: "not-a-fqn" });

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

        it("returns ok with default geoColumn and default pageSize", () => {
            const result = validator.validate({
                tableFqn: "my-project.my_dataset.my_table",
            });

            expect(result.isOk()).toBe(true);
            if (result.isOk()) {
                expect(result.value).toEqual({
                    kind: "initial",
                    tableFqn: "my-project.my_dataset.my_table",
                    geoColumn: "geom",
                    pageSize: DEFAULT_PAGE_SIZE,
                });
            }
        });

        it("returns ok with custom geoColumn when provided", () => {
            const result = validator.validate({
                tableFqn: "project.dataset.table",
                geoColumn: "geometry",
            });

            expect(result.isOk()).toBe(true);
            if (result.isOk()) {
                expect(result.value).toEqual({
                    kind: "initial",
                    tableFqn: "project.dataset.table",
                    geoColumn: "geometry",
                    pageSize: DEFAULT_PAGE_SIZE,
                });
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
            const result = validator.validate({ geoColumn: "" });

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
            if (result.isOk() && result.value.kind === "initial") {
                expect(result.value.tableFqn).toBe("p.d.t");
                expect(result.value.geoColumn).toBe("geom_col");
            }
        });
    });

    describe("pageSize validation", () => {
        it("defaults to DEFAULT_PAGE_SIZE when not provided", () => {
            const result = validator.validate({
                tableFqn: "p.d.t",
            });

            expect(result.isOk()).toBe(true);
            if (result.isOk() && result.value.kind === "initial") {
                expect(result.value.pageSize).toBe(DEFAULT_PAGE_SIZE);
            }
        });

        it("accepts a valid pageSize", () => {
            const result = validator.validate({
                tableFqn: "p.d.t",
                pageSize: "5000",
            });

            expect(result.isOk()).toBe(true);
            if (result.isOk() && result.value.kind === "initial") {
                expect(result.value.pageSize).toBe(5000);
            }
        });

        it("rejects zero pageSize", () => {
            const result = validator.validate({
                tableFqn: "p.d.t",
                pageSize: "0",
            });

            expect(result.isErr()).toBe(true);
            if (result.isErr() && result.error.kind === "ValidationError") {
                expect(result.error.errors.pageSize).toBeDefined();
            }
        });

        it("rejects negative pageSize", () => {
            const result = validator.validate({
                tableFqn: "p.d.t",
                pageSize: "-10",
            });

            expect(result.isErr()).toBe(true);
            if (result.isErr() && result.error.kind === "ValidationError") {
                expect(result.error.errors.pageSize).toBeDefined();
            }
        });

        it("rejects non-integer pageSize", () => {
            const result = validator.validate({
                tableFqn: "p.d.t",
                pageSize: "3.5",
            });

            expect(result.isErr()).toBe(true);
            if (result.isErr() && result.error.kind === "ValidationError") {
                expect(result.error.errors.pageSize).toBeDefined();
            }
        });

        it("rejects non-numeric pageSize", () => {
            const result = validator.validate({
                tableFqn: "p.d.t",
                pageSize: "abc",
            });

            expect(result.isErr()).toBe(true);
            if (result.isErr() && result.error.kind === "ValidationError") {
                expect(result.error.errors.pageSize).toBeDefined();
            }
        });

        it("rejects pageSize above MAX_PAGE_SIZE", () => {
            const result = validator.validate({
                tableFqn: "p.d.t",
                pageSize: String(MAX_PAGE_SIZE + 1),
            });

            expect(result.isErr()).toBe(true);
            if (result.isErr() && result.error.kind === "ValidationError") {
                expect(result.error.errors.pageSize).toBeDefined();
            }
        });

        it("accepts pageSize at MAX_PAGE_SIZE boundary", () => {
            const result = validator.validate({
                tableFqn: "p.d.t",
                pageSize: String(MAX_PAGE_SIZE),
            });

            expect(result.isOk()).toBe(true);
            if (result.isOk() && result.value.kind === "initial") {
                expect(result.value.pageSize).toBe(MAX_PAGE_SIZE);
            }
        });

        it("accepts pageSize of 1 (minimum)", () => {
            const result = validator.validate({
                tableFqn: "p.d.t",
                pageSize: "1",
            });

            expect(result.isOk()).toBe(true);
            if (result.isOk() && result.value.kind === "initial") {
                expect(result.value.pageSize).toBe(1);
            }
        });
    });

    describe("cursor request", () => {
        const validPayload: CursorPayload = {
            jobId: "bquxjob_123",
            pageToken: "next-page-token",
            location: "us-central1",
            projectId: "my-project",
            pageSize: 5000,
        };

        it("decodes a valid cursor into a cursor command", () => {
            const cursor = encodeCursor(validPayload);
            const result = validator.validate({ cursor });

            expect(result.isOk()).toBe(true);
            if (result.isOk()) {
                expect(result.value).toEqual({
                    kind: "cursor",
                    cursor: validPayload,
                });
            }
        });

        it("cursor request works without tableFqn", () => {
            const cursor = encodeCursor(validPayload);
            const result = validator.validate({ cursor });

            expect(result.isOk()).toBe(true);
        });

        it("rejects invalid base64url string", () => {
            const result = validator.validate({ cursor: "!!!not-base64!!!" });

            expect(result.isErr()).toBe(true);
            if (result.isErr() && result.error.kind === "ValidationError") {
                expect(result.error.errors.cursor).toBeDefined();
            }
        });

        it("rejects cursor with invalid JSON", () => {
            const cursor = Buffer.from("not-json").toString("base64url");
            const result = validator.validate({ cursor });

            expect(result.isErr()).toBe(true);
            if (result.isErr() && result.error.kind === "ValidationError") {
                expect(result.error.errors.cursor).toBeDefined();
                expect(result.error.errors.cursor[0].code).toBe(
                    "invalid_format",
                );
            }
        });

        it("rejects cursor with non-object JSON", () => {
            const cursor = Buffer.from('"just a string"').toString(
                "base64url",
            );
            const result = validator.validate({ cursor });

            expect(result.isErr()).toBe(true);
            if (result.isErr() && result.error.kind === "ValidationError") {
                expect(result.error.errors.cursor).toBeDefined();
            }
        });

        it("rejects cursor missing jobId", () => {
            const { jobId: _, ...partial } = validPayload;
            const cursor = Buffer.from(JSON.stringify(partial)).toString(
                "base64url",
            );
            const result = validator.validate({ cursor });

            expect(result.isErr()).toBe(true);
            if (result.isErr() && result.error.kind === "ValidationError") {
                expect(result.error.errors.cursor[0].code).toBe(
                    "missing_fields",
                );
                expect(result.error.errors.cursor[0].message).toContain(
                    "jobId",
                );
            }
        });

        it("rejects cursor missing pageToken", () => {
            const { pageToken: _, ...partial } = validPayload;
            const cursor = Buffer.from(JSON.stringify(partial)).toString(
                "base64url",
            );
            const result = validator.validate({ cursor });

            expect(result.isErr()).toBe(true);
            if (result.isErr() && result.error.kind === "ValidationError") {
                expect(result.error.errors.cursor[0].message).toContain(
                    "pageToken",
                );
            }
        });

        it("rejects cursor missing location", () => {
            const { location: _, ...partial } = validPayload;
            const cursor = Buffer.from(JSON.stringify(partial)).toString(
                "base64url",
            );
            const result = validator.validate({ cursor });

            expect(result.isErr()).toBe(true);
            if (result.isErr() && result.error.kind === "ValidationError") {
                expect(result.error.errors.cursor[0].message).toContain(
                    "location",
                );
            }
        });

        it("rejects cursor missing projectId", () => {
            const { projectId: _, ...partial } = validPayload;
            const cursor = Buffer.from(JSON.stringify(partial)).toString(
                "base64url",
            );
            const result = validator.validate({ cursor });

            expect(result.isErr()).toBe(true);
            if (result.isErr() && result.error.kind === "ValidationError") {
                expect(result.error.errors.cursor[0].message).toContain(
                    "projectId",
                );
            }
        });

        it("rejects cursor with invalid pageSize (zero)", () => {
            const payload = { ...validPayload, pageSize: 0 };
            const cursor = Buffer.from(JSON.stringify(payload)).toString(
                "base64url",
            );
            const result = validator.validate({ cursor });

            expect(result.isErr()).toBe(true);
            if (result.isErr() && result.error.kind === "ValidationError") {
                expect(result.error.errors.cursor).toBeDefined();
            }
        });

        it("rejects cursor with invalid pageSize (above max)", () => {
            const payload = {
                ...validPayload,
                pageSize: MAX_PAGE_SIZE + 1,
            };
            const cursor = Buffer.from(JSON.stringify(payload)).toString(
                "base64url",
            );
            const result = validator.validate({ cursor });

            expect(result.isErr()).toBe(true);
            if (result.isErr() && result.error.kind === "ValidationError") {
                expect(result.error.errors.cursor).toBeDefined();
            }
        });

        it("rejects cursor with non-integer pageSize", () => {
            const payload = { ...validPayload, pageSize: 3.5 };
            const cursor = Buffer.from(JSON.stringify(payload)).toString(
                "base64url",
            );
            const result = validator.validate({ cursor });

            expect(result.isErr()).toBe(true);
        });
    });
});

describe("encodeCursor / decodeCursor", () => {
    it("round-trips a cursor payload", () => {
        const payload: CursorPayload = {
            jobId: "bquxjob_abc",
            pageToken: "tok_xyz",
            location: "EU",
            projectId: "my-proj",
            pageSize: 10000,
        };

        const encoded = encodeCursor(payload);
        const decoded = decodeCursor(encoded);

        expect(decoded.isOk()).toBe(true);
        if (decoded.isOk()) {
            expect(decoded.value).toEqual(payload);
        }
    });

    it("produces a URL-safe string (no +, /, =)", () => {
        const payload: CursorPayload = {
            jobId: "job+with/special=chars",
            pageToken: "token",
            location: "US",
            projectId: "proj",
            pageSize: 100,
        };

        const encoded = encodeCursor(payload);
        expect(encoded).not.toMatch(/[+/=]/);
    });
});
