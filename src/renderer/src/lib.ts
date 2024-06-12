import { basename, dirname } from "path-browserify";
import { locationIndex } from "./global";
import { SiteMap, SiteNode } from "tribune-types";

export function truncateString(input: string, maxLength: number): string {
	if (input.length <= maxLength) {
		return input;
	}
	return input.slice(0, maxLength - 3) + "...";
}

export function getLocationTitle(location: string) {
	return toTitleCase(
		locationIndex.find(({ route: locationRoute }) => location === locationRoute)?.title ??
			basename(location, ".html")
	);
}

export function getParentLocationTitle(childLocation: string) {
	const location = dirname(childLocation);
	return toTitleCase(
		locationIndex.find(({ route: locationRoute }) => location === locationRoute)?.title ??
			basename(location)
	);
}

export function toTitleCase(str: string) {
	return str.replace(/\w\S*/g, function (txt) {
		return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	});
}

/**
 * Flattens a nested SiteMap into a single array of SiteNode.
 * @param siteMap - The nested SiteMap to be flattened.
 * @returns The flattened array of SiteNode.
 */
export function flattenSiteMap(siteMap: SiteMap): SiteNode[] {
	const result: SiteNode[] = [];

	const flatten = (nodes: SiteMap) => {
		for (const node of nodes) {
			result.push(node);
			if ("children" in node && node.children) {
				flatten(node.children);
			}
		}
	};

	flatten(siteMap);
	return result;
}
