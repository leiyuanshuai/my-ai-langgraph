import {createTodoOptionInstaller} from "../core/TodoOption.utils";
import React from "react";
import {onBeforeUnmount} from '@peryl/react-compose';

declare module '../core/TodoOption.utils' {
  namespace TodoNamespace {
    interface iTodoOption {
      hooks: ReturnType<typeof useTodoOptionHooks>;
    }
  }
}

export const useTodoOptionHooks = createTodoOptionInstaller(() => {

  return {
    onClickItem: useEventHook<{ item: any, index: number, e: React.MouseEvent }>(),
    onBeforeLoad: useEventHook(),
    onAfterLoad: useEventHook(),
  };

});

function useEventHook<T = unknown>() {

  const listeners = [] as ((data: T) => void)[];

  const exec = (data: T) => listeners.forEach(fn => fn(data));

  const use = (fn: (data: T) => void) => {
    listeners.push(fn);
    return () => eject(fn);
  };

  const eject = (fn: (data: T) => void) => {
    const index = listeners.indexOf(fn);
    if (index > -1) {listeners.splice(index, 1);}
  };

  onBeforeUnmount(() => {listeners.splice(0, listeners.length - 1);});

  return {
    listeners,
    use,
    eject,
    exec,
  };
}
