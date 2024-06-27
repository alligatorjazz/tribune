import { extname } from "path-browserify";

export function slugify(text: string): string {
	return text
		.toLowerCase() // Convert the string to lowercase
		.trim() // Trim whitespace from both ends of the string
		.replace(/[\s\W-]+/g, "-") // Replace spaces, non-word characters, and hyphens with a single hyphen
		.replace(/^-+|-+$/g, ""); // Remove leading and trailing hyphens
}

type ValidFrontmatterLiteral = string | number | boolean;
type ValidFrontmatterValue = ValidFrontmatterLiteral | Array<ValidFrontmatterLiteral>;
export function toFrontmatter(data: Record<string, ValidFrontmatterValue>): string {
	const frontmatterLines: string[] = [];
	for (const [key, value] of Object.entries(data)) {
		if (Array.isArray(value)) {
			const arrayValues = value
				.map((item) => {
					if (typeof item === "string") {
						return `"${item.replace(/"/g, '\\"')}"`; // Escape double quotes in strings
					} else {
						return item;
					}
				})
				.join(", ");
			frontmatterLines.push(`${key}: [${arrayValues}]`);
		} else if (typeof value === "string") {
			frontmatterLines.push(`${key}: "${value.replace(/"/g, '\\"')}"`); // Escape double quotes in strings
		} else {
			frontmatterLines.push(`${key}: ${value}`);
		}
	}

	return frontmatterLines.join("\n");
}

export function changeFileExtension(
	filePath: string,
	newExtension: string,
	allowedExtensions: string[] = []
): string {
	// Get the current extension using path.extname
	const currentExtension = extname(filePath).toLowerCase();

	// Ensure all allowedExtensions have a leading dot and are in lowercase
	const normalizedAllowedExtensions = allowedExtensions.map((ext) =>
		ext.startsWith(".") ? ext.toLowerCase() : `.${ext.toLowerCase()}`
	);

	// Check if current extension is allowed
	if (!currentExtension || !normalizedAllowedExtensions.includes(currentExtension)) {
		// Remove current extension if it exists
		const filePathWithoutExtension = currentExtension
			? filePath.slice(0, -currentExtension.length)
			: filePath;
		return `${filePathWithoutExtension}.${newExtension}`;
	}

	return filePath;
}

export function generateUniqueFilename(filenames: string[]): string {
	const baseName = "untitled";
	let newFilename = baseName;
	let counter = 1;

	const filenameSet = new Set(filenames);

	while (filenameSet.has(newFilename)) {
		newFilename = `${baseName}-${counter}`;
		counter++;
	}

	return newFilename;
}

export function toTitleCase(str: string) {
	return str.replace(/\w\S*/g, function (txt) {
		return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	});
}
