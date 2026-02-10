import { Route } from "react-router-dom";
import { Display } from "./main";
import { RsShow } from "./show";
import { RsImage } from "./image";



export const RsDisplay = (
  <Route path="display" element={<Display />}>
    {RsShow}
    {RsImage}
  </Route>
);


