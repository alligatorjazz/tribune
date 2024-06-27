import { mkdir, readFile, readdir, writeFile } from "fs/promises";
import { getSiteFolders } from "./sites";
import { basename, extname, join } from "path";
import getFrontmatter from "front-matter";
import {
	PostMetadata,
	PostMetadataSchema,
	PostQueryResponse,
	changeFileExtension,
	slugify,
	toFrontmatter
} from "../shared";

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

export async function savePost(site: string, metadata: PostMetadata, content: string) {
	let output = "";
	const { postsDir } = getSiteFolders(site);
	const slug = slugify(metadata.title);
	const postPath = changeFileExtension(join(postsDir, slug), ".md", [".md", ".mdx"]);
	const rawFrontmatter = toFrontmatter(metadata);
	output += `---\n${rawFrontmatter}\n---\n\n${content}`;
	await writeFile(postPath, output, { encoding: "utf-8" });
}
