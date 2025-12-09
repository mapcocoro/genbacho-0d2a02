import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import DemoWarning from '../components/DemoWarning';
import type { Estimate } from '../types';
import { getEstimates, deleteEstimate, isSetupDone } from '../utils/storage';
import { formatDate, formatCurrency } from '../utils/format';

export default function Home() {
  const navigate = useNavigate();
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadEstimates();
  }, []);

  const loadEstimates = () => {
    const data = getEstimates();
    setEstimates(data);
  };

  const handleDelete = (id: string) => {
    deleteEstimate(id);
    loadEstimates();
    setShowDeleteConfirm(null);
  };

  const filteredEstimates = estimates.filter((e) =>
    e.customer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const needsSetup = !isSetupDone();

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <DemoWarning />
      <Header />

      <div className="max-w-lg mx-auto px-4 py-4">
        {/* 初回セットアップ案内 */}
        {needsSetup && (
          <div className="bg-amber-50 border border-amber-300 rounded p-3 mb-4">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              <p className="text-amber-800 text-sm">
                会社情報が未設定です。
                <Link to="/settings" className="text-blue-700 underline font-bold ml-1">
                  設定画面
                </Link>
                で登録してください。
              </p>
            </div>
          </div>
        )}

        {/* 検索 */}
        <div className="mb-4">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="顧客名で検索..."
              className="w-full border border-gray-300 rounded pl-10 pr-4 py-2.5 text-base bg-white focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none"
            />
          </div>
        </div>

        {/* 見積もり一覧 */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-600">
            見積もり一覧
          </h2>
          <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-0.5 rounded">
            {filteredEstimates.length}件
          </span>
        </div>

        {filteredEstimates.length === 0 ? (
          <div className="bg-white rounded border border-gray-200 p-8 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 16H6c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h12c.55 0 1 .45 1 1v12c0 .55-.45 1-1 1z"/>
              </svg>
            </div>
            <p className="text-gray-500 mb-4">
              {searchQuery ? '検索結果がありません' : 'まだ見積もりがありません'}
            </p>
            {!searchQuery && (
              <Link
                to="/estimate/new"
                className="inline-block bg-gray-700 text-white px-6 py-2.5 rounded font-bold hover:bg-gray-800 transition-colors"
              >
                新規作成する
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEstimates.map((estimate) => (
              <div
                key={estimate.id}
                className="bg-white rounded border border-gray-200 p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">{estimate.estimateNumber}</p>
                    <h3 className="font-bold text-gray-900 text-base">
                      {estimate.customer.name} 様
                    </h3>
                    <p className="text-sm text-gray-500">{estimate.items.length}項目</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(estimate.total)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(estimate.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => navigate(`/preview/${estimate.id}`)}
                    className="flex-1 bg-gray-700 text-white py-2 rounded text-sm font-bold hover:bg-gray-800 transition-colors"
                  >
                    プレビュー
                  </button>
                  <button
                    onClick={() => navigate(`/estimate/${estimate.id}`)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 rounded text-sm font-bold hover:bg-gray-200 transition-colors"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => navigate(`/estimate/new?copy=${estimate.id}`)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 rounded text-sm font-bold hover:bg-gray-200 transition-colors"
                  >
                    コピー
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(estimate.id)}
                    className="px-3 bg-red-50 text-red-600 py-2 rounded text-sm font-bold hover:bg-red-100 transition-colors"
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 新規作成ボタン（固定） */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 shadow-lg">
        <div className="max-w-lg mx-auto">
          <Link
            to="/estimate/new"
            className="flex items-center justify-center gap-2 w-full bg-gray-800 text-white py-3 rounded font-bold text-base hover:bg-gray-900 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            新規見積もり作成
          </Link>
        </div>
      </div>

      {/* 削除確認モーダル */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded p-5 max-w-sm w-full shadow-xl">
            <div className="w-12 h-12 bg-red-100 rounded flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">見積もりを削除</h3>
            <p className="text-gray-600 mb-5 text-center text-sm">
              この見積もりを削除してもよろしいですか？
              <br />
              <span className="text-red-600">この操作は取り消せません</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded font-bold hover:bg-gray-200 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="flex-1 bg-red-600 text-white py-2.5 rounded font-bold hover:bg-red-700 transition-colors"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
