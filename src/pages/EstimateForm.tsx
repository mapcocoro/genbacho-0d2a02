import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import PresetModal from '../components/PresetModal';
import type { Estimate, EstimateItem, PresetItem } from '../types';
import { workTypes, units } from '../data/presets';
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
  const [workType, setWorkType] = useState(workTypes[0]);
  const [items, setItems] = useState<EstimateItem[]>([]);
  const [note, setNote] = useState('');
  const [validUntil, setValidUntil] = useState(getValidUntilDate());
  const [estimateNumber, setEstimateNumber] = useState(generateEstimateNumber());
  const [createdAt, setCreatedAt] = useState(getTodayDate());
  const [showPresetModal, setShowPresetModal] = useState(false);

  useEffect(() => {
    if (id) {
      const estimate = getEstimateById(id);
      if (estimate) {
        setCustomerName(estimate.customer.name);
        setCustomerAddress(estimate.customer.address);
        setCustomerPhone(estimate.customer.phone);
        setWorkType(estimate.workType);
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
        setWorkType(estimate.workType);
        setItems(estimate.items.map((item) => ({ ...item, id: generateId() })));
        setNote(estimate.note);
      }
    }
  }, [id, copyFrom]);

  // 金額計算
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const tax = Math.floor(subtotal * TAX_RATE);
  const total = subtotal + tax;

  // 項目追加
  const addItem = () => {
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

  // プリセットから追加
  const handlePresetSelect = (preset: PresetItem) => {
    const newItem: EstimateItem = {
      id: generateId(),
      name: preset.name,
      quantity: 1,
      unit: preset.unit,
      unitPrice: preset.unitPrice || 0,
      amount: preset.unitPrice || 0,
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
      item.amount = item.quantity * item.unitPrice;
    } else if (field === 'name' || field === 'unit') {
      item[field] = value as string;
    }

    newItems[index] = item;
    setItems(newItems);
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

    const estimate: Estimate = {
      id: id || generateId(),
      estimateNumber,
      customer: {
        name: customerName,
        address: customerAddress,
        phone: customerPhone,
      },
      workType,
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
    <div className="min-h-screen bg-gray-100 pb-24">
      <Header />

      <div className="max-w-lg mx-auto px-4 py-4">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          {isEdit ? '見積もり編集' : copyFrom ? '見積もりコピー' : '新規見積もり作成'}
        </h2>

        {/* 顧客情報 */}
        <section className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <h3 className="text-sm font-bold text-gray-600 mb-3">顧客情報</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                顧客名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="例: 山田太郎"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">住所</label>
              <input
                type="text"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="例: 東京都渋谷区..."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">電話番号</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="例: 090-1234-5678"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base"
              />
            </div>
          </div>
        </section>

        {/* 工事種別 */}
        <section className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <h3 className="text-sm font-bold text-gray-600 mb-3">工事種別</h3>
          <select
            value={workType}
            onChange={(e) => setWorkType(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base bg-white"
          >
            {workTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </section>

        {/* 見積もり項目 */}
        <section className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-600">見積もり項目</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPresetModal(true)}
                className="text-sm bg-gray-100 text-gray-700 px-3 py-2 rounded-lg font-medium"
              >
                プリセット
              </button>
              <button
                onClick={addItem}
                className="text-sm bg-blue-600 text-white px-3 py-2 rounded-lg font-medium"
              >
                + 追加
              </button>
            </div>
          </div>

          {items.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              項目がありません。
              <br />
              「プリセット」または「+ 追加」で項目を追加してください
            </p>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs text-gray-400">#{index + 1}</span>
                    <button
                      onClick={() => removeItem(index)}
                      className="text-red-500 text-sm px-2 py-1"
                    >
                      削除
                    </button>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                      placeholder="項目名"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-base"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">数量</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-base text-right"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">単位</label>
                        <select
                          value={item.unit}
                          onChange={(e) => updateItem(index, 'unit', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-base bg-white"
                        >
                          {units.map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">単価</label>
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-base text-right"
                        />
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      金額: <span className="font-bold text-lg text-gray-800">¥{item.amount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 金額サマリー */}
        {items.length > 0 && (
          <section className="bg-blue-50 rounded-xl p-4 mb-4">
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>小計</span>
                <span>¥{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>消費税（10%）</span>
                <span>¥{tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-blue-600 pt-2 border-t border-blue-200">
                <span>合計（税込）</span>
                <span>¥{total.toLocaleString()}</span>
              </div>
            </div>
          </section>
        )}

        {/* 有効期限・備考 */}
        <section className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">有効期限</label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">備考</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="備考・注意事項など"
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base resize-none"
              />
            </div>
          </div>
        </section>
      </div>

      {/* 固定フッター */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
        <div className="max-w-lg mx-auto flex gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-xl font-bold text-lg"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold text-lg active:bg-blue-700"
          >
            保存する
          </button>
        </div>
      </div>

      <PresetModal
        isOpen={showPresetModal}
        onClose={() => setShowPresetModal(false)}
        onSelect={handlePresetSelect}
      />
    </div>
  );
}
