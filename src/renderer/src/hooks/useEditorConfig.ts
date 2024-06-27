import { EditorProps, Monaco } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { useState, useDeferredValue, useCallback, useEffect } from "react";
import { useCompletionItems } from "./useCompletionItems";

type UseEditorConfigProps = {
	localPath?: string | null;
	language: "html" | "css" | "js";
	onSave?: (content: string) => void;
};
export function useEditorConfig({
	localPath,
	language,
	onSave
}: UseEditorConfigProps): EditorProps | undefined {
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

	// loads source file into editor
	useEffect(() => {
		if (localPath) {
			window.api
				.getSourceCode(localPath)
				.then((code) => setEditorContent(code))
				.catch((err) => {
					console.error(`Could not load source for ${localPath}:\n`, err);
					setEditorContent("");
				});
		}
	}, [localPath]);

	// autosaving
	useEffect(() => {
		// if the editor contains changes
		if (editorContent && localPath && editorContent != editorCache) {
			if (onSave) {
				onSave(editorContent);
			} else {
				window.api
					.saveSourceCode(localPath, editorContent)
					.catch((err) => console.log(err));
			}
		}
	}, [editorCache, editorContent, localPath, onSave]);

	if (typeof editorContent === "string") {
		return {
			language,
			defaultValue: editorContent,
			onChange: (value) => setEditorContent((prev) => value ?? prev),
			height: "80vh",
			options: { wordWrap: "on" },
			onMount: initializeEditor
		};
	}

	return undefined;
}
