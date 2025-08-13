import {iResume} from "../utils/Resume";
import './Template01.scss';
import {ReadOutlined, AuditOutlined} from '@ant-design/icons';
import {Fragment} from "react";

export const Template01 = (props: { resume: iResume }) => {
  return (
    <div className="resume-template template-01" style={{
      '--primary': props.resume.primary,
      '--secondary': props.resume.secondary,
    } as any}>
      <div className="template-header">
        <div>
          {props.resume.title}
        </div>
        <div>
        </div>
        <div>
          <div>细心从每一个细节开始</div>
          <div>Personal resume</div>
        </div>
        <div>
          <div className="template-01-header-icon"><ReadOutlined/></div>
          <div className="template-01-header-icon"><AuditOutlined/></div>
        </div>
      </div>

      <div className="template-header-line">
        <div className="template-header-line-inner">
        </div>
      </div>

      <TemplateTitle title={props.resume.basicInfo.title}/>

      <div className="template-basic-info">
        <div>
          {props.resume.basicInfo.data.map((item, index) => (
            <div key={index}>
              {item.label}：{item.val}
            </div>
          ))}
        </div>
        <div>
          <img src={props.resume.avatar} alt=""/>
        </div>
      </div>

      <TemplateTitle title={props.resume.education.title}/>

      {props.resume.education.data.map((item, index) => (
        <TemplateCard key={index} leftTitle={item.time} centerTitle={item.school} rightTitle={item.program} content={item.content}/>
      ))}

      <TemplateTitle title={props.resume.experience.title}/>

      {props.resume.experience.data.map((item, index) => (
        <TemplateCard key={index} leftTitle={item.time} centerTitle={item.company} rightTitle={item.role} content={item.content}/>
      ))}

      {props.resume.externals.map((item, index) => (
        <Fragment key={index}>
          {!!item.title?.trim().length && <TemplateTitle title={item.title}/>}
          <TemplateCard content={item.content}/>
        </Fragment>
      ))}
    </div>
  );
};

function TemplateTitle(props: { title: string }) {
  return (
    <div className="template-title">
      <div className="template-title-text">{props.title}</div>
      <div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
}

function TemplateCard(
  props: {
    leftTitle?: string,
    centerTitle?: string,
    rightTitle?: string,
    content?: string[],
  }
) {
  return (
    <>
      {(props.leftTitle || props.centerTitle || props.rightTitle) && (
        <div className="template-card-title">
          <div>{props.leftTitle}</div>
          <div>{props.centerTitle}</div>
          <div>{props.rightTitle}</div>
        </div>
      )}
      {props.content?.map((item, index) => (
        <div className="template-card-item" key={index} data-last={String(index === props.content!.length - 1)}>
          {item}
        </div>
      ))}
    </>
  );
}
