import {Outlet, useLocation} from "react-router";
import React, {useState} from "react";
import {Button, Menu} from "antd";
import './AppHome.scss';
import {menus} from "./menus";
import {MenuFoldOutlined, MenuUnfoldOutlined} from '@ant-design/icons';

export const AppHome = () => {

  const location = useLocation();

  const [collapse, _setCollapse] = useState(() => {
    const str = localStorage.getItem('collapse');
    return str == null ? false : JSON.parse(str);
  });
  const setCollapse = (flag: boolean) => {
    localStorage.setItem('collapse', JSON.stringify(flag));
    _setCollapse(flag);
  };

  return (
    <div className="app-home" data-collapse={String(collapse)}>
      <div className="app-home-menus">
        <div className="app-home-menus-header">
          {!collapse && <h3>雷超</h3>}
          <Button onClick={() => {setCollapse(!collapse);}}>
            {collapse ? <MenuFoldOutlined/> : <MenuUnfoldOutlined/>}
          </Button>
        </div>
        <Menu
          selectedKeys={[location.pathname]}
          mode="inline"
          items={menus}
          inlineCollapsed={collapse}
        />
      </div>
      <div className="app-home-body">
        <Outlet/>
      </div>
    </div>
  );
};
