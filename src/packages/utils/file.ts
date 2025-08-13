import {defer} from "@peryl/utils/defer";
import {notification} from "antd";

/*
* 选择文件
*/
const chooseFile = (config?: FileServiceChooseFileConfig) => {
  config = config || {};
  const input = getInput();

  /*multiple*/
  if (config.multiple) {
    input.setAttribute('multiple', 'multiple');
  } else {
    input.removeAttribute('multiple');
  }
  /*accept*/
  if (!!config.accept) {
    const defaultInputAccept = FileServiceDefaultAccept[config.accept];
    input.setAttribute('accept', defaultInputAccept || config.accept);
  } else {
    input.removeAttribute('accept');
  }
  const dfd = defer<FileServiceSingleFile | FileServiceSingleFile[]>();

  if (!!input.__change) {
    input.value = null as any;
    input.removeEventListener('change', input.__change);
  }
  input.__change = (e) => {
    const targetFiles = (e as any).target.files as FileServiceSingleFile[];
    const files = [];
    for (let i = 0; i < targetFiles.length; i++) {
      const file = targetFiles[i];
      file.calcSize = Number((file.size / (1024 * 1024)).toFixed(2));
      if (!!config!.validator && !config!.validator(file)) return;
      if (!!config!.max && file.calcSize > config!.max) {
        return notification.error({
          message: `[${file.name}]大小为${file.calcSize}MB，超过最大限制${config!.max}MB`,
          duration: 5000
        });
      }
      files.push(file);
    }
    dfd.resolve(config!.multiple ? files : files[0]);
  };
  input.addEventListener('change', input.__change);
  input.click();

  return dfd.promise;
};

export const chooseImage = (multiple?: boolean) => {
  const config: FileServiceChooseFileConfig = { accept: "image", multiple };
  return chooseFile(config);
};

export const FileServiceDefaultAccept = {
  // image: 'image/gif, image/jpeg, image/png, image/jpg',
  image: 'bmp,jpg,jpeg,png,tif,gif,pcx,tga,exif,fpx,svg,psd,cdr,pcd,dxf,ufo,eps,ai,raw,WMF,webp,avif'.split(',').map(i => `image/${i}`).join(', '),
  excel: 'application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
} as Record<string, string>;

export type FileServiceSingleFile = File & { calcSize: number, data?: any }
export type FileServiceValidator = (file: FileServiceSingleFile) => boolean | undefined

export type FileServiceChooseFileConfig = {
  multiple?: boolean,                 // 是否多选
  accept?: string,                    // 选择的文件类型， input组件的accept属性值
  validator?: FileServiceValidator,   // 自定义校验函数
  max?: number,                       // 最大文件大小
}

const getInput = (() => {
  let input: HTMLInputElement & { __change?: (e: Event) => void };
  return () => {
    if (!input) {
      input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.style.display = 'none';
      document.body.appendChild(input);
    }
    return input;
  };
})();
