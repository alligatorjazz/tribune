"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionStatusSchema = exports.FormResponseSchema = exports.BlogPostSchema = exports.PostStatusSchema = exports.POST_STATUSES = exports.CommentSchema = exports.UserSchema = exports.NonEmptyArraySchema = void 0;
const zod_1 = require("zod");
const NonEmptyArraySchema = (schema) => zod_1.z
    .array(schema)
    .refine((arr) => arr.length > 0, { message: "Array cannot be empty" });
exports.NonEmptyArraySchema = NonEmptyArraySchema;
// Zod schemas
exports.UserSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    email: zod_1.z.string().email(),
    avatar: zod_1.z.string().url()
});
exports.CommentSchema = zod_1.z.object({
    id: zod_1.z.string(),
    userId: zod_1.z.string(),
    content: zod_1.z.string(),
    createdAt: zod_1.z.date()
});
exports.POST_STATUSES = ["Published", "Drafts", "Scheduled", "Archived"];
exports.PostStatusSchema = zod_1.z.enum(exports.POST_STATUSES);
exports.BlogPostSchema = zod_1.z.object({
    id: zod_1.z.string(),
    title: zod_1.z.string(),
    content: zod_1.z.string(),
    author: zod_1.z.string(),
    createdAt: zod_1.z.date(),
    comments: zod_1.z.array(exports.CommentSchema),
    status: exports.PostStatusSchema
});
exports.FormResponseSchema = zod_1.z.object({
    id: zod_1.z.string(),
    userId: zod_1.z.string(),
    response: zod_1.z.string(),
    submittedAt: zod_1.z.date()
});
exports.ConnectionStatusSchema = zod_1.z.enum(["disconnected", "loading", "connected"]);
