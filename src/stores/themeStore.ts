import { defineStore } from 'pinia';

const FONT_SIZE_MAP = {
  small: 14,
  medium: 16, // 默认
  large: 18,
};
type FontSizeKey = keyof typeof FONT_SIZE_MAP; 
const DEFAULT_FONT_SIZE_KEY: FontSizeKey = 'medium';

export const useThemeStore = defineStore('theme', {
  state: () => ({
    primaryColor: localStorage.getItem('theme-color') || '#007bff',
    fontSizeKey: (localStorage.getItem('theme-font-size-key') as FontSizeKey) || DEFAULT_FONT_SIZE_KEY,
  }),
  getters: {
    // 获取实际的像素值
    fontSize: (state) => FONT_SIZE_MAP[state.fontSizeKey],
  },
  actions: {
    setPrimaryColor(newColor: string) {
      if (!newColor) return; // el-color-picker 清空时会是 null
      const colorToSet = newColor || '#007bff';
      this.primaryColor = colorToSet;
      localStorage.setItem('theme-color', colorToSet);
    },

    setFontSizeKey(newSizeKey: FontSizeKey) {
      this.fontSizeKey = newSizeKey;
      localStorage.setItem('theme-font-size-key', newSizeKey);
    },
  },
});