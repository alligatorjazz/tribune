import Editor from "@monaco-editor/react";
import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import LoadingIndicator from "../../components/LoadingIndicator";
import { SidebarLayout } from "../../components/SidebarLayout";
import { useEditorConfig } from "../../hooks/useEditorConfig";
import { useWidgets } from "../../hooks/useWidgets";

export function Edit() {
	const [searchParams] = useSearchParams();
	const { widgets, getWidgetPath } = useWidgets();
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

	const localPath = useMemo(() => {
		if (activeWidget) {
			return getWidgetPath(activeWidget.tag);
		}

		return null;
	}, [activeWidget, getWidgetPath]);

	const config = useEditorConfig({ localPath, language: "html" });

	return (
		<SidebarLayout title={activeWidget?.tag} className="w-1/2">
			{!activeWidget && <LoadingIndicator />}
			{activeWidget && config && <Editor {...config} />}
		</SidebarLayout>
	);
}
