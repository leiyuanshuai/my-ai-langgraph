import {designComponent, PropType} from '@peryl/react-compose';
import {TodoNamespace} from "./core/TodoOption.utils";

export const TodoList = designComponent({
  props: {
    option: { type: Object as PropType<TodoNamespace.iTodoOption>, required: true }
  },
  setup({ props }) {
    return {
      render: () => (
        <div className="todo-list" style={{ position: 'relative' }} ref={val => props.option.refs.el = val}>
          {props.option.render.renderContent()}
        </div>
      )
    };
  },
});
