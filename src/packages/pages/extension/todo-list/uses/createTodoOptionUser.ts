import {insertSort} from '@peryl/utils/insertSort';
import {TodoNamespace} from "../core/TodoOption.utils";
import {useTodoOptionState} from "./useTodoOption.state";
import {useTodoOptionMethods} from "./useTodoOption.methods";
import {useTodoOptionRender} from "./useTodoOption.render";
import {useTodoOptionRenderList} from "./useTodoOption.render.list";
import {useTodoOptionPagination} from "./useTodoOption.pagination";
import {useTodoOptionUl} from "./useTodoOption.ul";
import {useTodoOptionOl} from "./useTodoOption.ol";
import {useTodoOptionRadio} from "./useTodoOption.radio";
import {useTodoOptionCheck} from "./useTodoOption.check";
import {useTodoOptionHooks} from "./useTodoOption.hooks";
import {useTodoOptionLoading} from "./useTodoOption.loading";
import {useTodoOptionDraggier} from "./useTodoOption.draggier";
import {useTodoOptionRefs} from "./useTodoOption.refs";
import {useTodoOptionKeyboard} from "./useTodoOption.keyboard";

export const TodoModuleConfigList: { key: string, seq: number, installer: TodoNamespace.iTodoOptionModule }[] = [];

export function createTodoOptionUser(defaultConfig: TodoNamespace.iTodoOptionDefaultConfig) {

  const useTodoOption = (useConfig: TodoNamespace.iTodoOptionUseConfig) => {

    const config: TodoNamespace.iTodoOptionConfig = {
      ...defaultConfig,
      ...useConfig,
    };

    const option: TodoNamespace.iTodoOption = { config } as any;

    insertSort(TodoModuleConfigList, (a, b) => a.seq > b.seq).forEach(moduleConfig => {
      const moduleExpose = moduleConfig.installer(option);
      if (!!moduleExpose) {
        (option as any)[moduleConfig.key] = moduleExpose;
      }
    });

    return option;
  };

  return useTodoOption;
}


TodoModuleConfigList.push({ seq: 0, key: 'hooks', installer: useTodoOptionHooks });
TodoModuleConfigList.push({ seq: 1, key: 'state', installer: useTodoOptionState });
TodoModuleConfigList.push({ seq: 2, key: 'methods', installer: useTodoOptionMethods });
TodoModuleConfigList.push({ seq: 3, key: 'render', installer: useTodoOptionRender });
TodoModuleConfigList.push({ seq: 4, key: 'refs', installer: useTodoOptionRefs });
TodoModuleConfigList.push({ seq: 5, key: 'keyboard', installer: useTodoOptionKeyboard });

TodoModuleConfigList.push({ seq: 20, key: 'renderList', installer: useTodoOptionRenderList });
TodoModuleConfigList.push({ seq: 21, key: 'renderListUl', installer: useTodoOptionUl });
TodoModuleConfigList.push({ seq: 22, key: 'renderListOl', installer: useTodoOptionOl });
TodoModuleConfigList.push({ seq: 22, key: 'pagination', installer: useTodoOptionPagination });
TodoModuleConfigList.push({ seq: 23, key: 'radio', installer: useTodoOptionRadio });
TodoModuleConfigList.push({ seq: 24, key: 'check', installer: useTodoOptionCheck });
TodoModuleConfigList.push({ seq: 24, key: 'loading', installer: useTodoOptionLoading });
TodoModuleConfigList.push({ seq: 24, key: 'draggier', installer: useTodoOptionDraggier });
