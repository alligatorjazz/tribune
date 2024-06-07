/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: "selector",
	content: ["./src/renderer/index.html", "./src/renderer/**/*.{html,js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				bgColor: "var(--bg-color)",
				fgColor: "var(--fg-color)",
				textColor: "var(--text-color)",
				accentColor: "var(--accent-color)"
			}
		}
	},
	plugins: [require("tailwind-scrollbar")({ nocompatible: true })]
};
