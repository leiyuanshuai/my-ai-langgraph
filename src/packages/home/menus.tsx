import {MenuProps} from "antd";
import {MailOutlined, PieChartOutlined} from "@ant-design/icons";
import {router} from "./routes";
import React from "react";

type MenuItem = Required<MenuProps>['items'][number];

export const menus: MenuItem[] = [
   {
    key: '/pages/langgraph-pages',
    label: 'LangGraph报销流程',
    icon: <MailOutlined/>,
    children: [
      { key: '/pages/langgraph-pages/approve/list', label: '报销列表' },
      { key: '/pages/langgraph-pages/messages/list', label: '消息列表' },
      { key: '/pages/langgraph-pages/edit-state/edit-state', label: '聊天会话' },
    ]
  },
  // {
  //   key: '/pages/extension',
  //   label: '扩展模块',
  //   icon: <MailOutlined/>,
  //   children: [
  //     { key: '/pages/extension/extension-01', label: 'TodoList' }
  //   ]
  // },
  { key: '/pages/resume-list', icon: <PieChartOutlined/>, label: '简历列表', },
  // { key: '/pages/template-list', icon: <PieChartOutlined/>, label: '模板列表', },
  { key: '/', icon: <PieChartOutlined/>, label: '系统首页', },
  // { key: '/pages/deep1/deep2/index', icon: <PieChartOutlined/>, label: '深层页面', },
  // {
  //   key: '/pages/first-page',
  //   label: '一级菜单',
  //   icon: <MailOutlined/>,
  //   children: [
  //     { key: '/pages/resume-list-1', label: '菜单 1.1' },
  //     { key: '/pages/resume-list-2', label: '菜单 1.2' },
  //     { key: '/pages/resume-list-3', label: '菜单 1.3' },
  //     { key: '/pages/resume-list-4', label: '菜单 1.4' },
  //   ],
  // },
];

function handleMenuClick(_menus: MenuItem | MenuItem[]) {
  const menus = Array.isArray(_menus) ? _menus : [_menus];
  menus.forEach((item: any) => {
    if (!!item.children) {
      /*如果有children，就只处理children的菜单点击动作*/
      handleMenuClick(item.children);
    } else {
      /*如果没有children，就处理当前菜单的点击动作*/
      if (!item.onClick) {
        item.onClick = () => {
          // console.log('click menu', item);
          router.navigate(String(item.key));
        };
      }
    }
  });
}

handleMenuClick(menus as any);
