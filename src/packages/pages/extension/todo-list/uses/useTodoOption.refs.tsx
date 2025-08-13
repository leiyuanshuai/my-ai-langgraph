import {createTodoOptionInstaller} from "../core/TodoOption.utils";

declare module '../core/TodoOption.utils' {
  namespace TodoNamespace {
    interface iTodoOption {
      refs: ReturnType<typeof useTodoOptionRefs>;
    }
  }
}

export const useTodoOptionRefs = createTodoOptionInstaller(() => {

  const refs = { list: null as null | HTMLDivElement, el: null as null | HTMLDivElement };

  return refs;
});
