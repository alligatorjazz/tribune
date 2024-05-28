export function autoReload() {
	window.addEventListener("message", (event) => {
		// IMPORTANT: check the origin of the data!
		if (event.origin.startsWith("http://localhost:")) {
			// The data was sent from your site.
			// Data sent with postMessage is stored in event.data:
			window.location.reload();
		} else {
			console.warn(
				`preview framed recieved message from ${event.origin} (not localhost) - disregarding`
			);
			return;
		}
	});
}
