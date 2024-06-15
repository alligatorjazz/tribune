import { WidgetData } from "tribune-types";
import { InjectedScript } from "./server";
export function buildWidget(data: WidgetData): InjectedScript {
	const action = ([tag, content]: string[]) => {
		const WidgetElement = class extends HTMLElement {
			constructor() {
				super();
			}
			connectedCallback() {
				const wrapper = document.createElement("p");
				wrapper.setAttribute("class", "wrapper");
				wrapper.innerHTML = content;

				this.appendChild(wrapper);
			}
		};
		customElements.define(tag, WidgetElement);
	};

	return { action, params: [data.tag, data.content] };
}
