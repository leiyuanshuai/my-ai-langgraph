import {iTemplateMeta, templates} from "./index";
import {Button, Modal, notification, Space} from "antd";
import {CardList} from "../components/CardList";
import {useState} from "react";
import {produce} from "immer";
import {defer} from '@peryl/utils/defer';

export function selectTemplate(): Promise<iTemplateMeta> {

  const dfd = defer<iTemplateMeta>();

  let selectedTemplate: iTemplateMeta | undefined = undefined;

  const Content = () => {
    const [data, setData] = useState(() => templates.map(({ code, image }) => ({ code, image, checked: false })));
    return <CardList
      data={data}
      col={2}
      onClickItem={(e) => {
        setData(
          produce(data, draft => {
            draft.forEach((item, index) => {
              if (item.code === e.item.code) {
                item.checked = true;
                selectedTemplate = templates[index];
              } else {
                item.checked = false;
              }
            });
          })
        );
      }}
      onDoubleClickItem={confirm}
    />;
  };

  const Footer = () => {
    return (
      <Space style={{ width: '100%', justifyContent: 'flex-end', marginTop: '1em' }}>
        <Button onClick={cancel}>取消</Button>
        <Button type="primary" onClick={confirm}>确定</Button>
      </Space>
    );
  };

  let isDone = false;
  const confirm = () => {
    if (!selectedTemplate) {
      notification.warning({ message: '请选择模板' });
      return;
    }
    dfd.resolve(selectedTemplate);
    isDone = true;
    destroy();
  };
  const cancel = () => {
    dfd.reject('cancel');
    isDone = true;
    destroy();
  };
  const afterClose = () => {
    if (!isDone) {cancel();}
  };

  const { destroy } = Modal.info({
    title: '选择模板',
    closable: true,
    icon: null,
    width: 600,
    content: <Content/>,
    footer: <Footer/>,
    afterClose,
  });

  return dfd.promise;
}
