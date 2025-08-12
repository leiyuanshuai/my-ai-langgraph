import {DataTable} from "../../../components/DataTable";
import {ColumnsType} from "antd/es/table";
import {Button, Space} from "antd";
import {router} from "../../../home/routes";
import {iBaseRecord} from "../../../utils/BaseRecord";

const STATUS_MAP = {
  pending: '待处理',
  proceeded: '已处理',
} as Record<string, string | undefined>;

const columns: ColumnsType<iMessageRecord> = [
  {
    title: '创建时间',
    dataIndex: 'created_at',
    width: '180px'
  },
  {
    title: '消息标题',
    dataIndex: 'title',
    width: '30%',
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: '120px',
    render: (value) => STATUS_MAP[value] || value
  },
  {
    title: '消息内容',
    dataIndex: 'content'
  },
  {
    title: '操作栏',
    key: 'action',
    align: 'center',
    render: (_, record) => (
      <Space size="middle">
        <Button type="link" onClick={() => {
          router.navigate(`/pages/langgraph-pages/messages/detail?id=${record.id}`);
        }}>{record.status === 'pending' ? '待审批' : '已审批'}</Button> :
      </Space>
    ),
  },
];

export default () => {
  return (
    <div style={{ padding: '1em' }}>
      <DataTable
        columns={columns}
        module="lg_message"
      />
    </div>
  );
}

export interface iMessageRecord extends iBaseRecord {
  title: string,
  content: string,
  status: string,
  render_configs: string,
}
