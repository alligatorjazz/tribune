import { Link } from "react-router-dom";

export function Sidebar() {
	return (
		<div className="h-full">
			<ul className="flex flex-col">
				<Link
					to={"/"}
					// to={"/dashboard"}
				>
					Dashboard
				</Link>
				<Link
					to={"/"}
					// to={"/posts"}
				>
					Posts
				</Link>
				<Link
					to={"/"}
					// to={"/settings"}
				>
					Settings
				</Link>
			</ul>
		</div>
	);
}
