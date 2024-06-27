import { HTMLAttributes } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getParentLocationTitle } from "../lib";

interface Props extends HTMLAttributes<HTMLDivElement> {
	title?: string;
	description?: string;
}

export function SidebarLayout({ title, description, className, children, ...extraProps }: Props) {
	const location = useLocation();
	const navigate = useNavigate();

	return (
		<div
			className={[
				"h-full bg-fgColor p-4 overflow-y-scroll scrollbar-thin flex-0 flex flex-col items-start",
				className
			].join(" ")}
			{...extraProps}
		>
			<button className="bg-fgColor block" onClick={() => navigate("..")}>
				🔙 {getParentLocationTitle(location.pathname)}
			</button>
			{(title || description) && (
				<div className="flex flex-col my-2">
					{title && <h1 className="text-2xl font-bold">{title}</h1>}
					{description && <p className="text-sm">{description}</p>}
				</div>
			)}
			<div className="w-full flex-1">{children}</div>
		</div>
	);
}
