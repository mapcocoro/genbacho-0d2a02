import { useState } from 'react';
import { presetCategories } from '../data/presets';
import type { PresetItem } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: PresetItem) => void;
}

export default function PresetModal({ isOpen, onClose, onSelect }: Props) {
  const [selectedCategory, setSelectedCategory] = useState(presetCategories[0].category);

  if (!isOpen) return null;

  const currentCategory = presetCategories.find((c) => c.category === selectedCategory);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="bg-white rounded-t-2xl w-full max-w-lg max-h-[80dvh] flex flex-col animate-slide-up">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-bold">項目を選択</h3>
          <button
            onClick={onClose}
            className="text-gray-500 text-2xl leading-none p-2"
          >
            ✕
          </button>
        </div>

        {/* カテゴリタブ */}
        <div className="flex overflow-x-auto border-b bg-gray-50">
          {presetCategories.map((cat) => (
            <button
              key={cat.category}
              onClick={() => setSelectedCategory(cat.category)}
              className={`px-4 py-3 text-sm whitespace-nowrap ${
                selectedCategory === cat.category
                  ? 'text-blue-600 border-b-2 border-blue-600 font-bold bg-white'
                  : 'text-gray-600'
              }`}
            >
              {cat.category}
            </button>
          ))}
        </div>

        {/* 項目リスト */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-2 pb-[env(safe-area-inset-bottom)]">
          {currentCategory?.items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                onSelect(item);
                onClose();
              }}
              className="w-full text-left p-4 border-b hover:bg-blue-50 active:bg-blue-100 flex justify-between items-center"
            >
              <span className="font-medium">{item.name}</span>
              <span className="text-gray-500 text-sm">単位: {item.unit}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
