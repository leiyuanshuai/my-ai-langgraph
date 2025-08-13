import {createBrowserRouter, RouteObject} from "react-router";
import {Page404} from "../pages/Page404";
import {useState} from "react";
import {AppHome} from "./AppHome";
import {Spin} from "antd";
import {useStrictMounted} from "../uses/useStrictMounted";
import {DynamicPage} from "./DynamicPage";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <AppHome/>,
    errorElement: <Page404/>,
    children: [
      {
        path: '/',
        element: lazy(() => import('../pages/HomePage').then(val => val.default)),
      },
      {
        path: '/pages/:name/*',
        element: <DynamicPage/>,
      },
    ]
  },
];

function lazy<Props>(getComponentAsync: () => Promise<(props?: Props) => any>) {
  const AsyncComponent: any = (props: Props) => {
    const [Component, setComponent] = useState(null as null | ((props: Props) => any));
    /*立即执行异步加载页面组件，但是值需要加载一次*/
    useStrictMounted(() => {
      getComponentAsync().then(val => {
        setComponent(() => val);
      });
    });
    return !Component ? <Spin/> : <Component {...props}/>;
  };
  return <AsyncComponent/>;
}

const publicPath = __webpack_public_path__;
export const router = createBrowserRouter(routes, { basename: publicPath.endsWith('/') ? publicPath.slice(0, -1) : publicPath });
