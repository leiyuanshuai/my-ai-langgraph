import {createTodoOptionInstaller} from "../core/TodoOption.utils";
import React from "react";
import {insertSort} from "@peryl/utils/insertSort";

declare module '../core/TodoOption.utils' {
  namespace TodoNamespace {
    interface iTodoOption {
      renderList: ReturnType<typeof useTodoOptionRenderList>;
    }
  }
}

export const useTodoOptionRenderList = createTodoOptionInstaller((option) => {

  const listRenderConfigs: Record<string, iTodoOptionListRenderConfig | undefined> = {};

  option.render.renderConfigs.list = {
    seq: 1,
    key: 'list',
    render: () => (
      <div ref={val => option.refs.list = val}>
        {option.state.data.map((item, index) => (
          <div key={item.id}>
            {insertSort(
              Object.values(listRenderConfigs).filter(Boolean) as iTodoOptionListRenderConfig[],
              (a, b) => a.seq > b.seq
            ).reduce((prev, listRenderConfig) => {
              return listRenderConfig.render(prev, { item, index });
            }, <span onClick={(e) => option.hooks.onClickItem.exec({ item, index, e })}>{item.normalText}</span>)}
          </div>
        ))}
      </div>
    )
  };

  return {
    listRenderConfigs,
  };
});

export interface iTodoOptionListRenderConfig {
  seq: number,
  key: string,
  render: (prevContent: React.ReactElement, data: { item: any, index: number }) => React.ReactElement
}
