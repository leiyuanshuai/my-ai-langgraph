import {createTodoOptionInstaller} from "../core/TodoOption.utils";
import {Button, Checkbox, Space} from "antd";
import {reactive} from "@peryl/react-compose";

declare module '../core/TodoOption.utils' {
  namespace TodoNamespace {
    interface iTodoOption {
      check: ReturnType<typeof useTodoOptionCheck>;
    }
  }
}


export const useTodoOptionCheck = createTodoOptionInstaller((option) => {

  const state = reactive({
    checkedData: [] as any[]
  });

  const isChecked = (targetItem: any) => {
    return !!state.checkedData.find(i => i.id === targetItem.id);
  };

  const toggleChecked = (targetItem: any) => {
    const index = state.checkedData.findIndex(i => i.id === targetItem.id);
    if (index > -1) {
      state.checkedData.splice(index, 1);
    } else {
      state.checkedData.push(targetItem);
    }
  };

  const clearChecked = () => {
    state.checkedData.splice(0, state.checkedData.length);
  };

  const checkAll = () => {
    const uncheck = option.state.data.filter(i => !isChecked(i));
    state.checkedData = [...state.checkedData, ...uncheck];
  };

  option.render.renderConfigs.checkButtons = {
    seq: 0,
    key: 'checkButtons',
    render: () => (
      <div>
        <Space>
          <Button onClick={clearChecked}>清空选中</Button>
          <Button onClick={checkAll}>全部选中</Button>
        </Space>
      </div>
    )
  };

  option.renderList.listRenderConfigs.check = {
    seq: 1,
    key: 'check',
    render: (prevContext, { item }) => <>
      <Checkbox checked={isChecked(item)} onClick={() => toggleChecked(item)} style={{ marginRight: '0.5em' }}/>
      {prevContext}
    </>
  };

  option.hooks.onClickItem.use(({ item }) => {
    toggleChecked(item);
  });

  option.keyboard.keyboardBindings.space = {
    key: ' ',
    handler: () => {
      if (option.loading.isLoading) {return;}
      toggleChecked(option.radio.state.checkedItem);
    }
  };

  return { state };
});
