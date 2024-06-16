import Editor, { Monaco } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { dirname, join } from "path-browserify";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppContext } from "../../App.lib";
import LoadingIndicator from "../../components/LoadingIndicator";
import { SidebarLayout } from "../../components/SidebarLayout";
import { useCompletionItems } from "../../hooks/useCompletionItems";
import { useWidgets } from "../../hooks/useWidgets";

export function Edit() {
	const [searchParams] = useSearchParams();
	const route = searchParams.get("route");
	const { siteMap } = useAppContext();
	const { widgets } = useWidgets();
	const navigate = useNavigate();

	const activeWidget = useMemo(() => {
		if (!Array.isArray(widgets)) {
			return null;
		}
		const result = widgets.find((widget) => widget.tag === searchParams.get("tag"));
		if (!result) {
			console.error(`widget for params ${searchParams} does not exist`);
			navigate("..");
			return null;
		}

		return result;
	}, [navigate, searchParams, widgets]);

	const provideCompletionItems = useCompletionItems();

	const [editorContent, setEditorContent] = useState<string | null>(null);
	const [editorCache, setEditorCache] = useState<string | null>(null);
	const initializeEditor = useCallback(
		(_editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
			monaco.languages.html.htmlDefaults.setOptions({ suggest: { html5: true } });
			monaco.languages.registerCompletionItemProvider("html", { provideCompletionItems });
		},
		[provideCompletionItems]
	);

	const localWidgetPath = useMemo(() => {
		if (!Array.isArray(siteMap) || !activeWidget) {
			return null;
		}
		const indexRoute = siteMap.find((node) => node.index)?.localPath;
		if (!indexRoute) {
			console.warn("Could not find index route in sitemap", siteMap);
			return null;
		}
		const siteDir = dirname(indexRoute);
		return join(siteDir, "widgets", activeWidget.tag + ".json");
	}, [activeWidget, siteMap]);

	useEffect(() => {
		if (activeWidget && localWidgetPath) {
			window.api
				.getSourceCode(localWidgetPath)
				.then((code) => setEditorContent(code))
				.catch((err) => {
					console.error(`Could not load source for ${localWidgetPath}:\n`, err);
					setEditorContent("");
				});
		}
	}, [activeWidget, localWidgetPath]);

	// autosaving
	useEffect(() => {
		// if the editor contains changes
		if (editorContent && editorContent !== editorCache && activeWidget && localWidgetPath) {
			window.api
				.saveSourceCode(localWidgetPath, editorContent)
				.then(() => setEditorCache(editorContent))
				.catch((err) => console.log(err));
		}
	}, [activeWidget, editorCache, editorContent, localWidgetPath]);

	return (
		<SidebarLayout
			title={activeWidget?.tag ?? "Not Found"}
			description={route ?? ""}
			className="w-1/2"
		>
			{!activeWidget && <LoadingIndicator />}
			{activeWidget && editorContent && (
				<Editor
					language={"html"}
					defaultValue={editorContent}
					onChange={(value) => setEditorContent((prev) => value ?? prev)}
					height={"80vh"}
					/// <reference path="" />

					options={{ wordWrap: "on" }}
					onMount={initializeEditor}
				/>
			)}
		</SidebarLayout>
	);
}
