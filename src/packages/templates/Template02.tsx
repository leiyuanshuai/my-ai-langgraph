import './Template02.scss';
import {iResume} from "../utils/Resume";
import {Image} from 'antd';
import {Fragment} from "react";

export function Template02(props: { resume: iResume }) {
  return (
    <div className="resume-template template-02" style={{
      '--primary': props.resume.primary,
      '--secondary': props.resume.secondary,
    } as any}>
      <div className="template-02-header">
        PERSONAL RESUME
      </div>

      {/*---------------------------------------基础信息-------------------------------------------*/}

      <SectionTitle title={props.resume.title}/>
      <div className="template-02-basic-info">
        <div className="template-02-basic-info-left">
          {props.resume.basicInfo.data.map((item, index) => (
            <div key={index}>
              <span>{item.label}</span>
              <span>：</span>
              <span>{item.val}</span>
            </div>
          ))}
        </div>
        <div className="template-02-basic-info-right">
          <Image src={props.resume.avatar}/>
        </div>
      </div>

      {/*---------------------------------------教育经历-------------------------------------------*/}

      <SectionTitle title={props.resume.education.title}/>

      {props.resume.education.data.map((item, index) => (
        <SectionCard key={index} leftTitle={item.time} centerTitle={item.school} rightTitle={item.program} content={item.content}/>
      ))}

      {/*---------------------------------------工作经历-------------------------------------------*/}

      <SectionTitle title={props.resume.experience.title}/>

      {props.resume.experience.data.map((item, index) => (
        <SectionCard key={index} leftTitle={item.time} centerTitle={item.company} rightTitle={item.role} content={item.content}/>
      ))}

      {/*---------------------------------------externals-------------------------------------------*/}

      {props.resume.externals.map((item, index) => (
        <Fragment key={index}>
          {!!item.title && <SectionTitle title={item.title}/>}
          <SectionCard key={index} content={item.content}/>
        </Fragment>
      ))}
    </div>
  );
}

function SectionTitle(props: { title: string }) {
  return (
    <div className="template-02-section-title">
      <span>{props.title}</span>
    </div>
  );
}

function SectionCard(props: {
  leftTitle?: string,
  centerTitle?: string,
  rightTitle?: string,
  content: string[],
}) {
  return (
    <>
      {
        (props.leftTitle ||
          props.centerTitle ||
          props.rightTitle) &&
        <div className="template-02-section-card-title">
          <span>{props.leftTitle}</span>
          <span>{props.centerTitle}</span>
          <span>{props.rightTitle}</span>
        </div>
      }

      {props.content.map((item, index) => (
        <div key={index} className="template-02-section-card-row" data-last={String(index === props.content.length - 1)}>{item}</div>
      ))}
    </>
  );
}
