import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { App } from "./App";
import { Home } from "./routes/Home";
import { Edit } from "./routes/Pages/Edit";
import { Pages } from "./routes/Pages/Index";
import { Settings } from "./routes/Settings";

const router = createBrowserRouter([
	{
		path: "/",
		element: <App />,
		children: [
			{ index: true, element: <Home /> },
			{
				path: "pages",
				children: [
					{ index: true, element: <Pages /> },
					{
						// TODO: change edit to query params
						path: "edit",
						element: <Edit />
					}
				]
			},
			// { path: "posts", element: <Posts /> },
			{ path: "settings", element: <Settings /> }
		]
	}
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>
);
