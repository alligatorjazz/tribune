import { z } from "zod";
export const NonEmptyArraySchema = (schema) => z
    .array(schema)
    .refine((arr) => arr.length > 0, { message: "Array cannot be empty" });
// Zod schemas
export const UserSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    avatar: z.string().url()
});
export const CommentSchema = z.object({
    id: z.string(),
    userId: z.string(),
    content: z.string(),
    createdAt: z.date()
});
export const POST_STATUSES = ["Published", "Drafts", "Scheduled", "Archived"];
export const PostStatusSchema = z.enum(POST_STATUSES);
export const BlogPostSchema = z.object({
    id: z.string(),
    title: z.string(),
    content: z.string(),
    author: z.string(),
    createdAt: z.date(),
    comments: z.array(CommentSchema),
    status: PostStatusSchema
});
export const FormResponseSchema = z.object({
    id: z.string(),
    userId: z.string(),
    response: z.string(),
    submittedAt: z.date()
});
export const ConnectionStatusSchema = z.enum(["disconnected", "loading", "connected"]);
