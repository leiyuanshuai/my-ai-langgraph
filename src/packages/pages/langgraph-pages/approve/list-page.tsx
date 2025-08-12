import {DataTable, iDataTableInstance} from "../../../components/DataTable";
import {ColumnsType} from "antd/es/table";
import {iBaseRecord} from "../../../utils/BaseRecord";
import {Button, Form, Input, Modal, notification, Space} from "antd";
import {defer} from "@peryl/utils/defer";
import {http} from "../../../utils/http";
import {useRef, useState} from "react";

const STATUS_MAP = {
  draft: '草稿',
  pending_approval: '待审批',
  processing_approval: '审批中',
  accept_approval: '审批通过',
  reject_approval: '审批拒绝',
  processing_finance: '财务处理',
  completed: '报销完成',
  cancelled: '取消/撤回'
} as Record<string, string | undefined>;

const columns: ColumnsType<iApproveRecord> = [
  {
    title: '创建时间',
    dataIndex: 'created_at',
    width: '180px'
  },
  {
    title: '报销单状态',
    dataIndex: 'status',
    width: '120px',
    render: (value) => STATUS_MAP[value] || value
  },
  {
    title: '备注信息',
    dataIndex: 'remarks',
    width: '40%',
  },
  {
    title: '审批结果信息',
    dataIndex: 'result_content',
  },
];

export default () => {

  const [isLoading, setLoading] = useState(false);
  const dataTableRef = useRef<iDataTableInstance | null>(null);

  const createApprove = async () => {
    const formData = await getCreateApproveFormData();
    setLoading(true);
    try {
      const resp = await http.post<any>("/lg_approve/submit", formData);
      console.log(resp.data);
      await dataTableRef.current!.reload();
      notification.success({ message: "报销单创建成功" });
    } catch (e: any) {
      console.error(e);
      notification.error({ message: "创建报销单失败", description: e.message || JSON.stringify(e) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '1em' }}>
      <div style={{ paddingBottom: '1em', float: 'right' }}>
        <Button loading={isLoading} onClick={createApprove} type="primary">创建报销单</Button>
      </div>
      <DataTable
        ref={dataTableRef}
        module="lg_approve"
        columns={columns}
      />
    </div>
  );
}

interface iApproveRecord extends iBaseRecord {
  status: string,
  remarks: string,
  result_content: string,
}

interface iCreateApproveFormData {
  remarks: string;
}

/*打开一个弹框表单，编辑报销单信息，并且将报销单信息异步返回*/
function getCreateApproveFormData(
  config?: {
    onCancel?: () => void
  }
): Promise<iCreateApproveFormData> {

  const dfd = defer<iCreateApproveFormData>();

  let formData: iCreateApproveFormData = { remarks: '' };

  const Content = () => {
    const [form] = Form.useForm();
    formData = Form.useWatch(undefined, form);
    return (
      <Form
        form={form}
        initialValues={{ remarks: '测试' }}
      >
        <Form.Item noStyle name="remarks">
          <Input.TextArea style={{ minHeight: '200px' }}/>
        </Form.Item>
      </Form>
    );
  };

  const Footer = () => (
    <Space style={{ width: '100%', justifyContent: 'flex-end', marginTop: '1em' }}>
      <Button onClick={cancel}>取消</Button>
      <Button type="primary" onClick={confirm}>确定</Button>
    </Space>
  );

  /*判断是否触发过confirm或者cancel函数*/
  let isDone = false;

  const confirm = () => {
    if (!formData.remarks.trim().length) {
      notification.warning({ message: '请检查表单信息', description: "报销备注信息不能为空" });
      return;
    }
    dfd.resolve(formData);
    isDone = true;
    destroy();
  };

  const cancel = () => {
    config?.onCancel?.();
    destroy();
    isDone = true;
  };

  const afterClose = () => {if (!isDone) {cancel();}};

  const { destroy } = Modal.info({
    icon: null,
    title: "请输入报销单备注信息",
    closable: true,
    width: 600,
    content: <Content/>,
    footer: <Footer/>,
    afterClose: afterClose,
  });


  return dfd.promise;
}
