import Editor from "@monaco-editor/react";
import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { IndexSiteNode, NamedSiteNode } from "../../../../shared/types";
import { useAppContext } from "../../App.lib";
import LoadingIndicator from "../../components/LoadingIndicator";
import { SidebarLayout } from "../../components/SidebarLayout";
import { useEditorConfig } from "../../hooks/useEditorConfig";
import { flattenSiteMap } from "../../lib";

export function Edit() {
	const [searchParams] = useSearchParams();
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

	const config = useEditorConfig({ localPath: node?.localPath, language: "html" });

	return (
		<SidebarLayout
			title={node ? (node.index ? "Index" : node.title) : "Not Found"}
			description={route ?? ""}
			className="w-1/2"
		>
			{!node && <LoadingIndicator />}
			{node && config && <Editor {...config} />}
		</SidebarLayout>
	);
}
