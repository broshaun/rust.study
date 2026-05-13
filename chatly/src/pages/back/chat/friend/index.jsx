import { Main } from "./main";
import { Detail } from "./detail";
import { Find } from "./find";
import { Mobile } from "./mobile";



// 导出为对象数组
export const RsFriend = [
  {
    path: "friend",
    element: <Main />,
    children: [
      { path: "detail", element: <Detail /> },
      { path: "find", element: <Find /> },
    ],
  },
  {
    path: "mobile",
    element: <Mobile />,
    children: [
      { path: "friend", element: <Mobile.Item /> },
      { path: "detail", element: <Mobile.Detail /> },
      { path: "find", element: <Mobile.Find /> },
    ],
  },
];