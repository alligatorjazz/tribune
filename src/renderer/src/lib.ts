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

export function toTitleCase(str: string) {
	return str.replace(/\w\S*/g, function (txt) {
		return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	});
}
