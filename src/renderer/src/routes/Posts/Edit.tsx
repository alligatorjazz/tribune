import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PostMetadata } from "../../../../shared/types";
import { useAppContext } from "../../App.lib";
import LoadingIndicator from "../../components/LoadingIndicator";
import { SidebarLayout } from "../../components/SidebarLayout";
import {
	MDXEditor,
	MDXEditorMethods,
	headingsPlugin,
	listsPlugin,
	markdownShortcutPlugin,
	quotePlugin,
	thematicBreakPlugin
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import "./Edit.scss";

export function Edit() {
	const [searchParams] = useSearchParams();
	const postSlug = searchParams.get("slug");
	const { activeSite } = useAppContext();
	const [postMetadata, setPostMetadata] = useState<PostMetadata | undefined>();
	const [postContent, setPostContent] = useState<string | undefined>();
	const editor = useRef<MDXEditorMethods>(null);

	const navigate = useNavigate();
	// load corresponding post for slug
	const fetchPost = useCallback(async (slug: string, site: string) => {
		// console.log(`fetching ${slug} from site ${site}...`);
		const { posts } = await window.api.getPosts(site);
		if (slug in posts) {
			// console.log("fetched post:", posts[slug]);
			return posts[slug];
		}

		return null;
	}, []);

	useEffect(() => {
		if (postSlug && activeSite) {
			fetchPost(postSlug, activeSite).then((result) => {
				if (!result) {
					console.error("Post not found.");
					navigate("..");
				} else {
					const { metadata, content } = result;
					setPostMetadata(metadata);
					setPostContent(content);
				}
			});
		}
	}, [activeSite, fetchPost, navigate, postSlug]);

	// autosave
	useEffect(() => {
		if (typeof postContent === "string" && activeSite && postMetadata && postSlug) {
			window.api.savePost(activeSite, postMetadata, postContent, postSlug);
		}
	}, [activeSite, postContent, postMetadata, postSlug]);
	console.log(postContent);
	return (
		<SidebarLayout
			title={postMetadata?.title ?? ""}
			description={postSlug ?? ""}
			className="w-1/2"
		>
			{!(typeof postContent === "string" && postMetadata) && <LoadingIndicator />}
			{typeof postContent === "string" && postMetadata && (
				<MDXEditor
					className="mdx-editor"
					plugins={[
						// Example Plugin Usage
						headingsPlugin(),
						listsPlugin(),
						quotePlugin(),
						thematicBreakPlugin(),
						markdownShortcutPlugin()
					]}
					markdown={postContent}
					onChange={(newContent) => setPostContent(newContent)}
					autoFocus={true}
					ref={editor}
				/>
			)}
		</SidebarLayout>
	);
}
