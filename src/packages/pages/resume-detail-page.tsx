import './resume-detail-page.scss';
import {Alert, Button, Col, ColorPicker, Dropdown, Form, Input, MenuProps, Modal, notification, Row, Space} from "antd";
import {ResumeIcon} from "../components/ResumeIcon";
import {DEMO_RESUME_DATA, iResume} from "../utils/Resume";
import {useNavigate} from "react-router";
import {useStrictMounted} from "../uses/useStrictMounted";
import {useQuery} from "../uses/useQuery";
import {http} from "../utils/http";
import {iResumeRecord} from "../utils/ResumeRecord";
import {Fragment, useRef, useState} from "react";
import {templates} from "../templates";
import chunk from "lodash/chunk";
import {selectTemplate} from "../templates/selectTemplate";
import {getUserPromptData, iUserPromptData} from "../components/getUserPromptData";
import {PlatformCodes} from "../utils/PlatformCodes";
import {chatStreamProxy} from "../utils/chatStream.proxy";
import {AiResumeSystemPrompt, AiResumeTranslatePrompt} from "../utils/ResumeSystemPrompt";
import {createJsonStreamHandler} from "../utils/createJsonStreamHandler";
import {checkValueByDescription, createArrayFieldDescription, createDescription, createObjectFieldDescription, DataDescriptionTypes} from "../utils/DataDescription";
import {cloneDeep} from 'lodash';
import {produce} from "immer";
import {delay} from '@peryl/utils/delay';
import {useLoadingState} from "../uses/useLoadingState";
import {createEffects} from '@peryl/utils/createEffects';
import {LoadingOutlined} from '@ant-design/icons';
import {chooseImage} from "../utils/file";
import {upload} from "../utils/upload";
import {pathJoin} from "@peryl/utils/pathJoin";
import env from "../../env/env";
import {getSnapshot} from "../utils/getSnapshot";
import {exportElement2Pdf} from "../utils/exportElement2Pdf";

export default function () {

  const navigate = useNavigate();
  const query = useQuery();

  const [form] = Form.useForm();
  const formData = Form.useWatch(undefined, form);

  const resumeRecordRef = useRef(null as null | iResumeRecord);
  const [templateCode, setTemplateCode] = useState(null as null | string);

  const bodyLeftRef = useRef(null as null | HTMLDivElement);
  const bodyRightRef = useRef(null as null | HTMLDivElement);

  const scrollBottom = () => {
    if (!bodyLeftRef.current || !bodyRightRef.current) {return;}
    bodyLeftRef.current.scrollTop = bodyLeftRef.current.scrollHeight;
    bodyRightRef.current.scrollTop = bodyRightRef.current.scrollHeight;
  };

  const reloadResumeRecord = () => {
    setTemplateCode(resumeRecordRef.current?.remarks ?? 'Template01');
    const resume = !resumeRecordRef.current?.jsonString ? DEMO_RESUME_DATA : JSON.parse(resumeRecordRef.current.jsonString);
    console.log(resume);
    form.setFieldsValue(resume);
  };

  useStrictMounted(async () => {
    if (!query.id) {
      notification.error({ message: '缺少query参数：id' });
      return;
    }
    if (query.id === 'new') {
      resumeRecordRef.current = null;
    } else {
      const response = await http.post<{ result: iResumeRecord }>('resume/item', { id: query.id });
      resumeRecordRef.current = response.data.result;
    }
    reloadResumeRecord();
  });

  const saveManager = (() => {

    const { isLoading, loading } = useLoadingState();

    const startSave = async () => {
      const snapshot = await getSnapshot(exportManager.previewRef.current!, true);
      const saveResumeRecord: iResumeRecord = { ...resumeRecordRef.current, remarks: templateCode!, isTemplate: 'K', image: snapshot };
      saveResumeRecord.jsonString = JSON.stringify(formData);
      const closeLoading = loading();
      try {
        const response = await http.post<{ result: iResumeRecord }>(`/resume/${saveResumeRecord.id ? 'update' : 'insert'}`, { row: saveResumeRecord });
        resumeRecordRef.current = response.data.result;
        reloadResumeRecord();
        notification.success({ message: '保存成功' });
      } catch (e: any) {
        console.error(e);
        notification.error({ message: e.message || JSON.stringify(e) });
      } finally {
        closeLoading();
      }
    };

    return {
      content: (
        <Button loading={isLoading} onClick={startSave} type="primary">保存</Button>
      )
    };
  })();

  const exportManager = (() => {

    const previewRef = useRef(null as null | HTMLDivElement);
    const dropdownOptions: { key: string, label: string, handleClick: () => void }[] = [
      {
        key: '1', label: '导出PDF', handleClick: () => {
          return exportElement2Pdf(previewRef.current!);
        },
      },
      {
        key: '2', label: '导出图片', handleClick: async () => {
          const imagePath = await getSnapshot(previewRef.current!, false);
          window.open(imagePath);
        },
      },
      {
        key: '3', label: '导出数据', handleClick: () => {
          Modal.info({
            title: "导出数据",
            icon: null,
            closable: true,
            width: 600,
            content: <Input.TextArea style={{ minHeight: '400px' }} value={JSON.stringify(formData)}/>
          });
        },
      },
    ];

    return {
      previewRef,
      content: (
        <OptionButton
          options={dropdownOptions}
          handleClick={option => option.handleClick()}
        >
          <span>导出</span>
        </OptionButton>
      )
    };
  })();

  const uploadAvatar = (() => {

    const { isLoading, loading } = useLoadingState();

    const startUploadAvatar = async () => {
      const avatarFile = await chooseImage();
      const closeLoading = loading();
      try {
        const avatarPath = await new Promise((resolve, reject) => {
          upload({
            action: pathJoin(env.baseURL, 'saveFile'),
            file: avatarFile,
            filename: 'file',
            onSuccess: (e: any) => {resolve(pathJoin(env.assetsPrefix, e.result?.path));},
            onError: (e: any) => {reject(e);},
          });
        });
        form.setFieldValue('avatar', avatarPath);
      } catch (e: any) {
        console.error(e);
        notification.error({ message: '文件上传失败' + (e.message || JSON.stringify(e)) });
      } finally {
        closeLoading();
      }
    };
    return (
      <Button loading={isLoading} onClick={startUploadAvatar}>上传职业照</Button>
    );
  })();

  const changeTemplate = async () => {
    try {
      const template = await selectTemplate();
      setTemplateCode(template.code);
      form.setFieldsValue({
        ...formData,
        primary: template.resume.primary,
        secondary: template.resume.secondary,
      });
      console.log(template);
    } catch (e) {
      console.error(e);
    }
  };

  const aiGenerator = (() => {

    const { isLoading, loading } = useLoadingState();
    const [abortEffects] = useState(() => createEffects().effects);

    const startAiGenerator = async () => {

      if (abortEffects.list.length) {
        /*主动停止流式调用*/
        abortEffects.clear();
        return;
      }

      let userPromptData: iUserPromptData | undefined = undefined;
      try {
        userPromptData = await getUserPromptData({
          title: "AI 生成简历",
          userContent: '在阿里、百度、腾讯登知名大厂有100年工作经验，精通js，html，css，精通vue全家桶，包括xxx，精通react全家桶，包括xxx；',
          description: '请在下方输入您的简历要求，适当补充其他信息如基本信息、教育经历、工作经历、兴趣爱好、技能特长等等\n',
          predefineOptions: ["人工智能训练师", "跨境电商运营", "数据标注师", "游戏原画师", "宠物行为训练师", "碳排放管理师", "市场营销经理", "航空乘务员", "智能家居设计师", "电子竞技教练", "剧本杀编导", "电竞数据分析师", "临终关怀师"],
          platformOptions: PlatformCodes,
        });
      } catch (e) {console.log(e);}

      if (!userPromptData) {return;}

      const closeLoading = loading();
      try {
        const sourceFormData: iResume = cloneDeep(formData);
        const ResumeDescription = createDescription({
          title: { type: DataDescriptionTypes.String, default: () => sourceFormData.title /*保留简历标题*/ },
          primary: { type: DataDescriptionTypes.String, default: () => sourceFormData.primary /*保留主题色*/ },
          secondary: { type: DataDescriptionTypes.String, default: () => sourceFormData.secondary /*保留次级色*/ },
          avatar: { type: DataDescriptionTypes.String, default: () => sourceFormData.avatar /*保留头像地址*/ },
          basicInfo: createObjectFieldDescription(
            {
              title: { type: DataDescriptionTypes.String, default: () => sourceFormData.basicInfo.title /*保留基础信息标题*/ },
              data: createArrayFieldDescription(
                { label: DataDescriptionTypes.String, type: DataDescriptionTypes.String, val: DataDescriptionTypes.String, icon: DataDescriptionTypes.String },
                () => []/*自动初始化basicInfo.data*/
              )
            },
            () => ({})/*自动初始化basicInfo*/
          ),
          education: createObjectFieldDescription(
            {
              title: { type: DataDescriptionTypes.String, default: () => sourceFormData.education.title /*保留教育经历标题*/ },
              data: createArrayFieldDescription(
                { time: DataDescriptionTypes.String, school: DataDescriptionTypes.String, program: DataDescriptionTypes.String, content: createArrayFieldDescription(DataDescriptionTypes.String, () => []/*自动初始化 education.data.?.content */), },
                () => []/*自动初始化education.data*/
              )
            },
            () => ({})/*自动初始化education*/
          ),
          experience: createObjectFieldDescription(
            {
              title: { type: DataDescriptionTypes.String, default: () => sourceFormData.experience.title /*保留工作经历标题*/ },
              data: createArrayFieldDescription(
                { time: DataDescriptionTypes.String, company: DataDescriptionTypes.String, role: DataDescriptionTypes.String, content: createArrayFieldDescription(DataDescriptionTypes.String, () => []/*自动初始化experience.data.?content*/), },
                () => []/*自动初始化experience.data*/
              )
            },
            () => ({})/*自动初始化experience*/
          ),
          externals: createArrayFieldDescription(
            {
              title: DataDescriptionTypes.String,
              content: createArrayFieldDescription(DataDescriptionTypes.String, () => []/*自动初始化externals?.content*/)
            },
            () => []/*自动初始化externals*/
          )
        });
        const newResumeData = checkValueByDescription({}, ResumeDescription);

        /*基础信息中的子信息数据与标准数据中的基础信息子信息数据合并*/
        newResumeData.basicInfo.data = newResumeData.basicInfo.data.map(item => {
          const oldItem = DEMO_RESUME_DATA.basicInfo.data.find(i => i?.type === item.type || i?.label === item.label);
          return {
            ...item,
            ...oldItem,
            label: item.label ?? oldItem?.label,
            val: item.val,
          };
        });
        // console.log(newResumeData);
        newResumeData.primary = sourceFormData.primary ?? DEMO_RESUME_DATA.primary;
        newResumeData.secondary = sourceFormData.secondary ?? DEMO_RESUME_DATA.secondary;
        newResumeData.avatar = sourceFormData.avatar ?? DEMO_RESUME_DATA.avatar;

        form.setFieldsValue(newResumeData);

        const { handleFullText } = createJsonStreamHandler();

        let fullText = '';
        await chatStreamProxy({
          platformCode: userPromptData.platformCode,
          abortEffects,
          messages: [
            { role: 'system', content: AiResumeSystemPrompt },
            { role: 'user', content: userPromptData.userContent },
          ],
          onReceiving: ({ chunkText }) => {
            fullText += chunkText;
            form.setFieldsValue(produce(
              form.getFieldsValue(),
              (draft: any) => {
                fullText = handleFullText(draft, fullText).list.join('\n');
                checkValueByDescription(draft, ResumeDescription);
                draft.primary = sourceFormData.primary ?? DEMO_RESUME_DATA.primary;
                draft.secondary = sourceFormData.secondary ?? DEMO_RESUME_DATA.secondary;
                draft.avatar = sourceFormData.avatar ?? DEMO_RESUME_DATA.avatar;
                return draft;
              }
            ));
            delay(23).then(() => scrollBottom());
          },
        });

        notification.success({ message: '简历生成完毕' });
      } catch (e: any) {
        console.error(e);
        notification.error({ message: e.message || JSON.stringify(e) });
      } finally {
        closeLoading();
      }
    };

    const content = (
      <Button onClick={startAiGenerator}>
        {isLoading && <LoadingOutlined/>}
        <ResumeIcon icon="ie-stick"/>
        <span>AI 生成</span>
      </Button>
    );

    return {
      content,
    };
  })();

  const aiTranslator = (() => {

    const [translateEffects] = useState(() => createEffects().effects);

    const dropdownOptions: { key: string, label: string, promptName: string }[] = [
      { key: '1', label: 'English', promptName: '英语' },
      { key: '2', label: '日本語', promptName: '日语' },
      { key: '3', label: 'Français', promptName: '法语' },
      { key: '4', label: 'Deutsch', promptName: '德语' },
      { key: '5', label: 'Русский язык', promptName: '俄语' },
    ];

    const startTranslating = async (promptName: string) => {

      if (!!translateEffects.list.length) {
        translateEffects.clear();
        return;
      }

      const sourceFormData = cloneDeep(formData);
      let fullText = '';
      const { handleFullText } = createJsonStreamHandler();
      try {
        await chatStreamProxy({
          abortEffects: translateEffects,
          platformCode: PlatformCodes[0],
          messages: [
            { role: 'system', content: AiResumeTranslatePrompt },
            { role: 'user', content: `帮我把这里边的数据翻译成 ${promptName}，数据如下所示：${JSON.stringify(formData)}` }
          ],
          onReceiving: ({ chunkText }) => {
            fullText += chunkText;
            form.setFieldsValue(produce(form.getFieldsValue(), (draft: any) => {
              fullText = handleFullText(draft, fullText).list.join('\n');
              draft.primary = sourceFormData.primary ?? DEMO_RESUME_DATA.primary;
              draft.secondary = sourceFormData.secondary ?? DEMO_RESUME_DATA.secondary;
              draft.avatar = sourceFormData.avatar ?? DEMO_RESUME_DATA.avatar;
              return draft;
            }));
          },
        });
      } catch (e: any) {
        console.error(e);
        if (e.message?.indexOf('abort') > -1) {
          console.log('abort');
        } else {
          notification.error({ message: e.message || JSON.stringify(e) });
        }
      }
    };

    return (
      <OptionButton
        options={dropdownOptions}
        handleClick={option => startTranslating(option.promptName)}
      >
        <span>AI翻译</span>
      </OptionButton>
    );
  })();

  return (
    <div className="resume-detail-page">
      <div className="resume-detail-page-toolbar">
        <div>
          <ResumeIcon icon="ai"/>
          <span>AI 生成简历</span>
        </div>
        <div>
          <Button onClick={() => navigate(-1)}>返回</Button>
          {exportManager.content}
          {uploadAvatar}
          <Button onClick={changeTemplate}>选择模板</Button>
          {aiGenerator.content}
          {aiTranslator}
          {saveManager.content}
        </div>
      </div>
      <div className="resume-detail-page-body">
        <div className="resume-detail-page-body-left" ref={bodyLeftRef}>
          <Form className="resume-detail-form" form={form}>

            <Row><Col span={0}><Form.Item name="avatar"/><Input/></Col></Row>

            {/*---------------------------------------简历信息-------------------------------------------*/}
            <FormCard title="简历信息">
              <Row>
                <Col span={24}>
                  <Form.Item name="title" label="简历标题">
                    <Input/>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="primary" label="主题色" getValueFromEvent={e => e.toHexString()}>
                    <ColorPicker format="hex" showText/>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="secondary" label="次级色" getValueFromEvent={e => e.toHexString()}>
                    <ColorPicker format="hex" showText/>
                  </Form.Item>
                </Col>
              </Row>
            </FormCard>

            {/*---------------------------------------基础信息-------------------------------------------*/}

            <FormCard title="基础信息">
              <Row>
                <Col span={24}>
                  <Form.Item name={["basicInfo", "title"]} label="标题">
                    <Input/>
                  </Form.Item>
                </Col>
              </Row>
              <Form.List name={["basicInfo", "data"]}>
                {list => {
                  return (
                    chunk(list, 2).map((subList, subIndex) => {
                      return (
                        <Row gutter={16} key={subIndex}>
                          {subList.map((item, index) => (
                            <Fragment key={index}>
                              <Col span={12}>
                                <Space.Compact>
                                  <Form.Item name={[item.name, 'label']} style={{ width: '30%' }}>
                                    <Input/>
                                  </Form.Item>
                                  <Form.Item name={[item.name, 'val']} style={{ width: '70%' }}>
                                    <Input/>
                                  </Form.Item>
                                </Space.Compact>
                              </Col>
                            </Fragment>
                          ))}
                        </Row>
                      );
                    })
                  );
                }}
              </Form.List>
            </FormCard>

            {/*---------------------------------------教育经历-------------------------------------------*/}

            <FormCard title="教育经历">
              <Row>
                <Col span={24}>
                  <Form.Item name={["education", "title"]} label="标题">
                    <Input/>
                  </Form.Item>
                </Col>
              </Row>
              <Form.List name={["education", "data"]}>
                {(list) => (
                  list.map((item) => (
                    <Fragment key={item.key}>
                      <h3> {(() => {
                        const school = form.getFieldValue(['education', 'data', item.key, 'school'])?.trim();
                        const program = form.getFieldValue(['education', 'data', item.key, 'program'])?.trim();
                        return <span>{[school, program].filter(Boolean).join(' / ')}</span>;
                      })()}</h3>
                      <Row gutter={16}>
                        <Col span={24}>
                          <Form.Item label="学校" name={[item.name, 'school']}>
                            <Input/>
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item label="时间" name={[item.name, 'time']}>
                            <Input/>
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item label="专业" name={[item.name, 'program']}>
                            <Input/>
                          </Form.Item>
                        </Col>
                      </Row>
                      <Form.List name={[item.name, 'content']}>
                        {list => (
                          list.map((item) => (
                            <Row key={item.key}>
                              <Col span={24}>
                                <Space.Compact>
                                  <Form.Item name={[item.name]} noStyle>
                                    <Input
                                      addonBefore={<span>#{Number(item.key) + 1}</span>}
                                    />
                                  </Form.Item>
                                  <Button><ResumeIcon icon="ie-stick"/></Button>
                                </Space.Compact>
                              </Col>
                            </Row>
                          ))
                        )}
                      </Form.List>
                    </Fragment>
                  ))
                )}
              </Form.List>
            </FormCard>

            {/*---------------------------------------工作经历-------------------------------------------*/}
            <FormCard title="工作经历">
              <Row>
                <Col span={24}>
                  <Form.Item name={["experience", "title"]} label="标题">
                    <Input/>
                  </Form.Item>
                </Col>
              </Row>
              <Form.List name={["experience", "data"]}>
                {(list) => (
                  list.map((item) => (
                    <Fragment key={item.key}>
                      <h3> {(() => {
                        const name1 = form.getFieldValue(['experience', 'data', item.key, 'company'])?.trim();
                        const name2 = form.getFieldValue(['experience', 'data', item.key, 'role'])?.trim();
                        return <span>{[name1, name2].filter(Boolean).join(' / ')}</span>;
                      })()}</h3>
                      <Row gutter={16}>
                        <Col span={24}>
                          <Form.Item label="公司/项目" name={[item.name, 'company']}>
                            <Input/>
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item label="时间" name={[item.name, 'time']}>
                            <Input/>
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item label="岗位/职责" name={[item.name, 'role']}>
                            <Input/>
                          </Form.Item>
                        </Col>
                      </Row>
                      <Form.List name={[item.name, 'content']}>
                        {list => (
                          list.map((item) => (
                            <Row key={item.key}>
                              <Col span={24}>
                                <Space.Compact>
                                  <Form.Item name={[item.name]} noStyle>
                                    <Input
                                      addonBefore={<span>#{Number(item.key) + 1}</span>}
                                    />
                                  </Form.Item>
                                  <Button><ResumeIcon icon="ie-stick"/></Button>
                                </Space.Compact>
                              </Col>
                            </Row>
                          ))
                        )}
                      </Form.List>
                    </Fragment>
                  ))
                )}
              </Form.List>
            </FormCard>

            {/*---------------------------------------其他内容-------------------------------------------*/}
            <Form.List name={['externals']}>
              {list => list.map((item) => (
                <FormCard title={form.getFieldValue(['externals', item.name, 'title'])} key={item.key}>
                  <Form.List name={[item.name, 'content']}>
                    {list => (
                      list.map(item => (
                        <Row key={item.key}>
                          <Col span={24}>
                            <Space.Compact>
                              <Form.Item name={[item.name]} noStyle>
                                <Input
                                  addonBefore={<span>#{Number(item.key) + 1}</span>}
                                />
                              </Form.Item>
                              <Button><ResumeIcon icon="ie-stick"/></Button>
                            </Space.Compact>
                          </Col>
                        </Row>
                      ))
                    )}
                  </Form.List>
                </FormCard>
              ))}
            </Form.List>
          </Form>
        </div>
        <div className="resume-detail-page-body-right" ref={bodyRightRef}>
          {(() => {
            const Template = templates.find(i => i.code === templateCode);
            if (!Template) {
              return <Alert type="error" message={`找不到模板：${templateCode}`}/>;
            }
            const { component: Component } = Template;
            console.log('formData', formData)
            return (
              <div ref={exportManager.previewRef}>
                <Component resume={formData}/>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

function FormCard(props: { title: string, children?: any }) {
  return (
    <>
      <div className="resume-detail-form-card-title">{props.title}</div>
      <div className="resume-detail-form-card-body">
        {props.children}
      </div>
    </>
  );
}

function OptionButton<T extends { key: string, label: string }>(
  props: {
    options: T[],
    handleClick: (item: T) => void | Promise<void>,
    children?: any,
  },
) {
  const { isLoading, loading } = useLoadingState();

  const handleClick = async (val: T) => {
    const closeLoading = loading();
    try {
      await props.handleClick(val);
    } catch (e: any) {
      console.error(e);
      notification.error({ message: e.message ?? JSON.stringify(e) });
    } finally {
      closeLoading();
    }
  };

  const onButtonClick = () => {handleClick(props.options[0]);};
  const onMenuClick: MenuProps['onClick'] = (e) => {handleClick(props.options.find(i => i.key === e.key)!);};

  return (
    <Dropdown.Button
      onClick={onButtonClick}
      menu={{ items: isLoading ? [] : props.options.map(({ key, label }) => ({ key, label })), onClick: onMenuClick }}
    >
      {isLoading && <LoadingOutlined/>}
      {props.children}
    </Dropdown.Button>
  );
};
