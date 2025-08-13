import {notification, Table, TablePaginationConfig} from "antd";
import {TableProps} from "antd/es/table/InternalTable";
import {AnyObject} from "antd/es/_util/type";
import React, {useImperativeHandle, useMemo, useState} from "react";
import {http} from "../utils/http";
import {useStrictMounted} from "../uses/useStrictMounted";
import {ColumnsType} from "antd/es/table";

export const DataTable = React.forwardRef<iDataTableInstance, iDataTableProps>((props, ref) => {
  const [dataSource, setDataSource] = useState<AnyObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 3,
      total: 0,
    },
  });


  const columns: ColumnsType<AnyObject> = useMemo(() => {
    return [
      {
        title: '#',
        width: '60px',
        render: (_, __, index) => (
          (tableParams.pagination!.current! - 1) * tableParams.pagination!.pageSize!
        ) + (index + 1)
      },
      ...props.columns ?? [],
    ];
  }, [
    props.columns,
    tableParams.pagination,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    tableParams.pagination!.current,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    tableParams.pagination!.pageSize!
  ]);

  const loadData = async (page = tableParams.pagination!.current!, pageSize = tableParams.pagination!.pageSize!) => {
    setLoading(true);
    try {
      const resp = await http.post<{ list: AnyObject[], has_next: boolean, total: number }>(`/${props.module}/list`, {
        page: page - 1,
        page_size: pageSize,
      });
      console.log('resp', resp);
      setDataSource(resp.data.list);
      setTableParams({ pagination: { current: page, pageSize, total: resp.data.total } });
    } catch (e: any) {
      console.error(e);
      notification.error({ message: "数据查询失败", description: e.message || JSON.stringify(e) });
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange: TableProps<AnyObject>['onChange'] = (pagination) => {
    console.log('你点击了pagination分页', pagination);
    loadData(pagination.current, pagination.pageSize);
  };

  const instance: iDataTableInstance = {
    reload: async () => {
      return loadData(1);
    }
  };

  useImperativeHandle(ref, () => instance);

  useStrictMounted(async () => {
    await loadData();
  });
  console.log('props', props);
  return (
    <Table
      {...props}
      rowKey={props.rowKeyGetter ?? DEFAULT_ROW_KEY_GETTER}
      dataSource={dataSource}
      loading={loading || props.loading}
      pagination={tableParams.pagination}
      columns={columns}
      onChange={handleTableChange}
    />
  );
});

interface TableParams {
  pagination?: TablePaginationConfig;
}


export interface iDataTableProps<RecordType = any> extends Omit<TableProps<RecordType>, 'dataSource' | 'onChange'> {
  module: string;
  rowKeyGetter?: (record: RecordType) => string | number,
}

const DEFAULT_ROW_KEY_GETTER = (record: any) => record.id;

export interface iDataTableInstance {
  reload: () => Promise<void>;
}
