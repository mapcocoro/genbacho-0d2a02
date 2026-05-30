import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import ProductSelectModal from '../components/ProductSelectModal';
import type { Estimate, EstimateItem } from '../types';
import type { Product } from '../data/products';
import { units } from '../data/presets';
import {
  addEstimate,
  updateEstimate,
  getEstimateById,
  generateEstimateNumber,
} from '../utils/storage';
import { generateId, getTodayDate, getValidUntilDate } from '../utils/format';

const TAX_RATE = 0.1;

export default function EstimateForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const copyFrom = searchParams.get('copy');
  const isEdit = !!id;

  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [items, setItems] = useState<EstimateItem[]>([]);
  const [note, setNote] = useState('');
  const [validUntil, setValidUntil] = useState(getValidUntilDate());
  const [estimateNumber, setEstimateNumber] = useState('');
  const [createdAt, setCreatedAt] = useState(getTodayDate());
  const [showProductModal, setShowProductModal] = useState(false);

  useEffect(() => {
    if (id) {
      const estimate = getEstimateById(id);
      if (estimate) {
        setCustomerName(estimate.customer.name);
        setCustomerAddress(estimate.customer.address);
        setCustomerPhone(estimate.customer.phone);
        setItems(estimate.items);
        setNote(estimate.note);
        setValidUntil(estimate.validUntil);
        setEstimateNumber(estimate.estimateNumber);
        setCreatedAt(estimate.createdAt);
      }
    } else if (copyFrom) {
      const estimate = getEstimateById(copyFrom);
      if (estimate) {
        setCustomerName(estimate.customer.name);
        setCustomerAddress(estimate.customer.address);
        setCustomerPhone(estimate.customer.phone);
        setItems(estimate.items.map((item) => ({ ...item, id: generateId() })));
        setNote(estimate.note);
      }
    }
  }, [id, copyFrom]);

  // 金額計算
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const tax = Math.floor(subtotal * TAX_RATE);
  const total = subtotal + tax;

  // 手動で空の項目追加
  const addEmptyItem = () => {
    const newItem: EstimateItem = {
      id: generateId(),
      name: '',
      quantity: 1,
      unit: '式',
      unitPrice: 0,
      amount: 0,
    };
    setItems([...items, newItem]);
  };

  // 商品カタログから追加
  const handleProductSelect = (product: Product) => {
    const newItem: EstimateItem = {
      id: generateId(),
      name: product.name,
      quantity: 1,
      unit: product.unit,
      unitPrice: product.unitPrice,
      amount: product.unitPrice,
    };
    setItems([...items, newItem]);
  };

  // 項目更新
  const updateItem = (index: number, field: keyof EstimateItem, value: string | number) => {
    const newItems = [...items];
    const item = { ...newItems[index] };

    if (field === 'quantity' || field === 'unitPrice') {
      const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
      item[field] = numValue;
      // 値引き計算
      const baseAmount = item.quantity * item.unitPrice;
      item.originalAmount = baseAmount;
      if (item.discount) {
        if (item.discount.type === 'percent') {
          item.amount = Math.floor(baseAmount * (1 - item.discount.value / 100));
        } else {
          item.amount = baseAmount - item.discount.value;
        }
      } else {
        item.amount = baseAmount;
      }
    } else if (field === 'name' || field === 'unit') {
      item[field] = value as string;
    }

    newItems[index] = item;
    setItems(newItems);
  };

  // 値引き適用
  const applyDiscount = (index: number, type: 'percent' | 'amount', value: number) => {
    const newItems = [...items];
    const item = { ...newItems[index] };
    const baseAmount = item.quantity * item.unitPrice;
    item.originalAmount = baseAmount;

    if (value === 0) {
      item.discount = undefined;
      item.originalAmount = undefined;
      item.amount = baseAmount;
    } else {
      item.discount = { type, value };
      if (type === 'percent') {
        item.amount = Math.floor(baseAmount * (1 - value / 100));
      } else {
        item.amount = Math.max(0, baseAmount - value);
      }
    }

    newItems[index] = item;
    setItems(newItems);
  };

  // 値引き解除
  const clearDiscount = (index: number) => {
    applyDiscount(index, 'percent', 0);
  };

  // 項目削除
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // 保存
  const handleSave = () => {
    if (!customerName.trim()) {
      alert('顧客名を入力してください');
      return;
    }

    if (items.length === 0) {
      alert('見積もり項目を追加してください');
      return;
    }

    // 新規作成時のみ番号を発番（編集時は既存番号を使用）
    const finalEstimateNumber = isEdit ? estimateNumber : generateEstimateNumber();

    const estimate: Estimate = {
      id: id || generateId(),
      estimateNumber: finalEstimateNumber,
      customer: {
        name: customerName,
        address: customerAddress,
        phone: customerPhone,
      },
      items,
      subtotal,
      tax,
      total,
      note,
      createdAt,
      validUntil,
    };

    if (isEdit) {
      updateEstimate(estimate);
    } else {
      addEstimate(estimate);
    }

    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <Header />

      <div className="max-w-lg mx-auto px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-gray-600 rounded flex items-center justify-center">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 16H6c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h12c.55 0 1 .45 1 1v12c0 .55-.45 1-1 1z"/>
              <path d="M7 9h10v2H7zm0 4h7v2H7z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isEdit ? '見積もり編集' : copyFrom ? '見積もりコピー' : '新規見積もり作成'}
            </h2>
            <p className="text-sm text-gray-500">必要項目を入力してください</p>
          </div>
        </div>

        {/* 顧客情報 */}
        <section className="bg-white rounded border border-gray-200 p-4 mb-3">
          <h3 className="text-sm font-bold text-gray-700 mb-3 pb-2 border-b border-gray-100">顧客情報</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                顧客名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="例: 山田太郎"
                className="w-full border border-gray-300 rounded px-3 py-2.5 text-base focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">住所</label>
              <input
                type="text"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="例: 千葉県印西市..."
                className="w-full border border-gray-300 rounded px-3 py-2.5 text-base focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">電話番号</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9-]/g, '');
                  setCustomerPhone(value);
                }}
                placeholder="例: 09012345678"
                className="w-full border border-gray-300 rounded px-3 py-2.5 text-base focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none"
                inputMode="numeric"
              />
            </div>
          </div>
        </section>

        {/* 見積もり項目 */}
        <section className="bg-white rounded border border-gray-200 p-4 mb-3">
          <h3 className="text-sm font-bold text-gray-700 mb-3 pb-2 border-b border-gray-100">見積もり項目</h3>

          {/* 商品選択ボタン */}
          <button
            onClick={() => setShowProductModal(true)}
            className="w-full bg-gray-800 text-white py-3 rounded font-bold mb-2 hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12zM10 9h8v2h-8V9zm0 3h4v2h-4v-2zm0-6h8v2h-8V6z"/>
            </svg>
            商品カタログから選択
          </button>

          <button
            onClick={addEmptyItem}
            className="w-full bg-gray-100 text-gray-600 py-2.5 rounded font-medium mb-3 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            手動で項目を追加
          </button>

          {items.length === 0 ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 16H6c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h12c.55 0 1 .45 1 1v12c0 .55-.45 1-1 1z"/>
                </svg>
              </div>
              <p className="text-gray-400 text-sm">
                「商品カタログから選択」ボタンで項目を追加
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={item.id} className="bg-gray-50 border border-gray-200 rounded overflow-hidden">
                  {/* ヘッダー */}
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-100 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <span className="bg-gray-600 text-white text-xs font-bold w-5 h-5 rounded flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-600">項目</span>
                    </div>
                    <button
                      onClick={() => removeItem(index)}
                      className="text-red-500 text-sm font-medium px-2 py-1 hover:bg-red-50 rounded transition-colors flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                      </svg>
                      削除
                    </button>
                  </div>

                  {/* コンテンツ */}
                  <div className="p-3 space-y-3">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                      placeholder="項目名"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-base font-medium focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none"
                    />

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">数量</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-2 text-base text-right font-medium focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">単位</label>
                        <select
                          value={item.unit}
                          onChange={(e) => updateItem(index, 'unit', e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-2 text-base font-medium focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none"
                        >
                          {units.map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">単価</label>
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-2 text-base text-right font-medium focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* 値引きボタン */}
                    <div className="flex items-center gap-2 pt-2">
                      <span className="text-xs font-medium text-gray-500">値引き:</span>
                      <div className="flex gap-1 flex-wrap">
                        {[5, 10, 15, 20].map((percent) => (
                          <button
                            key={percent}
                            onClick={() => applyDiscount(index, 'percent', percent)}
                            className={`px-2 py-1 text-xs font-bold rounded transition-colors ${
                              item.discount?.type === 'percent' && item.discount.value === percent
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-200 text-gray-600 hover:bg-red-100 hover:text-red-600'
                            }`}
                          >
                            {percent}%
                          </button>
                        ))}
                        <button
                          onClick={() => {
                            const value = prompt('値引額を入力（円）', '1000');
                            if (value) applyDiscount(index, 'amount', parseInt(value) || 0);
                          }}
                          className={`px-2 py-1 text-xs font-bold rounded transition-colors ${
                            item.discount?.type === 'amount'
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-200 text-gray-600 hover:bg-red-100 hover:text-red-600'
                          }`}
                        >
                          ¥引き
                        </button>
                        {item.discount && (
                          <button
                            onClick={() => clearDiscount(index)}
                            className="px-2 py-1 text-xs font-bold rounded bg-gray-300 text-gray-600 hover:bg-gray-400 transition-colors"
                          >
                            解除
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 金額表示 */}
                    <div className="pt-2 border-t border-gray-200">
                      {item.discount ? (
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-sm text-gray-400">
                            <span>定価</span>
                            <span className="line-through">¥{(item.originalAmount || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-red-500">
                              {item.discount.type === 'percent'
                                ? `${item.discount.value}% OFF`
                                : `¥${item.discount.value.toLocaleString()} 引き`
                              }
                            </span>
                            <span className="text-lg font-bold text-red-600">
                              ¥{item.amount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-500">金額</span>
                          <span className="text-lg font-bold text-gray-900">
                            ¥{item.amount.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 金額サマリー */}
        {items.length > 0 && (
          <section className="bg-gray-50 rounded border border-gray-200 p-4 mb-3">
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>小計</span>
                <span className="font-medium">¥{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>消費税（10%）</span>
                <span className="font-medium">¥{tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                <span className="text-base font-bold text-gray-700">合計（税込）</span>
                <span className="text-xl font-bold text-gray-900">¥{total.toLocaleString()}</span>
              </div>
            </div>
          </section>
        )}

        {/* 有効期限・備考 */}
        <section className="bg-white rounded border border-gray-200 p-4 mb-3">
          <h3 className="text-sm font-bold text-gray-700 mb-3 pb-2 border-b border-gray-100">有効期限・備考</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">有効期限</label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2.5 text-base focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">備考</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="備考・注意事項など"
                rows={3}
                className="w-full border border-gray-300 rounded px-3 py-2.5 text-base resize-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none"
              />
            </div>
          </div>
        </section>
      </div>

      {/* 固定フッター */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 shadow-lg">
        <div className="max-w-lg mx-auto flex gap-2">
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded font-bold hover:bg-gray-200 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-gray-800 text-white py-3 rounded font-bold hover:bg-gray-900 transition-colors"
          >
            保存する
          </button>
        </div>
      </div>

      <ProductSelectModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        onSelect={handleProductSelect}
      />
    </div>
  );
}
