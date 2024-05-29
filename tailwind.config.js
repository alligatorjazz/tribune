/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: "selector",
	content: ["./src/renderer/index.html", "./src/renderer/**/*.{html,js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				bgColor: "rgb(var(--bg-color) / <alpha-value>)",
				fgColor: "rgb(var(--fg-color) / <alpha-value>)",
				textColor: "rgb(var(--text-color) / <alpha-value>)",
				accentColor: "rgb(var(--accent-color) / <alpha-value>)"
			}
		}
	},
	plugins: []
};
