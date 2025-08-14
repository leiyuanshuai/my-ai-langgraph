import {iChatRecord} from "./edit-state-page";
import {useState} from "react";
import {http} from "../../../utils/http";
import {Button, notification, Space, Spin} from "antd";
import {useStrictMounted} from "../../../uses/useStrictMounted";
import MessageOutlined from '@ant-design/icons/MessageOutlined'
import PlusCircleOutlined from '@ant-design/icons/PlusCircleOutlined'

export const LgChatList = (
    props: {
        current: iChatRecord | null | undefined,
        onChange: (record: iChatRecord) => void,
    }
) => {

    const [loading, setLoading] = useState(true)
    const [chatList, setChatList] = useState<iChatRecord[]>([])

    const reloadData = async () => {
        setLoading(true)
        try {
            const resp = await http.post<{ list: iChatRecord[] }>('/lg_chat/list', {all: true})
            setChatList(resp.data.list)
            const newCurrent: iChatRecord | undefined = resp.data.list[0]
            if (!newCurrent) {
                await http.post<{ list: iChatRecord[] }>('/lg_chat/insert', {title: ""})
                await reloadData()
            } else {
                props.onChange(resp.data.list[0])
            }
        } catch (e: any) {
            console.error(e)
            notification.error({message: "查询会话信息失败", description: e.message || JSON.stringify(e)})
        } finally {
            setLoading(false)
        }
    }

    const createChat = async () => {
        await http.post<{ list: iChatRecord[] }>('/lg_chat/insert', {title: ""})
        await reloadData()
    }

    useStrictMounted(async () => {
        await reloadData()
    })

    return (
        <div className="lg-chat-list">
            {loading && <Spin/>}
            <Space direction="vertical">
                <Button key="create-button" type="dashed" style={{width: '100%', justifyContent: 'flex-start'}} onClick={createChat}>
                    <PlusCircleOutlined/>
                    <span>新建会话</span>
                </Button>
                {chatList.map((chat: iChatRecord) => (
                    <Button
                        style={{display: 'block', width: '180px', textAlign: 'left'}}
                        type={chat.id === props.current?.id ? 'primary' : 'text'}
                        key={chat.id}
                        onClick={() => props.onChange(chat)}
                    >
                        <MessageOutlined/>
                        <span style={{display: 'inline-block', marginLeft: '0.5em'}}>{chat.title || '新建会话'}</span>
                    </Button>
                ))}
            </Space>
        </div>
    )

}
