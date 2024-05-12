export function App(): JSX.Element {
	const saveFileHandle = (): void => window.electron.ipcRenderer.send("generate-index");

	return (
		<>
			<h1>hey, guy!</h1>
			<button
				onClick={() => {
					console.log("using handle");
					saveFileHandle();
				}}
			>
				use ipc handle
			</button>
			{/* <button onClick={() => writeFileSync("index.html", str)}>generate index.html</button> */}
		</>
	);
}
