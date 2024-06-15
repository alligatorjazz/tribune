import Editor, { Monaco } from "@monaco-editor/react";
import { IRange, editor, languages } from "monaco-editor";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { IndexSiteNode, NamedSiteNode } from "tribune-types";
import { useAppContext } from "../../App.lib";
import LoadingIndicator from "../../components/LoadingIndicator";
import { SidebarLayout } from "../../components/SidebarLayout";
import { flattenSiteMap } from "../../lib";

export function Edit() {
	const [searchParams] = useSearchParams();
	const route = searchParams.get("route");
	const { siteMap, setPreviewRoute } = useAppContext();

	const [editorContent, setEditorContent] = useState<string | null>(null);
	const [editorCache, setEditorCache] = useState<string | null>(null);
	const initializeEditor = useCallback(
		(_editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
			monaco.languages.html.htmlDefaults.setOptions({ suggest: { html5: true } });
			monaco.languages.registerCompletionItemProvider("html", {
				provideCompletionItems: (model, position) => {
					const word = model.getWordUntilPosition(position);
					const range: IRange = {
						startLineNumber: position.lineNumber,
						startColumn: word.startColumn,
						endLineNumber: position.lineNumber,
						endColumn: word.endColumn
					};

					// Define custom suggestions
					const suggestions: languages.CompletionItem[] = [
						{
							label: "my-custom-tag", // The text that will be displayed in the suggestion list
							kind: monaco.languages.CompletionItemKind.Snippet, // The kind/type of completion item
							insertText: "<my-custom-tag></my-custom-tag>", // The text to insert when this suggestion is selected
							insertTextRules:
								monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, // Specifies that the insert text is a snippet
							documentation: "My custom HTML tag", // Documentation for the suggestion (displayed as a tooltip),
							range
						},
						{
							label: "another-tag", // The text that will be displayed in the suggestion list
							kind: monaco.languages.CompletionItemKind.Snippet, // The kind/type of completion item
							insertText: "<another-tag></another-tag>", // The text to insert when this suggestion is selected
							insertTextRules:
								monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, // Specifies that the insert text is a snippet
							documentation: "Another custom HTML tag", // Documentation for the suggestion (displayed as a tooltip)
							range
						}
					];

					// Return the suggestions
					return { suggestions };
				}
			});
		},
		[]
	);

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
			{node && editorContent && (
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
