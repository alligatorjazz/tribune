import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { IndexSiteNode, NamedSiteNode } from "tribune-types";
import { useAppContext } from "../../App.lib";
import LoadingIndicator from "../../components/LoadingIndicator";
import { SidebarLayout } from "../../components/SidebarLayout";
import { flattenSiteMap } from "../../lib";
import Editor from "@monaco-editor/react";
import { editor } from "monaco-editor";

export function Edit() {
	const [searchParams, setSearchParams] = useSearchParams();
	const [editorContent, setEditorContent] = useState<string | null>(null);

	const route = searchParams.get("route");
	const { siteMap } = useAppContext();

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

	console.log(editorContent);
	return (
		<SidebarLayout
			title={node ? (node.index ? "Index" : node.title) : "Not Found"}
			description={route ?? ""}
			className="w-1/2"
		>
			{!node && <LoadingIndicator />}
			{node && editorContent && <Editor language={"html"} defaultValue={editorContent} />}
		</SidebarLayout>
	);
}
