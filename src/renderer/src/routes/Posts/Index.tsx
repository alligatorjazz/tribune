import { useAppContext } from "../../App.lib";
import { SidebarLayout } from "../../components/SidebarLayout";
// import dummy from "../dummy";

export function Posts() {
	const { activeSite } = useAppContext();

	return (
		<SidebarLayout
			title="Posts"
			description={"Here's where you can write, schedule, and publish posts on your site."}
		>
			{activeSite && (
				<div className="flex justify-end">
					<button
						onClick={() =>
							window.api.savePost(
								activeSite,
								{
									title: "My little post!",
									author: "Tribune",
									publishDate: new Date().toISOString()
								},
								"This is a test post!"
							)
						}
						className="p-4"
					>
						+ New Post
					</button>
					<button
						className="p-4"
						onClick={() =>
							window.api.getPosts(activeSite).then((posts) => console.log(posts))
						}
					>
						Load Posts
					</button>
				</div>
			)}
		</SidebarLayout>
	);
}
