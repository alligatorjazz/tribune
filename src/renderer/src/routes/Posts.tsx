import { useState } from "react";
import { ModuleLayout } from "../components/ModuleLayout";
import dummy from "../dummy";
import { PostStatus, POST_STATUSES } from "../types";

export function Posts() {
	const [activeTab, setActiveTab] = useState<PostStatus>("Published");
	const listedPosts = dummy.blogPosts.filter(({ status }) => status === activeTab);
	return (
		<ModuleLayout
			title="Posts"
			description={"Here's where you can write, schedule, and publish posts on your site."}
		>
			<ul
				className="
				flex flex-row rounded-sm rounded-b-none
				border border-fgColor border-b-textColor
			"
			>
				{POST_STATUSES.map((tab) => (
					<li
						key={tab}
						onClick={() => setActiveTab(tab)}
						className={[
							"p-4 flex justify-between gap-2 flex-1 cursor-pointer select-none",
							activeTab === tab ? "bg-fgColor" : ""
						].join(" ")}
					>
						<span>{tab}</span>
						<span className="font-bold">
							{dummy.blogPosts.filter(({ status }) => status === tab).length}
						</span>
					</li>
				))}
			</ul>
			<ul
				className="
				bg-fgColor flex flex-col 
				rounded-b-sm gap-4  
				max-h-[65vh] overflow-y-auto mb-4
				
			"
			>
				{listedPosts.map((post) => (
					<li
						key={post.id}
						className="flex flex-row border-b-textColor border-b p-4 w-full last:border-0"
					>
						<div className="flex-1">
							<div className="font-bold text-xl">{post.title}</div>
							<div className="flex gap-1 text-sm">
								<div>{post.createdAt.toDateString()}</div>
								<div>|</div>
								<div>{post.author}</div>
							</div>
						</div>
						<button className="p-2 rounded-sm h-12 w-16">Edit</button>
					</li>
				))}
			</ul>
			<div className="flex justify-end">
				<button className="px-4 py-2">+ New Post</button>
			</div>
		</ModuleLayout>
	);
}
