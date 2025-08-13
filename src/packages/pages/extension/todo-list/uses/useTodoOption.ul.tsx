import {createTodoOptionInstaller} from "../core/TodoOption.utils";

export const useTodoOptionUl = createTodoOptionInstaller((option) => {

  option.renderList.listRenderConfigs.ul = {
    seq: 0,
    key: 'ul',
    render: (prevContext) => <>
      <span>· </span>
      {prevContext}
    </>
  };

});
