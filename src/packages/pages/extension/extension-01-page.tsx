import {TodoList} from "./todo-list/TodoList";
import {createTodoOptionUser} from "./todo-list/uses/createTodoOptionUser";
import {http} from "../../utils/http";
import {designPage} from "@peryl/react-compose";

const useTodoOption = createTodoOptionUser({
  getData: async ({ page, size, data }) => {
    const resp = await http.post<{ list: any[] }>('/demo/list', { page, size, ...data });
    const totalResp = await http.post<{ total: number }>('/demo/list', { onlyCount: true });
    return { list: resp.data.list, total: totalResp.data.total };
  }
});

export default designPage(() => {

  const todoOption = useTodoOption({});

  console.log('todoOption', todoOption);

  return () => (
    <div style={{ padding: '1em' }}>
      <TodoList option={todoOption}/>
    </div>
  );
});
