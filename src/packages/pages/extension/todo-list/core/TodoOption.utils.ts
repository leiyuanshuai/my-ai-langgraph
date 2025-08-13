export namespace TodoNamespace {

  /*可以设置默认值的参数类型，也就是调用createTodoOptionUser时传递的参数对象类型*/
  export interface iTodoOptionDefaultConfig {
    getData: (param: { page: number, size: number, data: any }) => Promise<{ list: any[], total: number }>,
  }

  /*不可以设置默认值的参数类型, 也就是调用 useTodoOption 时需要传递的除了iTodoOptionDefaultConfig之外的参数类型*/
  export interface iTodoOptionCustomConfig {
    param?: any,
  }

  /*调用useTableOption函数时的参数类型*/
  export type iTodoOptionUseConfig = Partial<iTodoOptionDefaultConfig> & iTodoOptionCustomConfig

  /*todoOption.config最终使用的config的对象类型*/
  export type iTodoOptionConfig = iTodoOptionDefaultConfig & iTodoOptionCustomConfig

  export interface iTodoOption {
    config: iTodoOptionConfig;
  }

  export interface iTodoOptionModule {
    (option: iTodoOption): any;
  }

  export const name = "TODO";
}

export function createTodoOptionInstaller<Installer extends ((option: TodoNamespace.iTodoOption) => any)>(installer: Installer): Installer {
  return installer;
}
