export function broadcastStyle() {
	window.postMessage(JSON.stringify(getComputedStyle(document.body)), "*");
}
