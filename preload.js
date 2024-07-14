function isSameOrigin(urlString) {
    const url = new URL(urlString);
    const currentUrl = new URL(window.location.href);
    return (url.origin === currentUrl.origin);
}
class BlogPost extends HTMLElement {
	// TODO: implement widget
	constructor() {
		super();
		this.container = document.createElement("article");
	}	
}

function buildWidget(tag, path, inheritFrom) {
	const AquilaWidget = class extends HTMLElement {
		container;
		constructor() {
			super();
			this.container = document.createElement(inheritFrom ?? "div");
			this.container.style.visibility = "hidden"
			if (!path.startsWith("/")) {
				throw new Error("You can only load widgets from your own site for security reasons.");
			}

			if (!path.endsWith(".html")) {
				throw new Error("Widgets have to be html files.");
			}

			// load content
			fetch(path).then(res => {
				res
					.text()
					.then(text => {
						this.container.innerHTML = text
					})
					.catch(err => console.error(err))
					.finally(() => this.container.style.visibility = "visible")
			})
		}
		connectedCallback() {
			this.appendChild(this.container);
		}
	}
	customElements.define(tag, AquilaWidget)
}



function include(...elements) {
	for (const { tag, path } of elements) {
		if (tag === "blog-post") {
			// TODO: docs link here
			console.error("Sorry! You can't make a widget called blog-post - that's a reserved name. Check the docs for more details!")
		} else {
			buildWidget(tag, path)
		}
	}
}

