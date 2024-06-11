import { useCallback, useEffect, useRef, useState } from "react";
import { devURL } from "../global";
import LoadingIndicator from "./LoadingIndicator";
import { useAppContext } from "../App.lib";

interface Props {
	route: string;
}

export function PreviewFrame({ route }: Props) {
	const container = useRef<HTMLDivElement>(null);
	const frame = useRef<HTMLIFrameElement>(null);
	const [frameOpacity, setFrameOpacity] = useState<"0" | "1">("0");
	const [connected, setConnected] = useState<boolean | "loading">(false);
	const { activeSite } = useAppContext();
	const initializeServer = useCallback(() => {
		const iframe = frame.current;
		if (activeSite && iframe) {
			console.log("initializing server...");
			window.api
				.startServer(activeSite)
				.then(() => {
					console.log("server initialized - checking status...");
					window.api
						.getServerStatus()
						.then((status) => {
							if (status) {
								console.log("server online, reloading iframe...");
								window.api.onAutoReload(() => {
									console.log("recieved autoreload, reloading...");
									iframe.src += "";
								});
								iframe.src += "";
								setConnected(true);
							} else {
								console.error(
									"could not establish connection to dev server - reinitializing..."
								);
								setConnected(false);
							}
						})
						.catch((err) => console.error(err));
				})
				.catch((err) => {
					console.error(err);
					setConnected(false);
				});
		}
	}, [activeSite]);

	// starts server
	useEffect(() => {
		if (connected === false) {
			setConnected("loading");
		}
		if (connected === "loading") {
			initializeServer();
		}
	}, [connected, initializeServer]);

	// replays fade-in animation on route change
	useEffect(() => {
		setFrameOpacity("1");
		return () => {
			setFrameOpacity("0");
		};
	}, []);

	return (
		<div
			className="w-full h-full opacity-0 duration-1000 bg-white"
			ref={container}
			style={{
				opacity: frameOpacity
			}}
		>
			<iframe
				className="w-full h-full"
				ref={frame}
				style={connected === true ? {} : { display: "none" }}
				src={devURL + route}
				title="Site Preview"
			></iframe>

			{connected !== true && (
				<div className="w-full h-full flex gap-2 justify-center items-center shadow-2xl text-black">
					<LoadingIndicator />
					<p>Loading site preview...</p>
				</div>
			)}
		</div>
	);
}
