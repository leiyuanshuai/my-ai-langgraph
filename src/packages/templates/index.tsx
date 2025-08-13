import React from "react";
import {DEMO_RESUME_DATA, iResume} from "../utils/Resume";
import './index.scss';
import {Template01} from "./Template01";
import {Template02} from "./Template02";
import {produce} from 'immer';

export const templates: iTemplateMeta[] = [
  {
    code: 'Template01',
    component: Template01,
    image: 'http://110.42.233.30/web/upload_file/20250623140612_01979b64-ed77-718f-b37b-a89ac567ff73/temp_file_4.jpeg',
    resume: DEMO_RESUME_DATA,
  },
  {
    code: 'Template02',
    component: Template02,
    image: 'http://110.42.233.30/web/upload_file/20250623102101_01979a96-c447-747d-bbf0-7bc670a4bf98/temp_file_0.jpeg',
    resume: produce(DEMO_RESUME_DATA, draft => {
      draft.primary = '#5270af';
    }),
  },
];

export interface iTemplateMeta {
  code: string,
  component: (props: { resume: iResume }) => React.ReactElement,
  image: string,
  resume: iResume,
}
