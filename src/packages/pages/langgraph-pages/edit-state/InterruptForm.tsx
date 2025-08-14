import {iChatInterrupt, iInterruptFormItem, iInterruptFormItemDateConfig, iInterruptFormItemInputConfig, iInterruptFormItemSelectConfig} from "./edit-state-page";
import {Alert, Button, DatePicker, Form, Input, Select, Space, Spin} from "antd";
import dayjs from 'dayjs';

export const InterruptForm = (
  props: {
    loading?: boolean,
    interrupt: iChatInterrupt,
    onConfirm: (formData: any) => void
    onCancel: () => void,
  }
) => {

  const [form] = Form.useForm();
  const formData = Form.useWatch(null, form);

  return (
    <div style={{
      width: '360px',
      backgroundColor: '#f6f8fd',
      padding: '1em',
      borderRadius: '8px',
      border: 'solid 1px #d9d9d9',
      position: 'relative'
    }}>
      <Form form={form} initialValues={props.interrupt.value.formData}>
        {props.interrupt.value.form.map((itemConfig, index) => (
          <Form.Item
            name={itemConfig.field}
            required={itemConfig.required}
            label={itemConfig.label}
            key={`${index}_${itemConfig.type}`}
            labelCol={{ span: 6 }}

            {...itemConfig.type === 'date' ? {
              getValueProps: (value) => ({ value: value ? dayjs(value) : null }),
              getValueFromEvent: (date) => date ? dayjs(date).format('YYYY-MM-DD') : null,
            } : {}}
          >
            {!RenderMap[itemConfig.type] && <Alert type="error" message={`无法渲染表单类型：${JSON.stringify(itemConfig)}`}/>}
            {RenderMap[itemConfig.type]?.(itemConfig)}
          </Form.Item>
        ))}
        <Space style={{ width: '100%', justifyContent: 'flex-end', marginTop: '1em' }}>
          <Button onClick={props.onCancel}>取消</Button>
          <Button type="primary" onClick={() => {
            props.onConfirm(formData);
            // form
            //   .validateFields({ validateOnly: true })
            //   .then(() => {
            //     console.log(formData)
            //     // props.onConfirm(formData);
            //   })
            //   .catch(() => {
            //     // do nothing
            //   });
          }}>确定</Button>
        </Space>
      </Form>
      {props.loading && (
        <div style={{ position: 'absolute', inset: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'progress' }}>
          <Spin/>
        </div>
      )}
    </div>
  );
};

const RenderMap: Record<iInterruptFormItem['type'], ((config: any) => any) | undefined> = {
  input: (config: iInterruptFormItemInputConfig) => <Input/>,
  select: (config: iInterruptFormItemSelectConfig) => <Select>{config.options.map((opt) => <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>)}</Select>,
  date: (config: iInterruptFormItemDateConfig) => <DatePicker/>,
};
