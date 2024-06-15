import { WidgetData } from "tribune-types";
import { InjectedScript } from "./server";
export function buildWidget(data: WidgetData): InjectedScript {
	const action = ([tag, content]: string[]) => {
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
				wrapper.innerHTML = content;
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
		customElements.define(tag, WidgetElement);
	};

	return { action, params: [data.tag, data.content] };
}
