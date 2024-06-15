import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { App } from "./App";
import { Home } from "./routes/Home";
import { Edit } from "./routes/Pages/Edit";
import { Pages } from "./routes/Pages/Index";
import { Settings } from "./routes/Settings";
import { Widgets } from "./routes/Widgets";

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
						path: "edit",
						element: <Edit />
					}
				]
			},
			{ path: "widgets", element: <Widgets /> },
			{ path: "settings", element: <Settings /> }
		]
	}
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>
);
