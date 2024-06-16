import { IRange, Position, editor, languages } from "monaco-editor";
import { useCallback } from "react";
import { useWidgets } from "./useWidgets";

export function useCompletionItems() {
	const { widgets } = useWidgets();
	const provideCompletionItems = useCallback(
		(
			model: editor.ITextModel,
			position: Position
		): languages.ProviderResult<languages.CompletionList> => {
			const word = model.getWordUntilPosition(position);
			const range: IRange = {
				startLineNumber: position.lineNumber,
				startColumn: word.startColumn,
				endLineNumber: position.lineNumber,
				endColumn: word.endColumn
			};

			return {
				suggestions: [
					...(Array.isArray(widgets) ? widgets : []).map(
						(widget): languages.CompletionItem => ({
							label: widget.tag,
							kind: languages.CompletionItemKind.Snippet, // The kind/type of completion item
							insertText: "<my-custom-tag></my-custom-tag>", // The text to insert when this suggestion is selected
							insertTextRules: languages.CompletionItemInsertTextRule.InsertAsSnippet, // Specifies that the insert text is a snippet
							documentation: "My custom HTML tag", // Documentation for the suggestion (displayed as a tooltip),
							range
						})
					)
				]
			};
		},
		[widgets]
	);

	return provideCompletionItems;
}
