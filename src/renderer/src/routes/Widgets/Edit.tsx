import Editor, { Monaco } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { dirname, join } from "path-browserify";
import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
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
	const { widgets, getWidgetPath } = useWidgets(siteMap);
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
	const editorCache = useDeferredValue(editorContent);

	const initializeEditor = useCallback(
		(_editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
			monaco.languages.html.htmlDefaults.setOptions({ suggest: { html5: true } });
			monaco.languages.registerCompletionItemProvider("html", { provideCompletionItems });
		},
		[provideCompletionItems]
	);

	const localWidgetPath = useMemo(() => {
		if (activeWidget) {
			return getWidgetPath(activeWidget.tag);
		}

		return null;
	}, [activeWidget, getWidgetPath]);

	useEffect(() => {
		if (activeWidget && localWidgetPath) {
			window.api
				.getSourceCode(localWidgetPath)
				.then(() => {
					setEditorContent(activeWidget.content);
				})
				.catch((err) => {
					console.error(`Could not load source for ${localWidgetPath}:\n`, err);
					setEditorContent("");
				});
		}
	}, [activeWidget, localWidgetPath]);

	// autosaving
	useEffect(() => {
		// if the editor contains changes
		if (editorContent && activeWidget && localWidgetPath && editorContent != editorCache) {
			window.api
				.saveSourceCode(localWidgetPath, editorContent)
				.catch((err) => console.log(err));
		}
	}, [activeWidget, editorCache, editorContent, localWidgetPath]);

	return (
		<SidebarLayout title={activeWidget?.tag} className="w-1/2">
			{!activeWidget && <LoadingIndicator />}
			{activeWidget && editorContent && (
				<>
					<Editor
						language={"html"}
						defaultValue={editorContent}
						onChange={(value) => setEditorContent((prev) => value ?? prev)}
						height={"80vh"}
						/// <reference path="" />

						options={{ wordWrap: "on" }}
						onMount={initializeEditor}
					/>
				</>
			)}
		</SidebarLayout>
	);
}
