import {createTodoOptionInstaller} from "../core/TodoOption.utils";
import {createEffects} from "@peryl/utils/createEffects";
import {addWindowListener} from "@peryl/utils/addWindowListener";
import {onBeforeUnmount, onMounted} from "@peryl/react-compose";
import {addElementListener} from "@peryl/utils/addElementListener";

declare module '../core/TodoOption.utils' {
  namespace TodoNamespace {
    interface iTodoOption {
      keyboard: ReturnType<typeof useTodoOptionKeyboard>;
    }
  }
}

export const useTodoOptionKeyboard = createTodoOptionInstaller((option) => {

  /*只获取一次，全局绑定的键盘事件*/
  let keyboardBindings: Record<string, iTodoKeyboardConfig | undefined | null> = {};

  const globalWindowEventHandler = (() => {
    const { effects: windowEventEffects } = createEffects();
    const init = () => {
      if (!!windowEventEffects.list.length) {return;}
      // console.log('windowEventEffects init');
      windowEventEffects.clear();
      windowEventEffects.push(addWindowListener('keydown', (e) => {
        const targetTagName = (e.target as any).tagName;
        if (targetTagName === 'INPUT' || targetTagName === 'TEXTAREA') {return;}

        const { ctrlKey, metaKey, shiftKey, altKey, key, keyCode } = e;
        // console.log({ ctrlKey, metaKey, shiftKey, altKey, key, keyCode });
        let hasProcessed = false;
        Object.values(keyboardBindings).forEach(config => {
          if (!config) {return;}
          const shortKey = ctrlKey || metaKey;
          const configKey = String(config.key).toUpperCase();
          const eKey = key.toUpperCase();
          // console.log({ configKey, eKey, keyCode });
          if (configKey !== eKey && configKey !== String(keyCode)) {return;}
          if (!!config.shortKey !== shortKey) {return;}
          if (!!config.shiftKey !== shiftKey) {return;}
          if (!!config.altKey !== altKey) {return;}
          /*console.log('global keyboard', [ctrlKey ? 'ctrl' : null,altKey ? 'alt' : null,shiftKey ? 'shift' : null,key,].filter(Boolean).join(' + '));*/
          config.handler(e);
          hasProcessed = true;
        });

        if (hasProcessed) {
          e.preventDefault();
          e.stopPropagation();
        }
      }));
    };
    const clear = () => {
      // console.log('windowEventEffects clear');
      windowEventEffects.clear();
    };

    return { init, clear };
  })();

  const { effects: elementEventEffects } = createEffects();

  onMounted(() => {
    const el = option.refs.el!;
    /*鼠标进入el的时候监听全局window事件*/
    elementEventEffects.push(addElementListener(el, 'mouseenter', globalWindowEventHandler.init));
    /*鼠标点击的时候再检查一下是否已经监听全局window事件，没有就初始化*/
    elementEventEffects.push(addElementListener(el, 'mousedown', globalWindowEventHandler.init));
    /*鼠标离开el的时候，注销掉全局window事件*/
    elementEventEffects.push(addElementListener(el, 'mouseleave', globalWindowEventHandler.clear));
  });

  onBeforeUnmount(() => {
    globalWindowEventHandler.clear();
    elementEventEffects.clear();
    keyboardBindings = {};
  });

  return { keyboardBindings };

});

export interface iTodoKeyboardConfig {
  key: number | string,
  shortKey?: boolean,
  altKey?: boolean,
  shiftKey?: boolean,
  handler: (e: KeyboardEvent) => void
}
