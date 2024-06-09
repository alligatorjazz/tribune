import { faker } from "@faker-js/faker";
import { User, BlogPost, POST_STATUSES, FormResponse, Comment } from "tribune-types";

// Generate fake data
const generateUsers = (count: number): User[] => {
	return Array.from({ length: count }, () => ({
		id: faker.string.uuid(),
		name: faker.person.fullName(),
		email: faker.internet.email(),
		avatar: faker.image.avatar()
	}));
};

const generateComments = (postId: string, userIds: string[], count: number): Comment[] => {
	return Array.from({ length: count }, () => ({
		id: faker.string.uuid(),
		userId: faker.helpers.arrayElement(userIds),
		content: faker.lorem.sentences(),
		createdAt: faker.date.recent()
	}));
};

const generateBlogPosts = (userIds: string[], count: number): BlogPost[] => {
	return Array.from({ length: count }, () => {
		const id = faker.string.uuid();
		return {
			id,
			title: faker.lorem.sentence(),
			content: faker.lorem.paragraphs(),
			author: faker.internet.displayName(),
			createdAt: faker.date.past(),
			comments: generateComments(id, userIds, faker.number.int({ min: 0, max: 10 })),
			status: POST_STATUSES[faker.number.int({ min: 0, max: 3 })]
		};
	});
};

const generateFormResponses = (userIds: string[], count: number): FormResponse[] => {
	return Array.from({ length: count }, () => ({
		id: faker.string.uuid(),
		userId: faker.helpers.arrayElement(userIds),
		response: faker.lorem.sentences(),
		submittedAt: faker.date.recent()
	}));
};

// Generate and export data
const users = generateUsers(10);
const blogPosts = generateBlogPosts(
	users.map((user) => user.id),
	20
);
const formResponses = generateFormResponses(
	users.map((user) => user.id),
	20
);

export default { users, blogPosts, formResponses };
