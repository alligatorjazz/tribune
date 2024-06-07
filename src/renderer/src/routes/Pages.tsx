import { SidebarLayout } from "../components/SidebarLayout";

export function Pages() {
	// TODO: write tree view component
	return (
		<SidebarLayout
			title="Pages"
			description="Add, edit, and restructure the pages on your site."
		>
			<div>
				<ul>
					<li>Home</li>
					<li>About</li>
					<li>
						<div>Wiki</div>
						<ul>
							<li>Sonic</li>
							<li>Mario</li>
							<li>Zelda</li>
						</ul>
					</li>
				</ul>
			</div>
		</SidebarLayout>
	);
}
