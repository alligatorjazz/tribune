import { HTMLAttributes } from "react";
import { Link } from "react-router-dom";
import { locationIndex } from "../refs";

export function Home({ className, ...extraProps }: HTMLAttributes<HTMLDivElement>) {
	return (
		<div className={[className, "h-full bg-fgColor p-4 w-48"].join(" ")} {...extraProps}>
			<nav className="flex flex-col w-full gap-2">
				{locationIndex.map(({ title, route, exclude }) =>
					exclude ? null : (
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
					)
				)}
			</nav>
		</div>
	);
}
