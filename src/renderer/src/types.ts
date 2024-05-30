// Interfaces
export interface User {
	id: string;
	name: string;
	email: string;
	avatar: string;
}

export interface Comment {
	id: string;
	userId: string;
	content: string;
	createdAt: Date;
}

export const POST_STATUSES = ["Published", "Drafts", "Scheduled", "Archived"] as const;
export type PostStatus = (typeof POST_STATUSES)[number];

export interface BlogPost {
	id: string;
	title: string;
	content: string;
	author: string;
	createdAt: Date;
	comments: Comment[];
	status: PostStatus;
}

export interface FormResponse {
	id: string;
	userId: string;
	response: string;
	submittedAt: Date;
}
