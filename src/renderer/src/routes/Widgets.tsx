import { SidebarLayout } from "../components/SidebarLayout";

export function Widgets() {
	return (
		<SidebarLayout
			title="Widgets"
			description="Create reusable pieces of HTML for your site's pages."
		>
			<button>Compile</button>
			{/* {new HelloWorld().render()} */}	
		</SidebarLayout>
	);
}
