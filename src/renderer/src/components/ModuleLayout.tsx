import { HTMLAttributes } from "react";

interface Props extends HTMLAttributes<HTMLDivElement> {
	title: string;
	description: string;
}

export function ModuleLayout({ title, description, className, children, ...extraProps }: Props) {
	return (
		<main
			className={[className, "p-8 w-full h-full overflow-y-scroll"].join(" ")}
			{...extraProps}
		>
			<div className="flex flex-col mb-4">
				<h1 className="text-2xl font-bold">{title}</h1>
				<p>{description}</p>
			</div>
			{children}
		</main>
	);
}
