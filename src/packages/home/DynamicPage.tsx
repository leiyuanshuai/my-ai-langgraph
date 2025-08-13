import {useParams} from "react-router";
import {useEffect, useState} from "react";
import {Alert, Spin} from "antd";

export const DynamicPage = (props: any) => {

  const params = useParams();
  // console.log('dynamic route params', params);

  const routeName: string = [params.name, params['*']].filter(i => !!i?.trim().length).join('/');

  // console.log({ routeName });

  const [Component, setComponent] = useState(null as null | ((props: any) => any));

  useEffect(() => {
    if (!!routeName) {
      // console.log(`dynamic page: ${routeName}`);
      (async () => {
        try {
          const PageComponent = await import('../pages/' + routeName + '-page').then(val => val.default);
          setComponent(() => PageComponent);
        } catch (e) {
          setComponent(() => {
            return () => (
              <div style={{ padding: '1em' }}>
                <Alert type="error" message={`页面"${routeName}"不存在`}/>
              </div>
            );
          });
        }
      })();
    } else {
      setComponent(() => {
        return () => (
          <div style={{ padding: '1em' }}>
            <Alert type="error" message={`缺少动态路由参数！}`}/>
          </div>
        );
      });
    }
  }, [routeName]);

  return !Component ? <Spin/> : <Component {...props}/>;
};
