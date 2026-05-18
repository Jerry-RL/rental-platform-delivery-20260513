import { RouterProvider } from "react-router-dom";
import { router } from "./router";

export default function EntryApp() {
  return <RouterProvider router={router} />;
}
