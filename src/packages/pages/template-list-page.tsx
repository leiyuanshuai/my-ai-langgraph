import {CardList} from "../components/CardList";
import {templates} from "../templates";
import {Button} from "antd";
import {useNavigate} from "react-router";

export default function () {

  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', padding: '1em' }}>
      <CardList
        data={templates}
        cover={(item) => (
          <div className="card-list-cover">
            <Button type="primary" onClick={() => navigate(`/pages/template-detail?code=${item.code}`)}>查看模板</Button>
          </div>
        )}
      />
    </div>
  );
}
