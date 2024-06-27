import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PostMetadata } from "../../../../shared/types";
import { useAppContext } from "../../App.lib";
import LoadingIndicator from "../../components/LoadingIndicator";
import { SidebarLayout } from "../../components/SidebarLayout";

export function Edit() {
	const [searchParams] = useSearchParams();
	const postSlug = searchParams.get("slug");
	const { activeSite } = useAppContext();
	const [postMetadata, setPostMetadata] = useState<PostMetadata | undefined>();
	const [postContent, setPostContent] = useState<string | undefined>();
	const navigate = useNavigate();
	// load corresponding post for slug
	const fetchPost = useCallback(async (slug: string, site: string) => {
		console.log(`fetching ${slug} from site ${site}...`);
		const { posts } = await window.api.getPosts(site);
		if (slug in posts) {
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

	return (
		<SidebarLayout
			title={postMetadata?.title ?? ""}
			description={postSlug ?? ""}
			className="w-1/2"
		>
			{!(postContent && postMetadata) && <LoadingIndicator />}
			{postContent && postMetadata && <div>markdown editor here</div>}
		</SidebarLayout>
	);
}
