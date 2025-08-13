import {createTodoOptionInstaller} from "../core/TodoOption.utils";
import {reactive} from "@peryl/react-compose";
import {Spin} from "antd";

declare module '../core/TodoOption.utils' {
  namespace TodoNamespace {
    interface iTodoOption {
      loading: ReturnType<typeof useTodoOptionLoading>;
    }
  }
}

export const useTodoOptionLoading = createTodoOptionInstaller((option) => {

  const state = reactive({ isLoading: false });

  option.render.renderConfigs.loading = {
    seq: 99,
    key: 'loading',
    render: () => (
      <>
        {state.isLoading && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}>
            <Spin/>
          </div>
        )}
      </>
    )
  };

  option.hooks.onBeforeLoad.use(() => {state.isLoading = true;});
  option.hooks.onAfterLoad.use(() => {state.isLoading = false;});

  return state;
});
