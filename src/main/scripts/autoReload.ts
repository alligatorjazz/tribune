export function autoReload() {
	setInterval(async () => {
		try {
			const response = await fetch("http://localhost:3000/devhook");
			if (!response.ok) {
				console.error("Network response was not ok", response.statusText);
				return;
			}

			const data = await response.json();

			if (typeof data.reload === "boolean") {
				console.log("Reload value:", data.reload);
				if (data.reload) {
					location.reload();
				}
			} else {
				console.warn('The "reload" property is not a boolean.');
			}
		} catch (error) {
			console.error("Fetch operation failed:", error);
		}
	}, 1000);
}

// Call the function to execute it
