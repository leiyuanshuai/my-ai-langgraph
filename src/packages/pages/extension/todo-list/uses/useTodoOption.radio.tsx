import {createTodoOptionInstaller} from "../core/TodoOption.utils";
import {Radio} from "antd";
import {reactive} from "@peryl/react-compose";

declare module '../core/TodoOption.utils' {
  namespace TodoNamespace {
    interface iTodoOption {
      radio: ReturnType<typeof useTodoOptionRadio>;
    }
  }
}

export const useTodoOptionRadio = createTodoOptionInstaller((option) => {

  const state = reactive({
    checkedItem: undefined as undefined | Record<string, any>
  });

  const isChecked = (targetItem: any) => {
    return state.checkedItem?.id === targetItem.id;
  };

  const toggleChecked = (targetItem: any) => {
    state.checkedItem = targetItem;
  };

  const selectPrev = () => {

    if (!option.state.data.length) {
      state.checkedItem = undefined;
      return;
    }

    let index: number = -1;
    if (!state.checkedItem) {
      index = -1;
    } else {
      const selectIndex = option.state.data.findIndex(i => i.id === state.checkedItem!.id);
      if (selectIndex === -1) {
        index = -1;
      } else {
        index = selectIndex - 1;
      }
    }
    if (index < 0 || index === -1) {
      index = option.state.data.length - 1;
    }

    state.checkedItem = option.state.data[index];
  };
  const selectNext = () => {
    if (!option.state.data.length) {
      state.checkedItem = undefined;
      return;
    }

    let index: number = -1;
    if (!state.checkedItem) {
      index = 0;
    } else {
      const selectIndex = option.state.data.findIndex(i => i.id === state.checkedItem!.id);
      if (selectIndex === -1) {
        index = 0;
      } else {
        index = selectIndex + 1;
      }
    }
    if (index === -1 || index > option.state.data.length - 1) {
      index = 0;
    }

    state.checkedItem = option.state.data[index];
  };

  option.renderList.listRenderConfigs.radio = {
    seq: 1,
    key: 'radio',
    render: (prevContext, { item }) => <>
      <Radio checked={isChecked(item)} onClick={() => toggleChecked(item)} style={{ marginRight: '0.5em' }}/>
      {prevContext}
    </>
  };

  option.hooks.onClickItem.use(({ item }) => {
    toggleChecked(item);
  });

  option.keyboard.keyboardBindings.selectPrev = {
    key: 'ARROWUP',
    handler: () => {
      if (option.loading.isLoading) {return;}
      selectPrev();
    }
  };

  option.keyboard.keyboardBindings.selectNext = {
    key: 'ARROWDOWN',
    handler: () => {
      if (option.loading.isLoading) {return;}
      selectNext();
    }
  };

  return { state };
});
