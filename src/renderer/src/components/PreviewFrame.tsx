import { useCallback, useEffect, useRef, useState } from "react";
import LoadingIndicator from "./LoadingIndicator";
import { useAppContext } from "../App.lib";

interface Props {
	url: string;
}

export function PreviewFrame({ url }: Props) {
	const container = useRef<HTMLDivElement>(null);
	const frame = useRef<HTMLIFrameElement>(null);
	const { connectionStatus } = useAppContext();
	const [frameOpacity, setFrameOpacity] = useState<"0" | "1">("0");
	// helps prevent flicker issues
	const [cachedBg, setCachedBg] = useState<{
		backgroundColor?: string;
		background?: string;
	}>();

	// triggers refresh on change
	useEffect(() => {
		window.api.onAutoReload(() => {
			const contentWindow = frame.current?.contentWindow;
			if (contentWindow && container.current) {
				console.log("change detected: reloading frame");
				try {
					contentWindow.postMessage("reload", "*");
				} catch (error) {
					console.warn(error);
				}
			}
		});
	}, [url]);

	console.log(cachedBg);
	// caches iframe body background color
	const cacheBg = useCallback(
		(event: MessageEvent) => {
			if (event.origin === url) {
				const { background, backgroundColor } = JSON.parse(
					event.data
				) as CSSStyleDeclaration;
				setCachedBg({ background, backgroundColor });
			} else {
				console.warn("recieved message from url other than dev server", event);
			}
		},
		[url]
	);
	useEffect(() => {
		window.addEventListener("message", cacheBg);
		return () => window.removeEventListener("message", cacheBg);
	}, [cacheBg, url]);

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
					src={url}
					title="Site Preview"
				></iframe>
			)}
			{connectionStatus !== "connected" && (
				<div className="w-full h-full flex gap-2 justify-center items-center">
					<LoadingIndicator />
					<p>Loading site preview...</p>
				</div>
			)}
		</div>
	);
}
