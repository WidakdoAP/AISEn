import {
  createBrowserRouter,
} from "react-router";

// import HomePage from "../pages/HomePage";
import SearchPage from "../pages/SearchPage";
// import DocumentPage from "../pages/DocumentPage";

export const router = createBrowserRouter([
  // {
  //   path: "/",
  //   element: <HomePage />,
  // },
  {
    path: "/search",
    element: <SearchPage />,
  },
  // {
  //   path: "/documents/:id",
  //   element: <DocumentPage />,
  // },
]);