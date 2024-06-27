import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { App } from "./App";
import { Home } from "./routes/Home";
import { Edit as PagesEdit } from "./routes/Pages/Edit";
import { Edit as WidgetsEdit } from "./routes/Widgets/Edit";
import { Pages } from "./routes/Pages/Index";
import { Settings } from "./routes/Settings";
import { Widgets } from "./routes/Widgets/Index";
import { Posts } from "./routes/Posts/Index";

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
						element: <PagesEdit />
					}
				]
			},
			{
				path: "posts",
				children: [{ index: true, element: <Posts /> }]
			},
			{
				path: "widgets",
				children: [
					{ index: true, element: <Widgets /> },
					{
						path: "edit",
						element: <WidgetsEdit />
					}
				]
			},
			{ path: "settings", element: <Settings /> }
		]
	}
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>
);
