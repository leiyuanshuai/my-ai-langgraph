import {createTodoOptionInstaller} from "../core/TodoOption.utils";
import {HolderOutlined} from '@ant-design/icons';
import {createScrollDraggier} from 'plain-design';

export const useTodoOptionDraggier = createTodoOptionInstaller((option) => {

  const scrollDraggier = createScrollDraggier({
    props: { horizontal: false, },
    dataModel: {
      get value() {return option.state.data;},
      set value(val) {option.state.data = val;}
    },
    getScroll: null,
    getHost: () => option.refs.list!,
    getStrut: () => option.refs.list!,
    getItemElements: () => Array.from(option.refs.list?.querySelectorAll('[todo-list-item]') || []),
  });

  option.renderList.listRenderConfigs.draggier = {
    seq: 99,
    key: 'draggier',
    render: (prevContext, { index }) => <>
      <div todo-list-item={String(index)} style={scrollDraggier.getItemStyles(index)}>
        <span
          style={{ marginRight: '0.5em', cursor: 'move', padding: '0.5em 0', display: 'inline-block' }}
          onMouseDown={e => scrollDraggier.start(e, index)}
        >
          <HolderOutlined/>
        </span>
        {prevContext}
      </div>
    </>
  };

});
