import getFrontmatter from "front-matter";
import { mkdir, readFile, readdir, writeFile } from "fs/promises";
import { basename, extname, join } from "path";

import { getSiteFolders } from "./sites";
import {
	slugify,
	changeFileExtension,
	toFrontmatter,
	generateUniqueFilename,
	toTitleCase
} from "../shared/lib";
import { PostMetadataSchema } from "../shared/schemas";
import { PostQueryResponse, PostMetadata, PartialBy } from "../shared/types";

export async function getPosts(site: string) {
	const { postsDir } = getSiteFolders(site);
	await mkdir(postsDir, { recursive: true });
	const postFiles = await readdir(postsDir);
	const posts: PostQueryResponse = {};
	const errors: { path: string; cause: string }[] = [];

	await Promise.all(
		postFiles.map(async (file) => {
			if (![".md", ".mdx"].includes(extname(file))) {
				return;
			}
			try {
				const rawData = (await readFile(join(postsDir, file))).toString("utf-8");
				const frontmatter = getFrontmatter(rawData);
				const metadata = PostMetadataSchema.parse(frontmatter.attributes);
				const content = frontmatter.body;
				const slug = slugify(basename(basename(file, ".md"), ".mdx"));
				posts[slug] = { metadata, content };
			} catch (error) {
				errors.push({ path: file, cause: JSON.stringify(error, null, 4) });
			}
		})
	);
	if (errors.length > 0) {
		console.error(errors);
	}
	return { posts, errors };
}

export async function savePost(
	site: string,
	metadata: PartialBy<PostMetadata, "title">,
	content: string,
	slug?: string
): Promise<string> {
	let output = "";
	const { postsDir } = getSiteFolders(site);
	const title =
		metadata.title ??
		toTitleCase(
			generateUniqueFilename(
				(await readdir(postsDir, { withFileTypes: false })).map((filename) =>
					basename(basename(filename, ".md"), ".mdx")
				)
			)
		);

	const postSlug = slug ?? slugify(title);
	const postPath = changeFileExtension(join(postsDir, postSlug), ".md", [".md", ".mdx"]);
	console.log(slug, postPath);
	const rawFrontmatter = toFrontmatter({ title, ...metadata });
	output += `---\n${rawFrontmatter}\n---\n\n${content}`;
	await writeFile(postPath, output, { encoding: "utf-8" });
	return postSlug;
}
