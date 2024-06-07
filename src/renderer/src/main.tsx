import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Preview } from "./routes/Preview";
import { Posts } from "./routes/Posts";
import { Settings } from "./routes/Settings";
import { Pages } from "./routes/Pages";
import { Home } from "./routes/Home";

const router = createBrowserRouter([
	{
		path: "/",
		element: <App />,
		children: [
			{ index: true, element: <Home /> },
			{ path: "pages", element: <Pages /> },
			{ path: "posts", element: <Posts /> },
			{ path: "settings", element: <Settings /> }
		]
	}
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>
);
