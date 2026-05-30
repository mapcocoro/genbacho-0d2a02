import { useState, useMemo } from 'react';
import type { Product, MainCategory, SubCategory } from '../data/products';
import { getProductCatalog } from '../utils/storage';
import {
  PaintIcon,
  ElectricIcon,
  InteriorIcon,
  WaterIcon,
  ExteriorIcon,
  OtherIcon,
  ArrowLeftIcon,
  CloseIcon,
  ArrowRightIcon,
} from './Icons';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (product: Product) => void;
}

type Step = 'main' | 'sub' | 'product';

const getCategoryIcon = (iconName: string, className: string = "w-10 h-10") => {
  const icons: Record<string, React.ReactNode> = {
    paint: <PaintIcon className={className} />,
    electric: <ElectricIcon className={className} />,
    interior: <InteriorIcon className={className} />,
    water: <WaterIcon className={className} />,
    exterior: <ExteriorIcon className={className} />,
    other: <OtherIcon className={className} />,
  };
  return icons[iconName] || <OtherIcon className={className} />;
};

export default function ProductSelectModal({ isOpen, onClose, onSelect }: Props) {
  const [step, setStep] = useState<Step>('main');
  const [selectedMain, setSelectedMain] = useState<MainCategory | null>(null);
  const [selectedSub, setSelectedSub] = useState<SubCategory | null>(null);

  // LocalStorageから商品カタログを取得
  const productCatalog = useMemo(() => getProductCatalog(), [isOpen]);

  const handleClose = () => {
    setStep('main');
    setSelectedMain(null);
    setSelectedSub(null);
    onClose();
  };

  const handleSelectMain = (category: MainCategory) => {
    setSelectedMain(category);
    setStep('sub');
  };

  const handleSelectSub = (subCategory: SubCategory) => {
    setSelectedSub(subCategory);
    setStep('product');
  };

  const handleSelectProduct = (product: Product) => {
    onSelect(product);
    handleClose();
  };

  const handleBack = () => {
    if (step === 'product') {
      setStep('sub');
      setSelectedSub(null);
    } else if (step === 'sub') {
      setStep('main');
      setSelectedMain(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="bg-white rounded-t-lg w-full max-w-lg max-h-[85dvh] flex flex-col shadow-xl">
        {/* ヘッダー */}
        <div className="relative px-4 py-3 border-b border-gray-200">
          {step !== 'main' && (
            <button
              onClick={handleBack}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
            </button>
          )}
          <div className="text-center">
            <h3 className="text-base font-bold text-gray-900">
              {step === 'main' && '工事カテゴリを選択'}
              {step === 'sub' && selectedMain?.name}
              {step === 'product' && selectedSub?.name}
            </h3>
            {step !== 'main' && (
              <p className="text-xs text-gray-500">
                {step === 'sub' && `${selectedMain?.subCategories.length}つのカテゴリ`}
                {step === 'product' && `${selectedSub?.products.length}件の商品`}
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded transition-colors"
          >
            <CloseIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* ステップインジケーター */}
        <div className="flex items-center justify-center gap-2 py-3 bg-gray-50 border-b border-gray-100">
          {[1, 2, 3].map((num) => {
            const isActive = (step === 'main' && num === 1) || (step === 'sub' && num === 2) || (step === 'product' && num === 3);
            const isPast = (step === 'sub' && num === 1) || (step === 'product' && num <= 2);
            return (
              <div key={num} className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isActive
                      ? 'bg-gray-700 text-white'
                      : isPast
                      ? 'bg-gray-300 text-gray-600'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {num}
                </div>
                {num < 3 && (
                  <div className={`w-6 h-0.5 ${isPast || isActive ? 'bg-gray-400' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* コンテンツ */}
        <div className="flex-1 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]">
          {/* 大項目選択 */}
          {step === 'main' && (
            <div className="grid grid-cols-2 gap-3 p-4">
              {productCatalog.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleSelectMain(category)}
                  className="bg-white border border-gray-200 rounded p-4 text-center hover:border-gray-400 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-12 h-12 mx-auto mb-2 rounded bg-gray-100 flex items-center justify-center text-gray-600">
                    {getCategoryIcon(category.icon)}
                  </div>
                  <span className="font-bold text-gray-800 block text-sm">{category.name}</span>
                  <span className="text-xs text-gray-500">
                    {category.subCategories.length}カテゴリ
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* 中項目選択 */}
          {step === 'sub' && selectedMain && (
            <div className="p-3">
              {selectedMain.subCategories.map((sub, index) => (
                <button
                  key={sub.id}
                  onClick={() => handleSelectSub(sub)}
                  className={`w-full text-left p-3 flex justify-between items-center hover:bg-gray-50 transition-colors ${
                    index !== selectedMain.subCategories.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <div>
                    <span className="font-bold text-gray-800 block">{sub.name}</span>
                    <span className="text-xs text-gray-500">
                      {sub.products.length}件
                    </span>
                  </div>
                  <ArrowRightIcon className="w-5 h-5 text-gray-400" />
                </button>
              ))}
            </div>
          )}

          {/* 商品選択 */}
          {step === 'product' && selectedSub && (
            <div className="p-3">
              {selectedSub.products.map((product, index) => (
                <button
                  key={product.id}
                  onClick={() => handleSelectProduct(product)}
                  className={`w-full text-left p-3 hover:bg-gray-50 transition-colors ${
                    index !== selectedSub.products.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-gray-800 block">{product.name}</span>
                      {product.description && (
                        <span className="text-xs text-gray-500 block">{product.description}</span>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-base font-bold text-gray-900">
                        ¥{product.unitPrice.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500 block">
                        /{product.unit}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
