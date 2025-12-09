import type { PresetCategory } from '../types';

export const presetCategories: PresetCategory[] = [
  {
    category: '塗装工事',
    items: [
      { name: '外壁塗装', unit: '㎡' },
      { name: '屋根塗装', unit: '㎡' },
      { name: '足場設置', unit: '㎡' },
      { name: '高圧洗浄', unit: '㎡' },
      { name: '下地処理', unit: '式' },
      { name: '養生', unit: '式' },
    ],
  },
  {
    category: '電気工事',
    items: [
      { name: 'コンセント増設', unit: '箇所' },
      { name: '照明器具取付', unit: '台' },
      { name: '分電盤交換', unit: '台' },
      { name: 'エアコン設置', unit: '台' },
      { name: '配線工事', unit: 'm' },
    ],
  },
  {
    category: '内装工事',
    items: [
      { name: 'クロス張替', unit: '㎡' },
      { name: 'フローリング張替', unit: '㎡' },
      { name: '畳交換', unit: '枚' },
      { name: '建具交換', unit: '枚' },
    ],
  },
  {
    category: '水回り',
    items: [
      { name: 'トイレ交換', unit: '台' },
      { name: '洗面台交換', unit: '台' },
      { name: 'キッチン交換', unit: '式' },
      { name: '給湯器交換', unit: '台' },
    ],
  },
  {
    category: '外構',
    items: [
      { name: 'フェンス設置', unit: 'm' },
      { name: 'カーポート設置', unit: '台' },
      { name: 'ブロック塀', unit: 'm' },
      { name: '土間コンクリート', unit: '㎡' },
    ],
  },
  {
    category: 'その他',
    items: [
      { name: '諸経費', unit: '式' },
      { name: '運搬費', unit: '式' },
      { name: '廃材処分費', unit: '式' },
      { name: '出張費', unit: '式' },
    ],
  },
];

export const workTypes = [
  'リフォーム',
  '塗装工事',
  '電気工事',
  '内装工事',
  '水回り工事',
  '外構工事',
  '新築工事',
  '修繕工事',
  'その他',
];

export const units = ['式', 'm', '㎡', '個', '台', '箇所', '枚', '本', 'セット'];
