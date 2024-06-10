import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import LoadingIndicator from "./LoadingIndicator";
import { useAppContext } from "../App.lib";
import { join } from "path-browserify";
import { devURL } from "../global";

interface Props {
	route: string;
}

export function PreviewFrame({ route }: Props) {
	const container = useRef<HTMLDivElement>(null);
	const frame = useRef<HTMLIFrameElement>(null);
	const { connectionStatus } = useAppContext();
	const [frameOpacity, setFrameOpacity] = useState<"0" | "1">("0");
	// helps prevent flicker issues
	const [cachedBg, setCachedBg] = useState<{
		backgroundColor?: string;
		background?: string;
	}>();

	const triggerReload = useCallback(() => {
		const contentWindow = frame.current?.contentWindow;
		if (contentWindow && container.current) {
			try {
				contentWindow.postMessage("reload", "*");
			} catch (error) {
				console.warn("Error on autoreload:\n", error);
			}
		}
	}, []);

	// triggers refresh on file change
	useEffect(() => {
		window.api.onAutoReload(triggerReload);
	}, [triggerReload]);

	// triggers refresh on route change
	useEffect(() => {
		triggerReload();
	}, [route, triggerReload]);
	// caches iframe body background color
	const cacheBg = useCallback(
		(event: MessageEvent) => {
			if (event.origin === route) {
				const { background, backgroundColor } = JSON.parse(
					event.data
				) as CSSStyleDeclaration;
				setCachedBg({ background, backgroundColor });
			} else {
				console.warn("recieved message from url other than dev server", event);
			}
		},
		[route]
	);
	useEffect(() => {
		window.addEventListener("message", cacheBg);
		return () => window.removeEventListener("message", cacheBg);
	}, [cacheBg, route]);

	// replays fade-in animation on route change
	useEffect(() => {
		setFrameOpacity("1");
		return () => {
			setFrameOpacity("0");
		};
	}, []);

	return (
		<div
			className="w-full h-full opacity-0 duration-1000"
			ref={container}
			style={{
				opacity: frameOpacity,
				...cachedBg
			}}
		>
			{connectionStatus === "connected" && (
				<iframe
					className="w-full h-full"
					ref={frame}
					src={devURL + route}
					title="Site previewRoute"
				></iframe>
			)}
			{connectionStatus !== "connected" && (
				<div className="w-full h-full flex gap-2 justify-center items-center">
					<LoadingIndicator />
					<p>Loading site previewRoute...</p>
				</div>
			)}
		</div>
	);
}
