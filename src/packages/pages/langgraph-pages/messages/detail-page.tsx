import {useQuery} from "../../../uses/useQuery";
import {useState} from "react";
import {iMessageRecord} from "./list-page";
import {useStrictMounted} from "../../../uses/useStrictMounted";
import {aiHttp as http} from "../../../utils/http";
import {Alert, Button, Form, notification, Spin} from "antd";
import React from "react";

export default () => {

  const pageParam = useQuery();
  const [isLoading, setLoading] = useState(true);

  const messageId = pageParam.id;

  const [messageRecord, setMessageRecord] = useState<iMessageRecord | null>(null);
  const [renderConfigs, setRenderConfigs] = useState<iMessageRenderConfig[]>([]);

  // 消息是否已经审过了
  const is_approve = messageRecord?.status === 'proceeded';

  const reloadMessageRecord = async () => {
    setLoading(true);
    try {

      if (!messageId) {return;}
      const resp = await http.post<{ result: iMessageRecord }>('/lg_message/item', { "id": messageId });
      setMessageRecord(resp.data.result);
      setRenderConfigs(JSON.parse(resp.data.result.render_configs ?? '[]'));
    } catch (e: any) {
      console.error(e);
      notification.error({ message: "初始化消息信息失败", description: e.message || JSON.stringify(e) });
    } finally {
      setLoading(false);
    }
  };

  const handleClickConfigButton = async (renderConfig: iMessageRenderConfigButton) => {
    try {
      const resp = await http.get(renderConfig.data.submit_url);
      notification.success({
        message: "审批信息",
        description: resp.data.result ?? resp.data.message ?? '审批已经完成。'
      });
      await reloadMessageRecord();
    } catch (e: any) {
      console.error(e);
      notification.error({ message: e.message || JSON.stringify(e) });
    } finally {
      setLoading(false);
    }
  };

  useStrictMounted(async () => {reloadMessageRecord();});

  return (
    <div style={{ padding: '1em' }}>
      {!messageId && <Alert type="warning" message="缺少页面参数id。"/>}

      {!isLoading && !messageRecord && <Alert type="error" message={`查询不到id为「${messageId}」的消息。`}/>}

      {!!messageRecord && <>
        <div>
          <h1>{messageRecord.title}</h1>
          <p>{messageRecord.content}</p>
        </div>
        {renderConfigs.map((renderConfig, index) => (
          <React.Fragment key={index}>
            {renderConfig.type === 'button' ? (
                <Button
                  style={{ marginRight: '0.5em' }}
                  type={renderConfig.data.type as any}
                  onClick={() => handleClickConfigButton(renderConfig)}
                  disabled={is_approve}
                >
                  {renderConfig.data.label}
                </Button>
              ) :
              renderConfig.type === 'form' ? (
                <Form disabled={is_approve}>渲染一个表单</Form>
              ) : (
                <Alert type="error" message={`无法识别渲染类型：${(renderConfig as any).type}`}/>
              )}
          </React.Fragment>
        ))}
      </>}

      {isLoading && <div style={{ textAlign: 'center', padding: '1em' }}><Spin/></div>}
    </div>
  );
}

interface iMessageRenderConfigButton {
  type: "button";
  data: {
    label: string,
    type: string,/*是antd Button的type属性，用来控制按钮样式*/
    submit_url: string,
  };
}

interface iMessageRenderConfigForm {
  type: "form";
}

type iMessageRenderConfig = iMessageRenderConfigButton | iMessageRenderConfigForm
