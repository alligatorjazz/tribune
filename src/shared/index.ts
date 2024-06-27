import { extname } from "path-browserify";
import { z } from "zod";
export const NonEmptyArraySchema = <T>(schema: z.ZodType<T>) =>
	z
		.array(schema)
		.refine((arr: unknown[]) => arr.length > 0, { message: "Array cannot be empty" });

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

export const POST_STATUSES = ["Published", "Drafts", "Scheduled", "Archived"] as const;
export const PostStatusSchema = z.enum(POST_STATUSES);

export const PostMetadataSchema = z.object({
	title: z.string(),
	author: z.string().optional(),
	publishDate: z.string().optional()
});

export type PostQueryResponse = {
	[slug: string]: { metadata: PostMetadata; content: string };
};

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

// Define the schemas as provided
// const BaseSiteNodeSchema = z.object({
// 	localPath: z.string()
// });

// const IndexSiteNodeSchema = BaseSiteNodeSchema.extend({
// 	index: z.literal(true)
// });

// const NamedSiteNodeSchema = BaseSiteNodeSchema.extend({
// 	title: z.string().optional(),
// 	route: z.string()
// });

// const SiteNodeGroupSchema: z.ZodType<SiteNodeGroup> = NamedSiteNodeSchema.extend({
// 	children: z.lazy(() =>
// 		z.union([NamedSiteNodeSchema, IndexSiteNodeSchema, SiteNodeGroupSchema]).array()
// 	)
// });

// const SiteNodeSchema = z.union([IndexSiteNodeSchema, NamedSiteNodeSchema]);

// export const SiteMapSchema = SiteNodeSchema.array();

// Site Node Types
// Base site node interface
export interface BaseSiteNode {
	localPath: string;
	route: string;
}

// Index site node interface
export interface IndexSiteNode extends BaseSiteNode {
	index: true;
	children?: undefined;
}

// Named site node interface
export interface NamedSiteNode extends BaseSiteNode {
	title: string;
	route: string;
	index?: undefined;
	children?: undefined;
}

// Site node with children interface
export interface SiteNodeWithChildren extends BaseSiteNode {
	route: string;
	children: SiteMap;
	index?: undefined;
}

// Union type of all possible site nodes
export type SiteNode = IndexSiteNode | NamedSiteNode | SiteNodeWithChildren;

// Sitemap is an array of site nodes
export type SiteMap = SiteNode[];

// Content Types
export type User = z.infer<typeof UserSchema>;
export type Comment = z.infer<typeof CommentSchema>;
export type PostStatus = z.infer<typeof PostStatusSchema>;
export type PostMetadata = z.infer<typeof PostMetadataSchema>;

export type FormResponse = z.infer<typeof FormResponseSchema>;
export type NonEmptyArray<T> = z.infer<ReturnType<typeof NonEmptyArraySchema<T>>>;
export type ConnectionStatus = z.infer<typeof ConnectionStatusSchema>;
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

export type WidgetData = z.infer<typeof WidgetDataSchema>;

export function slugify(text: string): string {
	return text
		.toLowerCase() // Convert the string to lowercase
		.trim() // Trim whitespace from both ends of the string
		.replace(/[\s\W-]+/g, "-") // Replace spaces, non-word characters, and hyphens with a single hyphen
		.replace(/^-+|-+$/g, ""); // Remove leading and trailing hyphens
}

type ValidFrontmatterLiteral = string | number | boolean;
type ValidFrontmatterValue = ValidFrontmatterLiteral | Array<ValidFrontmatterLiteral>;
export function toFrontmatter(data: Record<string, ValidFrontmatterValue>): string {
	const frontmatterLines: string[] = [];
	for (const [key, value] of Object.entries(data)) {
		if (Array.isArray(value)) {
			const arrayValues = value
				.map((item) => {
					if (typeof item === "string") {
						return `"${item.replace(/"/g, '\\"')}"`; // Escape double quotes in strings
					} else {
						return item;
					}
				})
				.join(", ");
			frontmatterLines.push(`${key}: [${arrayValues}]`);
		} else if (typeof value === "string") {
			frontmatterLines.push(`${key}: "${value.replace(/"/g, '\\"')}"`); // Escape double quotes in strings
		} else {
			frontmatterLines.push(`${key}: ${value}`);
		}
	}

	return frontmatterLines.join("\n");
}

export function changeFileExtension(
	filePath: string,
	newExtension: string,
	allowedExtensions: string[] = []
): string {
	// Get the current extension using path.extname
	const currentExtension = extname(filePath).toLowerCase();

	// Ensure all allowedExtensions have a leading dot and are in lowercase
	const normalizedAllowedExtensions = allowedExtensions.map((ext) =>
		ext.startsWith(".") ? ext.toLowerCase() : `.${ext.toLowerCase()}`
	);

	// Check if current extension is allowed
	if (!currentExtension || !normalizedAllowedExtensions.includes(currentExtension)) {
		// Remove current extension if it exists
		const filePathWithoutExtension = currentExtension
			? filePath.slice(0, -currentExtension.length)
			: filePath;
		return `${filePathWithoutExtension}.${newExtension}`;
	}

	return filePath;
}
