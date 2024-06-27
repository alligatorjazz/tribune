import { useCallback, useEffect, useState } from "react";
import { useAppContext } from "../../App.lib";
import { SidebarLayout } from "../../components/SidebarLayout";
import { Link, useNavigate } from "react-router-dom";
import { PostQueryResponse } from "../../../../shared/types";

export function Posts() {
	const { activeSite } = useAppContext();
	const navigate = useNavigate();
	const [posts, setPosts] = useState<PostQueryResponse | undefined>();

	const createPost = useCallback(async () => {
		if (activeSite) {
			const slug = await window.api.savePost(
				activeSite,
				{
					publishDate: new Date().toISOString()
				},
				"Write a new post here!"
			);
			navigate(`edit?${new URLSearchParams({ slug })}`);
		}
	}, [activeSite, navigate]);

	useEffect(() => {
		if (!posts && activeSite) {
			window.api.getPosts(activeSite).then(({ posts }) => setPosts(posts));
		}
	}, [activeSite, posts]);
	console.log(posts);
	return (
		<SidebarLayout
			title="Posts"
			description={"Here's where you can write and publish posts on your site."}
		>
			<div className="flex flex-col">
				{posts && (
					<ul className="flex flex-col">
						{Object.keys(posts).map((slug) => (
							<li key={slug}>
								<Link to={`edit?${new URLSearchParams({ slug })}`}>
									{posts[slug].metadata.title}
								</Link>
							</li>
						))}
					</ul>
				)}
				<button onClick={createPost} className="p-4">
					+ New Post
				</button>
			</div>
		</SidebarLayout>
	);
}
