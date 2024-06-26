import { z } from "zod";
import { PostQueryResponse } from "./types";

export const NonEmptyArraySchema = <T>(schema: z.ZodType<T>) =>
	z
		.array(schema)
		.refine((arr: unknown[]) => arr.length > 0, { message: "Array cannot be empty" });

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

export const POST_STATUSES = ["Published", "Drafts", "Scheduled", "Archived"] as const;
export const PostStatusSchema = z.enum(POST_STATUSES);

export const PostMetadataSchema = z.object({
	title: z.string(),
	author: z.string().optional(),
	publishDate: z.string().optional()
});

export const PostQueryResponseSchema: z.ZodType<PostQueryResponse> = z.record(
	z.object({
		metadata: PostMetadataSchema,
		content: z.string()
	})
);

export const FormResponseSchema = z.object({
	id: z.string(),
	userId: z.string(),
	response: z.string(),
	submittedAt: z.date()
});

export const ConnectionStatusSchema = z.enum(["disconnected", "loading", "connected"]);

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

export const WidgetDataSchema = z
	.object({
		tag: z
			.string()
			.refine((value) => !ReservedTags.includes(value), {
				message: "Widget tag name must not be an existing HTML tag."
			})
			.refine((value: string): boolean => {
				// Define the regular expression for a valid Web Component tag name
				const regex = /^[a-z]([a-z0-9.-]*-)+[a-z0-9.-]*$/;

				// Test the tag name against the regular expression
				return regex.test(value);
			}),
		content: z.string()
	})
	.required();
