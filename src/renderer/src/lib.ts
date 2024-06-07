import { locationIndex } from "./global";
import path from "path-browserify";

export function truncateString(input: string, maxLength: number): string {
	if (input.length <= maxLength) {
		return input;
	}
	return input.slice(0, maxLength - 3) + "...";
}

export function getParentLocation(location: string) {
	const parent = path.dirname(location);
	return (
		locationIndex.find(({ route: locationRoute }) => parent === locationRoute)?.title ?? parent
	);
}
