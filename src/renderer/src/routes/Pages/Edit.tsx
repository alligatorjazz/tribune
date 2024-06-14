import Editor from "@monaco-editor/react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { IndexSiteNode, NamedSiteNode } from "tribune-types";
import { useAppContext } from "../../App.lib";
import LoadingIndicator from "../../components/LoadingIndicator";
import { SidebarLayout } from "../../components/SidebarLayout";
import { flattenSiteMap } from "../../lib";

export function Edit() {
	const [searchParams] = useSearchParams();
	const [editorContent, setEditorContent] = useState<string | null>(null);
	const [editorCache, setEditorCache] = useState<string | null>(null);

	const [saving, setSaving] = useState(false);
	const route = searchParams.get("route");
	const { siteMap, setPreviewRoute } = useAppContext();

	const node = useMemo((): IndexSiteNode | NamedSiteNode | null => {
		if (!Array.isArray(siteMap)) {
			return null;
		}
		const result = flattenSiteMap(siteMap).find(
			(node) => !node.children && node.route === route
		);
		if (result && !result.children) {
			return result;
		}
		return null;
	}, [route, siteMap]);

	// navigates site preview to the page the user is editing
	useEffect(() => {
		if (node) {
			setPreviewRoute(node.route);
		}
	}, [node, setPreviewRoute]);

	// loads source file into editor
	useEffect(() => {
		if (node) {
			window.api
				.getSourceCode(node.localPath)
				.then((code) => setEditorContent(code))
				.catch((err) => {
					console.error(`Could not load source for ${node.localPath}:\n`, err);
					setEditorContent("");
				});
		}
	}, [node]);

	// autosaving
	useEffect(() => {
		// if the editor contains changes
		if (editorContent && editorContent !== editorCache && node) {
			window.api
				.saveSourceCode(node.localPath, editorContent)
				.then(() => setEditorCache(editorContent))
				.catch((err) => console.log(err));
		}
	}, [editorCache, editorContent, node]);

	// queues save action
	// useEffect(() => {
	// 	if (node && editorContent) {
	// 		window.api
	// 			.saveSourceCode(node.localPath, editorContent)
	// 			.then(() => console.log("saving..."))
	// 			.catch((err) => console.error(err));
	// 	}
	// }, [node]);

	return (
		<SidebarLayout
			title={node ? (node.index ? "Index" : node.title) : "Not Found"}
			description={route ?? ""}
			className="w-1/2"
		>
			{!node && <LoadingIndicator />}
			{saving && (
				<div className="flex gap-2">
					<LoadingIndicator />
					<p>Saving...</p>
				</div>
			)}
			{node && editorContent && (
				<Editor
					language={"html"}
					defaultValue={editorContent}
					onChange={(value) => setEditorContent((prev) => value ?? prev)}
					height={"80vh"}
					options={{ wordWrap: "on" }}
				/>
			)}
		</SidebarLayout>
	);
}
