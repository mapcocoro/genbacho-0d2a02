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
    <div className="min-h-screen bg-gray-100 pb-24">
      <DemoWarning />
      <Header />

      <div className="max-w-lg mx-auto px-4 py-4">
        {/* 初回セットアップ案内 */}
        {needsSetup && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
            <p className="text-yellow-800 text-sm">
              会社情報が未設定です。見積書に会社情報を表示するには
              <Link to="/settings" className="text-blue-600 underline font-bold">
                設定画面
              </Link>
              で登録してください。
            </p>
          </div>
        )}

        {/* 検索 */}
        <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="顧客名で検索..."
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base bg-white shadow-sm"
          />
        </div>

        {/* 見積もり一覧 */}
        <h2 className="text-sm font-bold text-gray-600 mb-3">
          見積もり一覧（{filteredEstimates.length}件）
        </h2>

        {filteredEstimates.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm">
            <p className="text-gray-400 mb-4">
              {searchQuery ? '検索結果がありません' : 'まだ見積もりがありません'}
            </p>
            {!searchQuery && (
              <Link
                to="/estimate/new"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-bold"
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
                className="bg-white rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">
                      {estimate.customer.name} 様
                    </h3>
                    <p className="text-sm text-gray-500">{estimate.workType}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">
                      {formatCurrency(estimate.total)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(estimate.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mt-3 pt-3 border-t">
                  <button
                    onClick={() => navigate(`/preview/${estimate.id}`)}
                    className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg text-sm font-medium"
                  >
                    プレビュー
                  </button>
                  <button
                    onClick={() => navigate(`/estimate/${estimate.id}`)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => navigate(`/estimate/new?copy=${estimate.id}`)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium"
                  >
                    コピー
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(estimate.id)}
                    className="px-3 bg-red-50 text-red-600 py-2 rounded-lg text-sm font-medium"
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
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
        <div className="max-w-lg mx-auto">
          <Link
            to="/estimate/new"
            className="block w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg text-center active:bg-blue-700"
          >
            + 新規見積もり作成
          </Link>
        </div>
      </div>

      {/* 削除確認モーダル */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 mb-3">見積もりを削除</h3>
            <p className="text-gray-600 mb-6">
              この見積もりを削除してもよろしいですか？
              <br />
              この操作は取り消せません。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-bold"
              >
                キャンセル
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg font-bold"
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
