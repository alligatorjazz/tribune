import { WidgetData } from "tribune-types";

export function buildWidget(data: WidgetData) {
	return () => {
		const WidgetElement = class extends HTMLElement {
			constructor() {
				super();
			}
			connectedCallback() {
				// Create a shadow root
				const shadow = this.attachShadow({ mode: "open" });

				// Create spans
				const wrapper = document.createElement("p");
				wrapper.setAttribute("class", "wrapper");
				wrapper.innerHTML = data.content;
				// Create some CSS to apply to the shadow dom
				const style = document.createElement("style");
				console.log(style.isConnected);

				style.textContent = `
				  .wrapper {
					background: magenta;
					padding: 1rem;
				  }
				`;

				// Attach the created elements to the shadow dom
				shadow.appendChild(style);
				shadow.appendChild(wrapper);
			}
		};
		customElements.define(data.tag, WidgetElement);
	};
}
