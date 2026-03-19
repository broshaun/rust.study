import { Mian } from "./main";
import { Detail } from "./detail";
import { Find } from "./find";
import { Item } from "./item";
import { Mobile } from "./mobile";

// 导出为对象数组
export const RsFriend = [
  {
    path: "friend",
    element: <Mian />,
    children: [
      { path: "detail", element: <Detail /> },
      { path: "find", element: <Find /> },
    ],
  },
  {
    path: "mobile",
    element: <Mobile />,
    children: [
      { path: "friend", element: <Item /> },
      { path: "detail", element: <Detail /> },
      { path: "find", element: <Find /> },
    ],
  },
];