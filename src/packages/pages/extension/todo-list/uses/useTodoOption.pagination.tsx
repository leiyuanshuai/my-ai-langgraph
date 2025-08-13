import {createTodoOptionInstaller} from "../core/TodoOption.utils";
import {Pagination} from "antd";

export const useTodoOptionPagination = createTodoOptionInstaller((option) => {

  option.render.renderConfigs.pagination = {
    seq: 10,
    key: 'pagination',
    render: () => (
      <Pagination
        current={option.state.query.page + 1}
        total={option.state.query.total}
        pageSize={option.state.query.size}
        onChange={(page, pageSize) => {
          option.state.query.page = page - 1;
          option.state.query.size = pageSize;
          option.methods.load();
        }}
        onShowSizeChange={(_, size) => {
          option.state.query.size = size;
          option.methods.reload();
        }}
      />
    )
  };

  option.keyboard.keyboardBindings.prevPage = {
    key: 'ARROWLEFT',
    handler: () => {
      if (option.loading.isLoading) {return;}
      option.methods.prevPage();
    }
  };

  option.keyboard.keyboardBindings.nextPage = {
    key: 'ARROWRIGHT',
    handler: () => {
      if (option.loading.isLoading) {return;}
      option.methods.nextPage();
    }
  };
});
