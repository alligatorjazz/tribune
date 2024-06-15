"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WidgetDataSchema = exports.ConnectionStatusSchema = exports.FormResponseSchema = exports.BlogPostSchema = exports.PostStatusSchema = exports.POST_STATUSES = exports.CommentSchema = exports.UserSchema = exports.NonEmptyArraySchema = void 0;
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
const ReservedTags = [
    "a",
    "abbr",
    "address",
    "area",
    "article",
    "aside",
    "audio",
    "b",
    "base",
    "bdi",
    "bdo",
    "blockquote",
    "body",
    "br",
    "button",
    "canvas",
    "caption",
    "cite",
    "code",
    "col",
    "colgroup",
    "data",
    "datalist",
    "dd",
    "del",
    "details",
    "dfn",
    "dialog",
    "div",
    "dl",
    "dt",
    "em",
    "embed",
    "fieldset",
    "figcaption",
    "figure",
    "footer",
    "form",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "head",
    "header",
    "hgroup",
    "hr",
    "html",
    "i",
    "iframe",
    "img",
    "input",
    "ins",
    "kbd",
    "label",
    "legend",
    "li",
    "link",
    "main",
    "map",
    "mark",
    "menu",
    "meta",
    "meter",
    "nav",
    "noscript",
    "object",
    "ol",
    "optgroup",
    "option",
    "output",
    "p",
    "param",
    "picture",
    "pre",
    "progress",
    "q",
    "rp",
    "rt",
    "ruby",
    "s",
    "samp",
    "script",
    "section",
    "select",
    "slot",
    "small",
    "source",
    "span",
    "strong",
    "style",
    "sub",
    "summary",
    "sup",
    "table",
    "tbody",
    "td",
    "template",
    "textarea",
    "tfoot",
    "th",
    "thead",
    "time",
    "title",
    "tr",
    "track",
    "u",
    "ul",
    "var",
    "video",
    "wbr"
];
exports.WidgetDataSchema = zod_1.z
    .object({
    tag: zod_1.z.string().refine((value) => !ReservedTags.includes(value), {
        message: "Widget tag name must not be an existing HTML tag."
    }),
    content: zod_1.z.string()
})
    .required();
