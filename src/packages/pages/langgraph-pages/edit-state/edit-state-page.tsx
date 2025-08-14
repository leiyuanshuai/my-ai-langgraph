import './edit-state-page.scss';
import React, {useCallback, useEffect, useRef, useState} from "react";
import {Button, Input, notification} from 'antd';
import {iBaseRecord} from "../../../utils/BaseRecord";
import ArrowUpOutlined from '@ant-design/icons/ArrowUpOutlined';
import {LgChatList} from "./LgChatList";
import {http} from "../../../utils/http";
import {uuid} from '@peryl/utils/uuid';
import {delay} from "@peryl/utils/delay";
import {LgIcon} from "./LgIcon";
import {InterruptForm} from './InterruptForm';

export default () => {

  /*发送对话的时候，开启输入框的加载状态*/
  const [loading, setLoading] = useState(false);

  const [editText, setEditText] = useState('预定酒店，君庭酒店标间，明天入住');

  const [chatRecord, setChatRecord] = useState<iChatRecord | null>(null);

  const [chatHistoryList, setChatHistoryList] = useState<iChatBoxHistory[]>([]);

  const chatHistoryListElementRef = useRef<HTMLDivElement | null>(null);

  const [interrupt, setInterrupt] = useState<iChatInterrupt | null>(null);

  const chatHistoryListScrollToBottom = () => {chatHistoryListElementRef.current!.scrollTop = chatHistoryListElementRef.current!.scrollHeight;};

  const handleEnterTextarea = (e: React.KeyboardEvent) => {
    /*监听回车动作*/
    if (e.keyCode === 13 || e.key === "Enter") {
      if (e.shiftKey) {
        return;
      }
      sendMessage();
    }
  };

  const sendMessage = async () => {

    if (!chatRecord?.id) {
      notification.error({ message: "Missing chat record id!" });
      return;
    }

    // if (!!interrupt) {
    //   notification.warning({ message: '请先完成表单填写！' });
    //   return;
    // }
    console.log("sendMessage", editText)
    setEditText('');
    setLoading(true);

    if (!chatRecord.title?.trim().length) {

      const title = await generateChatTitle(editText);
      chatRecord.title = title;
      const resp = await http.post('/lg_chat/update', {
        "id": chatRecord.id,
        "title": title,
      });
      setChatRecord({ ...resp.data.result });
    }

    const thread_id = chatRecord.id;
    const human_message = {
      id: uuid(),
      type: 'human' as const,
      content: editText,
    };

    /*先把用户消息显示出来*/
    chatHistoryList.push(human_message);
    setChatHistoryList([...chatHistoryList]);
    delay().then(chatHistoryListScrollToBottom);

    try {
      const resp = await http.post<iChatResponseData>('/langgraph/chat', { thread_id, human_message });
      console.log("/langgraph/chat", resp);
      const response_message_list = resp.data.messages ?? [];
      setChatHistoryList([
        ...chatHistoryList,
        ...response_message_list,
      ]);
      setInterrupt(resp.data.__interrupt__?.[0] ?? null);
      delay().then(chatHistoryListScrollToBottom);
    } catch (e: any) {
      notification.error({ message: e.message || JSON.stringify(e) });
    } finally {
      setLoading(false);
    }
  };

  const reloadChatHistoryList = useCallback(async () => {
    const thread_id = chatRecord?.id;
    if (!thread_id) {
      setChatHistoryList([]);
      return;
    }
    setLoading(true);
    try {
      const resp = await http.get<iChatResponseData>(`/langgraph/chat_state/${thread_id}`);
      setChatHistoryList(resp.data.messages ?? []);
      setInterrupt(resp.data.__interrupt__?.[0] ?? null);
    } catch (e: any) {
      console.error(e);
      notification.error({ message: "查询会话历史的对话信息失败", description: e.message || JSON.stringify(e) });
    } finally {
      setLoading(false);
    }

  }, [chatRecord?.id]);

  const [resuming, setResuming] = useState<boolean>(false);

  const resumeChat = async (resumeData: any) => {
    setResuming(true);
    try {
      const resp = await http.post<iChatResponseData>(`/langgraph/chat_resume/${chatRecord!.id}`, { resume_data: resumeData });
      const response_message_list = resp.data.messages ?? [];
      setChatHistoryList([...chatHistoryList, ...response_message_list,]);
      setInterrupt(resp.data.__interrupt__?.[0] ?? null);
      delay().then(chatHistoryListScrollToBottom);
    } catch (e: any) {
      console.error(e);
      notification.error({ message: "恢复对话失败！", description: e.message || JSON.stringify(e) });
    } finally {
      setResuming(false);
    }
  };

  const handleInterruptConfirm = (formData: Record<string, any>) => {
    resumeChat(formData);
  };
  const handleInterruptCancel = () => {
    resumeChat("N")
  };

  useEffect(() => {
    reloadChatHistoryList();
  }, [reloadChatHistoryList]);

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
    }}>
      <div style={{
        borderRight: 'solid 1px #e3e3e3',
        height: '100vh',
        padding: '1em',
        overflow: 'auto',
        minWidth: '180px',
        boxSizing: 'border-box'
      }}>
        <div style={{ fontWeight: 600, fontSize: '12px', color: '#999', marginBottom: '1em' }}>历史对话</div>
        <LgChatList
          current={chatRecord}
          onChange={setChatRecord}
        />
      </div>
      <div style={{
        flex: 1,
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <div style={
          {
            padding: '1em',
            height: '100vh',
            overflow: 'auto',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
          <div
            ref={chatHistoryListElementRef}
            style={{
              overflow: 'auto',
              flexShrink: 0,
              paddingBottom: '120px',
              width: '900px',
              boxSizing: 'border-box',
            }}
          >
            {chatHistoryList.map(item => {
              if (item.type === 'human') {
                return (
                  <div style={{ margin: '0.5em 0', display: 'flex', justifyContent: 'flex-end' }} key={item.id}>
                    <div style={{
                      display: 'inline-block',
                      padding: '0.5em 1em',
                      borderRadius: '8px',
                      backgroundColor: '#f2f2f2',
                    }}>
                      <span>{item.content}</span>
                    </div>
                    <LgIcon icon="user" style={{ fontSize: '32px', height: '36px' }}/>
                  </div>
                );
              } else if (item.type === 'ai') {
                return (
                  <div style={{ margin: '0.5em 0', display: 'flex' }} key={item.id}>
                    <LgIcon icon="ai" style={{ fontSize: '32px', height: '36px' }}/>
                    <div style={{
                      display: 'inline-block',
                      padding: '0.5em 0',
                    }}>
                      {(() => {
                        if (!!(item as any).tool_calls?.length) {
                          return ((item as any).tool_calls as any[]).map(item => {
                            return `调用工具：${item.name}，参数：${JSON.stringify(item.args)}`;
                          });
                        }
                        return <span>{item.content}</span>;
                      })()}
                    </div>
                  </div>
                );
              } else if (item.type === 'tool') {
                return (
                  <div style={{ margin: '0.5em 0', display: 'flex' }} key={item.id}>
                    <LgIcon icon="tool" style={{ fontSize: '32px', height: '36px' }}/>
                    <div style={{
                      display: 'inline-block',
                      padding: '0.5em 0',
                    }}>
                      <div>执行工具：{(item as any).name}</div>
                      {/*<div>执行参数：{(item as any).name}</div>*/}
                      <div>执行结果：{(item as any).content}</div>
                    </div>
                  </div>
                );
              } else {
                return null;
              }
            })}

            {!!interrupt && (<InterruptForm loading={resuming} interrupt={interrupt} onConfirm={handleInterruptConfirm} onCancel={handleInterruptCancel}/>)}
          </div>
        </div>

        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '900px',
            position: 'relative',
          }}>
            <Input.TextArea
              disabled={!chatRecord?.id || !!interrupt?.id }
              readOnly={loading}
              value={editText}
              onChange={e => setEditText(e.target.value)}
              placeholder="请输入对话内容："
              onKeyUp={handleEnterTextarea}
              style={{ minHeight: '120px' }}
            />
            <Button
              disabled={!chatRecord?.id || !!interrupt?.id || editText.trim().length === 0}
              key={loading ? 1 : 2}
              type="primary"
              shape="circle"
              loading={loading}
              onClick={sendMessage}
              style={{
                position: 'absolute',
                bottom: '0.5em',
                right: '0.5em',
              }}
            >
              {!loading && <ArrowUpOutlined/>}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


async function generateChatTitle(content: string) {
  const resp = await http.post('/doubao/invoke', {
    "input": {
      "messages": [
        { "role": "system", "content": "请根据用户输入的内容，生成一个简短的标题，不超过10个字" },
        { "role": "user", "content": content }
      ]
    },
    "config": {},
    "kwargs": {}
  });
  return resp.data.output;
}

export interface iChatRecord extends iBaseRecord {title: string;}

export interface iAiHistory {
  type: 'human' | 'ai' | 'system' | 'tool';
  content?: string;
}

export interface iChatBoxHistory extends iAiHistory {
  id: string,
  render?: () => any,
}

interface iChatResponseData {
  messages: iChatBoxHistory[],
  __interrupt__?: any[]
}

interface iInterruptFormItemBaseConfig {
  field: string,
  label: string,
  required: boolean
}

/*@formatter:off*/
export interface iInterruptFormItemInputConfig extends iInterruptFormItemBaseConfig {type: 'input',}
export interface iInterruptFormItemSelectConfig extends iInterruptFormItemBaseConfig {type: 'select',options:{label:string,value:string}[]}
export interface iInterruptFormItemDateConfig extends iInterruptFormItemBaseConfig {type: 'date',}
export type iInterruptFormItem = iInterruptFormItemInputConfig | iInterruptFormItemSelectConfig | iInterruptFormItemDateConfig
/*@formatter:on*/

interface iInterruptFormConfig {
  title: string,
  form: iInterruptFormItem[],
  formData: Record<string, any>
}

export interface iChatInterrupt {
  id: string,
  value: iInterruptFormConfig
}
