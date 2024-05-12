export function App(): JSX.Element {
	const saveFileHandle = (): void => window.api.generateIndex();
	console.log(window.api);
	return (
		<>
			<h1>hey, guy!</h1>
			<button onClick={saveFileHandle}>use ipc handle</button>
			{/* <button onClick={() => writeFileSync("index.html", str)}>generate index.html</button> */}
		</>
	);
}
