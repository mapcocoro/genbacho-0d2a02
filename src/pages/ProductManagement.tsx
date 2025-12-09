import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import type { MainCategory, SubCategory, Product } from '../data/products';
import { getProductCatalog, saveProductCatalog, resetProductCatalog } from '../utils/storage';
import { ArrowLeftIcon, PlusIcon, TrashIcon, EditIcon } from '../components/Icons';

type EditMode = 'none' | 'addMain' | 'editMain' | 'addSub' | 'editSub' | 'addProduct' | 'editProduct';

export default function ProductManagement() {
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState<MainCategory[]>([]);
  const [selectedMain, setSelectedMain] = useState<MainCategory | null>(null);
  const [selectedSub, setSelectedSub] = useState<SubCategory | null>(null);
  const [editMode, setEditMode] = useState<EditMode>('none');
  const [editTarget, setEditTarget] = useState<MainCategory | SubCategory | Product | null>(null);

  // フォーム状態
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formUnit, setFormUnit] = useState('');
  const [formUnitPrice, setFormUnitPrice] = useState('');

  useEffect(() => {
    setCatalog(getProductCatalog());
  }, []);

  const saveCatalog = (newCatalog: MainCategory[]) => {
    setCatalog(newCatalog);
    saveProductCatalog(newCatalog);
  };

  const resetForm = () => {
    setFormName('');
    setFormDescription('');
    setFormUnit('');
    setFormUnitPrice('');
    setEditMode('none');
    setEditTarget(null);
  };

  // 大項目追加
  const handleAddMain = () => {
    if (!formName.trim()) return;
    const newMain: MainCategory = {
      id: `main_${Date.now()}`,
      name: formName.trim(),
      icon: 'other',
      subCategories: [],
    };
    saveCatalog([...catalog, newMain]);
    resetForm();
  };

  // 大項目編集
  const handleEditMain = () => {
    if (!formName.trim() || !editTarget) return;
    const newCatalog = catalog.map((m) =>
      m.id === editTarget.id ? { ...m, name: formName.trim() } : m
    );
    saveCatalog(newCatalog);
    if (selectedMain?.id === editTarget.id) {
      setSelectedMain({ ...selectedMain, name: formName.trim() });
    }
    resetForm();
  };

  // 大項目削除
  const handleDeleteMain = (mainId: string) => {
    if (!confirm('このカテゴリと全ての商品を削除しますか？')) return;
    const newCatalog = catalog.filter((m) => m.id !== mainId);
    saveCatalog(newCatalog);
    if (selectedMain?.id === mainId) {
      setSelectedMain(null);
      setSelectedSub(null);
    }
  };

  // 中項目追加
  const handleAddSub = () => {
    if (!formName.trim() || !selectedMain) return;
    const newSub: SubCategory = {
      id: `sub_${Date.now()}`,
      name: formName.trim(),
      products: [],
    };
    const newCatalog = catalog.map((m) =>
      m.id === selectedMain.id
        ? { ...m, subCategories: [...m.subCategories, newSub] }
        : m
    );
    saveCatalog(newCatalog);
    setSelectedMain({
      ...selectedMain,
      subCategories: [...selectedMain.subCategories, newSub],
    });
    resetForm();
  };

  // 中項目編集
  const handleEditSub = () => {
    if (!formName.trim() || !editTarget || !selectedMain) return;
    const newSubs = selectedMain.subCategories.map((s) =>
      s.id === editTarget.id ? { ...s, name: formName.trim() } : s
    );
    const newCatalog = catalog.map((m) =>
      m.id === selectedMain.id ? { ...m, subCategories: newSubs } : m
    );
    saveCatalog(newCatalog);
    setSelectedMain({ ...selectedMain, subCategories: newSubs });
    if (selectedSub?.id === editTarget.id) {
      setSelectedSub({ ...selectedSub, name: formName.trim() });
    }
    resetForm();
  };

  // 中項目削除
  const handleDeleteSub = (subId: string) => {
    if (!selectedMain) return;
    if (!confirm('このサブカテゴリと全ての商品を削除しますか？')) return;
    const newSubs = selectedMain.subCategories.filter((s) => s.id !== subId);
    const newCatalog = catalog.map((m) =>
      m.id === selectedMain.id ? { ...m, subCategories: newSubs } : m
    );
    saveCatalog(newCatalog);
    setSelectedMain({ ...selectedMain, subCategories: newSubs });
    if (selectedSub?.id === subId) {
      setSelectedSub(null);
    }
  };

  // 商品追加
  const handleAddProduct = () => {
    if (!formName.trim() || !formUnit.trim() || !formUnitPrice || !selectedMain || !selectedSub) return;
    const newProduct: Product = {
      id: `prod_${Date.now()}`,
      name: formName.trim(),
      description: formDescription.trim() || undefined,
      unit: formUnit.trim(),
      unitPrice: parseInt(formUnitPrice, 10),
    };
    const newSubs = selectedMain.subCategories.map((s) =>
      s.id === selectedSub.id ? { ...s, products: [...s.products, newProduct] } : s
    );
    const newCatalog = catalog.map((m) =>
      m.id === selectedMain.id ? { ...m, subCategories: newSubs } : m
    );
    saveCatalog(newCatalog);
    setSelectedMain({ ...selectedMain, subCategories: newSubs });
    const updatedSub = newSubs.find((s) => s.id === selectedSub.id);
    if (updatedSub) setSelectedSub(updatedSub);
    resetForm();
  };

  // 商品編集
  const handleEditProduct = () => {
    if (!formName.trim() || !formUnit.trim() || !formUnitPrice || !editTarget || !selectedMain || !selectedSub) return;
    const updatedProduct: Product = {
      id: editTarget.id,
      name: formName.trim(),
      description: formDescription.trim() || undefined,
      unit: formUnit.trim(),
      unitPrice: parseInt(formUnitPrice, 10),
    };
    const newProducts = selectedSub.products.map((p) =>
      p.id === editTarget.id ? updatedProduct : p
    );
    const newSubs = selectedMain.subCategories.map((s) =>
      s.id === selectedSub.id ? { ...s, products: newProducts } : s
    );
    const newCatalog = catalog.map((m) =>
      m.id === selectedMain.id ? { ...m, subCategories: newSubs } : m
    );
    saveCatalog(newCatalog);
    setSelectedMain({ ...selectedMain, subCategories: newSubs });
    setSelectedSub({ ...selectedSub, products: newProducts });
    resetForm();
  };

  // 商品削除
  const handleDeleteProduct = (productId: string) => {
    if (!selectedMain || !selectedSub) return;
    if (!confirm('この商品を削除しますか？')) return;
    const newProducts = selectedSub.products.filter((p) => p.id !== productId);
    const newSubs = selectedMain.subCategories.map((s) =>
      s.id === selectedSub.id ? { ...s, products: newProducts } : s
    );
    const newCatalog = catalog.map((m) =>
      m.id === selectedMain.id ? { ...m, subCategories: newSubs } : m
    );
    saveCatalog(newCatalog);
    setSelectedMain({ ...selectedMain, subCategories: newSubs });
    setSelectedSub({ ...selectedSub, products: newProducts });
  };

  // 編集モード開始
  const startEdit = (mode: EditMode, target?: MainCategory | SubCategory | Product) => {
    setEditMode(mode);
    setEditTarget(target || null);
    if (target) {
      setFormName(target.name);
      if ('description' in target) {
        setFormDescription(target.description || '');
      }
      if ('unit' in target) {
        setFormUnit(target.unit);
        setFormUnitPrice(String(target.unitPrice));
      }
    } else {
      resetForm();
      setEditMode(mode);
    }
  };

  // リセット確認
  const handleReset = () => {
    if (confirm('商品データを初期状態にリセットしますか？追加した商品は全て削除されます。')) {
      resetProductCatalog();
      setCatalog(getProductCatalog());
      setSelectedMain(null);
      setSelectedSub(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-8">
      <Header />

      <div className="max-w-lg mx-auto px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate('/settings')}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-lg font-bold text-gray-800">商品マスタ管理</h2>
        </div>

        {/* 編集フォーム */}
        {editMode !== 'none' && (
          <div className="bg-white rounded border border-gray-200 p-4 mb-4">
            <h3 className="font-bold text-gray-800 mb-3">
              {editMode === 'addMain' && '大カテゴリ追加'}
              {editMode === 'editMain' && '大カテゴリ編集'}
              {editMode === 'addSub' && '中カテゴリ追加'}
              {editMode === 'editSub' && '中カテゴリ編集'}
              {editMode === 'addProduct' && '商品追加'}
              {editMode === 'editProduct' && '商品編集'}
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="名前"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-gray-500 focus:border-gray-500 outline-none"
              />
              {(editMode === 'addProduct' || editMode === 'editProduct') && (
                <>
                  <input
                    type="text"
                    placeholder="説明（任意）"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-gray-500 focus:border-gray-500 outline-none"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="単位（例：㎡、式）"
                      value={formUnit}
                      onChange={(e) => setFormUnit(e.target.value)}
                      className="flex-1 px-3 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-gray-500 focus:border-gray-500 outline-none"
                    />
                    <input
                      type="number"
                      placeholder="単価"
                      value={formUnitPrice}
                      onChange={(e) => setFormUnitPrice(e.target.value)}
                      className="flex-1 px-3 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-gray-500 focus:border-gray-500 outline-none"
                    />
                  </div>
                </>
              )}
              <div className="flex gap-2">
                <button
                  onClick={resetForm}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded font-bold hover:bg-gray-200"
                >
                  キャンセル
                </button>
                <button
                  onClick={() => {
                    if (editMode === 'addMain') handleAddMain();
                    else if (editMode === 'editMain') handleEditMain();
                    else if (editMode === 'addSub') handleAddSub();
                    else if (editMode === 'editSub') handleEditSub();
                    else if (editMode === 'addProduct') handleAddProduct();
                    else if (editMode === 'editProduct') handleEditProduct();
                  }}
                  className="flex-1 py-2.5 bg-gray-800 text-white rounded font-bold hover:bg-gray-900"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 階層表示 */}
        <div className="bg-white rounded border border-gray-200 overflow-hidden mb-4">
          {/* 大カテゴリ一覧 */}
          {!selectedMain && (
            <>
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <span className="font-bold text-gray-700">大カテゴリ</span>
                <button
                  onClick={() => startEdit('addMain')}
                  className="flex items-center gap-1 text-gray-700 text-sm font-bold hover:text-gray-900"
                >
                  <PlusIcon className="w-4 h-4" />
                  追加
                </button>
              </div>
              {catalog.map((main) => (
                <div
                  key={main.id}
                  className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-b-0"
                >
                  <button
                    onClick={() => setSelectedMain(main)}
                    className="flex-1 text-left font-medium text-gray-800"
                  >
                    {main.name}
                    <span className="text-xs text-gray-500 ml-2">
                      ({main.subCategories.length}カテゴリ)
                    </span>
                  </button>
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEdit('editMain', main)}
                      className="p-2 text-gray-400 hover:text-gray-700"
                    >
                      <EditIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteMain(main.id)}
                      className="p-2 text-gray-400 hover:text-red-600"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* 中カテゴリ一覧 */}
          {selectedMain && !selectedSub && (
            <>
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <button
                  onClick={() => setSelectedMain(null)}
                  className="text-gray-600 text-sm font-bold flex items-center gap-1 mb-1"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  戻る
                </button>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-700">{selectedMain.name}</span>
                  <button
                    onClick={() => startEdit('addSub')}
                    className="flex items-center gap-1 text-gray-700 text-sm font-bold hover:text-gray-900"
                  >
                    <PlusIcon className="w-4 h-4" />
                    追加
                  </button>
                </div>
              </div>
              {selectedMain.subCategories.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-b-0"
                >
                  <button
                    onClick={() => setSelectedSub(sub)}
                    className="flex-1 text-left font-medium text-gray-800"
                  >
                    {sub.name}
                    <span className="text-xs text-gray-500 ml-2">
                      ({sub.products.length}件)
                    </span>
                  </button>
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEdit('editSub', sub)}
                      className="p-2 text-gray-400 hover:text-gray-700"
                    >
                      <EditIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSub(sub.id)}
                      className="p-2 text-gray-400 hover:text-red-600"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {selectedMain.subCategories.length === 0 && (
                <div className="px-4 py-8 text-center text-gray-400">
                  カテゴリがありません
                </div>
              )}
            </>
          )}

          {/* 商品一覧 */}
          {selectedMain && selectedSub && (
            <>
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <button
                  onClick={() => setSelectedSub(null)}
                  className="text-gray-600 text-sm font-bold flex items-center gap-1 mb-1"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  戻る
                </button>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-700">{selectedSub.name}</span>
                  <button
                    onClick={() => startEdit('addProduct')}
                    className="flex items-center gap-1 text-gray-700 text-sm font-bold hover:text-gray-900"
                  >
                    <PlusIcon className="w-4 h-4" />
                    追加
                  </button>
                </div>
              </div>
              {selectedSub.products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{product.name}</div>
                    {product.description && (
                      <div className="text-xs text-gray-500">{product.description}</div>
                    )}
                    <div className="text-sm text-gray-700 font-bold">
                      ¥{product.unitPrice.toLocaleString()} / {product.unit}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEdit('editProduct', product)}
                      className="p-2 text-gray-400 hover:text-gray-700"
                    >
                      <EditIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-2 text-gray-400 hover:text-red-600"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {selectedSub.products.length === 0 && (
                <div className="px-4 py-8 text-center text-gray-400">
                  商品がありません
                </div>
              )}
            </>
          )}
        </div>

        {/* リセットボタン */}
        <button
          onClick={handleReset}
          className="w-full py-2.5 bg-white text-red-600 rounded border border-red-200 font-bold hover:bg-red-50"
        >
          初期データにリセット
        </button>
      </div>
    </div>
  );
}
