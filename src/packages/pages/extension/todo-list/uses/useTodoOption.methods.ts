import {createTodoOptionInstaller} from "../core/TodoOption.utils";
import {onMounted} from "@peryl/react-compose";

declare module '../core/TodoOption.utils' {
  namespace TodoNamespace {
    interface iTodoOption {
      methods: ReturnType<typeof useTodoOptionMethods>;
    }
  }
}

export const useTodoOptionMethods = createTodoOptionInstaller((option) => {

  const reload = async () => {
    option.state.query.page = 0;
    option.state.query.total = 0;
    option.state.data = [];
    await load();
  };

  const load = async () => {
    option.hooks.onBeforeLoad.exec({});

    const { list, total } = await option.config.getData({
      page: option.state.query.page,
      size: option.state.query.size,
      data: option.config.param,
    });
    option.state.data = list;
    option.state.query.total = total;

    option.hooks.onAfterLoad.exec({});
  };

  const nextPage = async () => {
    const maxPage = Math.ceil(option.state.query.total / option.state.query.size);
    if (option.state.query.page + 1 > maxPage) {return;}
    option.state.query.page++;
    await load();
  };

  const prevPage = async () => {
    if (option.state.query.page - 1 < 0) {return;}
    option.state.query.page--;
    await load();
  };

  onMounted(() => {reload();});

  return {
    reload,
    nextPage,
    prevPage,
    load,
  };
});
