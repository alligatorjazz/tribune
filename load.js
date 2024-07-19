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

class PostList extends HTMLElement {
	container;
	constructor() {
		super();
		this.container = document.createElement("ul");
		Object.entries(tribune_data.posts).map(([slug, data]) => {
			let content = document.createElement("a");
			content.href = "/posts/" + slug;

			if (data.title) {
				let title = document.createElement("div");
				title.className = "title";
				title.innerHTML = data.title;
				content.appendChild(title);
			}

			if (data.publish_date) {
				let date = document.createElement("div");
				date.className = "date";
				date.innerHTML = new Date(data.publish_date).toDateString();
				content.appendChild(date);
			}

			if (data.description) {
				let description = document.createElement("div");
				description.className = "description";
				description.innerHTML = data.description;
				content.appendChild(description);
			}

			this.container.appendChild(content);
		})
	}
	connectedCallback() {
		this.appendChild(this.container);
	}
}

customElements.define("post-list", PostList)