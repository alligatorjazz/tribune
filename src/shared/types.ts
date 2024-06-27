import { z } from "zod";
import {
	CommentSchema,
	ConnectionStatusSchema,
	FormResponseSchema,
	NonEmptyArraySchema,
	PostMetadataSchema,
	PostStatusSchema,
	UserSchema,
	WidgetDataSchema
} from "./schemas";

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type PostData = { metadata: PostMetadata; content: string };
export type PostQueryResponse = {
	[slug: string]: { metadata: PostMetadata; content: string };
};

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
export type WidgetData = z.infer<typeof WidgetDataSchema>;
