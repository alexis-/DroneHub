import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';
import { Logger } from '@/services/logger.service';
import { AppError } from '@/utils/errors/app-error';

const CONTEXT = 'PopupStore';

export const usePopupStore = defineStore('popup', () => {
  const activePopups = ref<string[]>([]);
  const popupProps = reactive<Record<string, any>>({});

  function showPopup(name: string, props?: any) {
    try {
      Logger.debug(CONTEXT, `Showing popup: ${name}`, props);
      
      if (!activePopups.value.includes(name)) {
        activePopups.value.push(name);
        if (props) {
          popupProps[name] = props;
        }
      }
    } catch (error) {
      Logger.error(CONTEXT, `Failed to show popup: ${name}`, error);
      throw new AppError(`Failed to show popup: ${name}`, CONTEXT, error as Error);
    }
  }

  function hidePopup(name: string) {
    try {
      Logger.debug(CONTEXT, `Hiding popup: ${name}`);
      
      const index = activePopups.value.indexOf(name);
      if (index !== -1) {
        activePopups.value.splice(index, 1);
        delete popupProps[name];
      }
    } catch (error) {
      Logger.error(CONTEXT, `Failed to hide popup: ${name}`, error);
      throw new AppError(`Failed to hide popup: ${name}`, CONTEXT, error as Error);
    }
  }

  return {
    activePopups,
    popupProps,
    showPopup,
    hidePopup
  };
});