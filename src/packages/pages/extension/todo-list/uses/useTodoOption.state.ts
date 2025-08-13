import {createTodoOptionInstaller} from "../core/TodoOption.utils";
import {reactive} from "@peryl/react-compose";

declare module '../core/TodoOption.utils' {
  namespace TodoNamespace {
    interface iTodoOption {
      state: ReturnType<typeof useTodoOptionState>;
    }
  }
}

export const useTodoOptionState = createTodoOptionInstaller((option) => {

  const state = reactive({
    data: [] as any[],
    query: {
      page: 0,
      size: 10,
      total: 0,
    },
  });

  return state;

});
