import {createTodoOptionInstaller} from "../core/TodoOption.utils";

export const useTodoOptionOl = createTodoOptionInstaller((option) => {

  option.renderList.listRenderConfigs.ol = {
    seq: 1,
    key: 'ol',
    render: (prevContext, { index }) => <>
      <span>{index + 1} </span>
      {prevContext}
    </>
  };

});
