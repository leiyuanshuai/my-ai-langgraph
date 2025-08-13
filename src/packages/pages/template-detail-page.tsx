import "./template-detail-page.scss";
import {useQuery} from "../uses/useQuery";
import {iTemplateMeta, templates} from "../templates";
import React, {useRef} from "react";
import {Alert, Button} from "antd";
import {getSnapshot} from "../utils/getSnapshot";

export default function () {

  const query = useQuery();

  const Template: undefined | iTemplateMeta = !query.code ? undefined : templates.find(i => i.code === query.code);

  const Component = Template?.component;

  const bodyRef = useRef<null | HTMLDivElement>(null);

  const generateSnapshot = async () => {
    const imagePath = await getSnapshot(bodyRef.current!);
    window.open(imagePath);
  };

  return (
    <div className="template-detail-page">
      {!query.code ?
        <Alert type="error" message="缺少路由参数code"/> :
        !Component || !Template ? <Alert type="error" message={`组件"${query.code}"不存在`}/> : <>
          <div className="template-detail-page-toolbar">
            <div>{Template.code}</div>
            <Button onClick={generateSnapshot}>生成快照图片</Button>
          </div>
          <div className="template-detail-page-body" ref={bodyRef}>
            <Component resume={Template.resume}/>
          </div>
        </>
      }
    </div>
  );
}
