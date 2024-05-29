import { Link, useLocation } from "react-router-dom";
import { topLevelNav } from "../global";

export function Sidebar() {
	const location = useLocation();
	console.log(location);

	return (
		<div className="h-full bg-fgColor p-4">
			<nav className="flex flex-col w-full gap-2">
				{topLevelNav.map(({ title, route }) => (
					<Link
						key={route}
						className={`
							p-2 rounded-sm select-none 
							hover:bg-bgColor hover:brightness-125
						`}
						to={route}
					>
						{title}
					</Link>
				))}
			</nav>
		</div>
	);
}
