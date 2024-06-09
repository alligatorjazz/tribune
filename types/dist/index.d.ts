import { z } from "zod";
export declare const NonEmptyArraySchema: <T>(schema: z.ZodType<T>) => z.ZodEffects<z.ZodArray<z.ZodType<T, z.ZodTypeDef, T>, "many">, T[], T[]>;
export declare const UserSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    email: z.ZodString;
    avatar: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id?: string;
    name?: string;
    email?: string;
    avatar?: string;
}, {
    id?: string;
    name?: string;
    email?: string;
    avatar?: string;
}>;
export declare const CommentSchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodString;
    content: z.ZodString;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id?: string;
    content?: string;
    userId?: string;
    createdAt?: Date;
}, {
    id?: string;
    content?: string;
    userId?: string;
    createdAt?: Date;
}>;
export declare const POST_STATUSES: readonly ["Published", "Drafts", "Scheduled", "Archived"];
export declare const PostStatusSchema: z.ZodEnum<["Published", "Drafts", "Scheduled", "Archived"]>;
export declare const BlogPostSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    content: z.ZodString;
    author: z.ZodString;
    createdAt: z.ZodDate;
    comments: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        userId: z.ZodString;
        content: z.ZodString;
        createdAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        content?: string;
        userId?: string;
        createdAt?: Date;
    }, {
        id?: string;
        content?: string;
        userId?: string;
        createdAt?: Date;
    }>, "many">;
    status: z.ZodEnum<["Published", "Drafts", "Scheduled", "Archived"]>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    content?: string;
    title?: string;
    status?: "Published" | "Drafts" | "Scheduled" | "Archived";
    createdAt?: Date;
    author?: string;
    comments?: {
        id?: string;
        content?: string;
        userId?: string;
        createdAt?: Date;
    }[];
}, {
    id?: string;
    content?: string;
    title?: string;
    status?: "Published" | "Drafts" | "Scheduled" | "Archived";
    createdAt?: Date;
    author?: string;
    comments?: {
        id?: string;
        content?: string;
        userId?: string;
        createdAt?: Date;
    }[];
}>;
export declare const FormResponseSchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodString;
    response: z.ZodString;
    submittedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id?: string;
    userId?: string;
    response?: string;
    submittedAt?: Date;
}, {
    id?: string;
    userId?: string;
    response?: string;
    submittedAt?: Date;
}>;
export declare const ConnectionStatusSchema: z.ZodEnum<["disconnected", "loading", "connected"]>;
declare const BaseSiteNodeSchema: z.ZodObject<{
    title: z.ZodString;
}, "strip", z.ZodTypeAny, {
    title?: string;
}, {
    title?: string;
}>;
export declare const SiteNodeSchema: z.ZodType<SiteNode>;
declare const IndexSiteNodeSchema: z.ZodObject<{
    title: z.ZodString;
    route: z.ZodLiteral<"/">;
    children: z.ZodOptional<z.ZodUndefined>;
}, "strip", z.ZodTypeAny, {
    title?: string;
    children?: undefined;
    route?: "/";
}, {
    title?: string;
    children?: undefined;
    route?: "/";
}>;
export declare const SiteMapSchema: z.ZodType<SiteMap>;
export type User = z.infer<typeof UserSchema>;
export type Comment = z.infer<typeof CommentSchema>;
export type PostStatus = z.infer<typeof PostStatusSchema>;
export type BlogPost = z.infer<typeof BlogPostSchema>;
export type FormResponse = z.infer<typeof FormResponseSchema>;
export type ConnectionStatus = z.infer<typeof ConnectionStatusSchema>;
export type SiteNode = z.infer<typeof BaseSiteNodeSchema> & ({
    route?: string;
    children?: NonEmptyArray<SiteNode>;
} | {
    index: true;
});
export type SiteMap = [z.infer<typeof IndexSiteNodeSchema>, ...SiteNode[]];
export type NonEmptyArray<T> = z.infer<ReturnType<typeof NonEmptyArraySchema<T>>>;
export {};
