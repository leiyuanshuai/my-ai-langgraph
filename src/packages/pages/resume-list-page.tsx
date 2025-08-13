import {useStrictMounted} from "../uses/useStrictMounted";
import {http} from "../utils/http";
import React, {useState} from "react";
import './resume-list-page.scss';
import {Button, notification} from "antd";
import {CloseOutlined, CloudUploadOutlined, FileAddOutlined, PlusSquareOutlined} from '@ant-design/icons';
import {router} from "../home/routes";
import {CardList} from "../components/CardList";
import {useLoadingState} from "../uses/useLoadingState";
import {iResumeRecord} from "../utils/ResumeRecord";
import {LoadingCover} from "../components/LoadingCover";
import {modalConfirm} from "../components/modalConfirm";

export default function () {

  const { loading, isLoading } = useLoadingState();
  const [resumeRecordList, setResumeRecordList] = useState([] as iResumeRecord[]);

  const reloadData = async () => {
    const closeLoading = loading();
    try {
      const response = await http.post<{ list: iResumeRecord[] }>('/resume/list', { size: 999, filters: [{ id: '01', field: 'isTemplate', operator: '=', value: 'K' }] });
      setResumeRecordList(response.data.list);
      console.log("Response", response.data.list);
    } catch (e) {
      console.error(e);
    } finally {
      closeLoading();
    }
  };

  const editResume = (resumeRecord?: iResumeRecord) => {router.navigate(`/pages/resume-detail?id=${resumeRecord?.id ?? 'new'}`);};

  const copyResume = async (resumeRecord: iResumeRecord) => {
    if (!await modalConfirm(`复制简历?`)) {return;}
    const closeLoading = loading();
    try {
      const { id, createdAt, createdBy, updatedAt, updatedBy, ...newResume } = resumeRecord;
      await http.post('/resume/insert', { row: newResume });
      await reloadData();
    } catch (e) {
      console.error(e);
    } finally {
      closeLoading();
    }
  };

  const deleteResume = async (resumeRecord: iResumeRecord) => {
    if (!await modalConfirm(`删除简历?`)) {return;}
    const closeLoading = loading();
    try {
      await http.post('/resume/delete', { id: resumeRecord.id });
      await reloadData();
      notification.success({ message: '已删除' });
    } catch (e) {
      console.error(e);
    } finally {
      closeLoading();
    }
  };

  const notFinish = () => {
    notification.info({ message: '未完成' });
  };

  useStrictMounted(() => {reloadData();});

  const renderList: ((() => React.ReactElement) | iResumeRecord)[] = [
    () => (
      <div className="card-list-operation">
        <div className="card-list-operation-title">
          创建简历
        </div>
        <div className="card-list-operation-item" onClick={() => editResume(undefined)}>
          <FileAddOutlined/>
          <span>创建简历</span>
        </div>
        <div className="card-list-operation-item" onClick={notFinish}>
          <CloudUploadOutlined/>
          <span>导入简历文件</span>
        </div>
        <div className="card-list-operation-item" onClick={notFinish}>
          <PlusSquareOutlined/>
          <span>导入简历数据</span>
        </div>
      </div>
    ),
    ...resumeRecordList
  ];

  return (
    <div className="resume-list-page" style={{ padding: '1em' }}>
      {isLoading ? <LoadingCover/> :   <CardList
        data={renderList}
        cover={(item) => (
          <div className="card-list-cover">
            <Button type="primary" onClick={() => editResume(item)}>编辑简历</Button>
            <Button danger type="primary" className="card-list-cover-deleter" onClick={() => deleteResume(item)}>
              <CloseOutlined/>
            </Button>
            <span onClick={() => copyResume(item)}>复制简历</span>
          </div>
        )}
      />}

    </div>
  );
}
