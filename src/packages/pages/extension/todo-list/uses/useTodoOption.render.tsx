import {createTodoOptionInstaller} from "../core/TodoOption.utils";
import React, {Fragment} from "react";
import {insertSort} from "@peryl/utils/insertSort";

declare module '../core/TodoOption.utils' {
  namespace TodoNamespace {
    interface iTodoOption {
      render: ReturnType<typeof useTodoOptionRender>;
    }
  }
}

export const useTodoOptionRender = createTodoOptionInstaller(() => {

  const renderConfigs: Record<string, iTodoOptionRenderConfig | undefined> = {};

  const renderContent = () => {
    return insertSort(Object.values(renderConfigs) as iTodoOptionRenderConfig[], (a, b) => a.seq > b.seq).map(item => (
      <Fragment key={item.key}>
        {item.render()}
      </Fragment>
    ));
  };

  return { renderContent, renderConfigs };
});

export interface iTodoOptionRenderConfig {
  seq: number,
  key: string,
  render: () => React.ReactElement
}
