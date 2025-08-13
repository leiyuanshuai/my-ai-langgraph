export const isNumber = (val: any) => typeof val === "string" && /^\d+$/.test(val);

/*
* 这里 initialValue 必须是个代理对象，这样执行handleFullText之后，就会自动对这个代理对象中的属性进行赋值
* 从而自动触发页面更新，就不需要手动处理更新了；
*/
export function createJsonStreamHandler() {
  const setValueByPath = (proxyData: any, path: string, value: any) => {
    const pathList = path.split('.');

    let pathItem = pathList.shift();
    let parentValue = proxyData;

    while (pathItem != null) {

      /*先初始化parentValue*/
      if (isNumber(pathItem)) {
        /*是数字，说明 prevPathItem 是一个数组*/
        if (parentValue == null) {parentValue = [];}
        if (proxyData == null) {proxyData = parentValue;}
      } else {
        /*不是数字，说明 prevPathItem 是对象*/
        if (parentValue == null) {parentValue = {};}
        if (proxyData == null) {proxyData = parentValue;}
      }

      if (!pathList.length) {
        /*是最后一个*/
        parentValue[pathItem] = value;
      } else {
        /*不是最后一个*/
        if (parentValue[pathItem] == null) {
          if (isNumber(pathList[0])) {
            /*下一个是数字*/
            parentValue[pathItem] = [];
          } else {
            /*下一个不是数字*/
            parentValue[pathItem] = {};
          }
        }
        parentValue = parentValue[pathItem];
      }
      pathItem = pathList.shift();
    }
  };
  const handleFullText = (proxyData: any, fullText: string,) => {
    /*只处理最后两条数据*/
    const list = fullText.split('\n');
    list.forEach(item => {
      const separatorIndex = item.indexOf('=');
      if (separatorIndex === -1) {return;}
      const path = item.slice(0, separatorIndex);
      const value = item.slice(separatorIndex + 1);
      setValueByPath(proxyData, path, value);
    });
    return { list: list.slice(-2) };
  };
  return { setValueByPath, handleFullText };
}

export type iJsonStreamHandler = ReturnType<typeof createJsonStreamHandler>
