import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import Header from '../components/Header';
import type { Estimate, CompanyInfo } from '../types';
import { getEstimateById, getCompanyInfo } from '../utils/storage';
import { formatDate, formatCurrency } from '../utils/format';

export default function Preview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [saving, setSaving] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      const data = getEstimateById(id);
      if (data) {
        setEstimate(data);
      } else {
        navigate('/');
      }
    }
    setCompany(getCompanyInfo());
  }, [id, navigate]);

  const handleSaveImage = async () => {
    if (!previewRef.current) return;

    setSaving(true);
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const link = document.createElement('a');
      link.download = `見積書_${estimate?.customer.name}_${estimate?.estimateNumber}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('画像保存エラー:', error);
      alert('画像の保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  if (!estimate) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="max-w-lg mx-auto px-4 py-8 text-center">
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      <Header />

      <div className="max-w-lg mx-auto px-4 py-4">
        <h2 className="text-lg font-bold text-gray-800 mb-4">見積書プレビュー</h2>

        {/* 見積書プレビュー */}
        <div
          ref={previewRef}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {/* ヘッダー */}
          <div className="bg-blue-600 text-white text-center py-6">
            <h1 className="text-2xl font-bold tracking-wider">御 見 積 書</h1>
          </div>

          <div className="p-6">
            {/* 宛名と見積情報 */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-xl font-bold border-b-2 border-gray-800 pb-1 inline-block">
                  {estimate.customer.name} 様
                </p>
                {estimate.customer.address && (
                  <p className="text-sm text-gray-600 mt-2">{estimate.customer.address}</p>
                )}
              </div>
              <div className="text-right text-sm">
                <p>見積番号: {estimate.estimateNumber}</p>
                <p>見積日: {formatDate(estimate.createdAt)}</p>
                <p>有効期限: {formatDate(estimate.validUntil)}</p>
              </div>
            </div>

            {/* 合計金額 */}
            <div className="bg-blue-50 border-2 border-blue-600 rounded-lg p-4 mb-6 text-center">
              <p className="text-sm text-gray-600 mb-1">御見積金額（税込）</p>
              <p className="text-3xl font-bold text-blue-600">
                {formatCurrency(estimate.total)}
              </p>
            </div>

            {/* 工事種別 */}
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                工事種別: <span className="font-medium">{estimate.workType}</span>
              </p>
            </div>

            {/* 明細テーブル */}
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-2 py-2 text-center w-10">No</th>
                    <th className="border border-gray-300 px-2 py-2 text-left">項目名</th>
                    <th className="border border-gray-300 px-2 py-2 text-right w-16">数量</th>
                    <th className="border border-gray-300 px-2 py-2 text-center w-12">単位</th>
                    <th className="border border-gray-300 px-2 py-2 text-right w-20">単価</th>
                    <th className="border border-gray-300 px-2 py-2 text-right w-24">金額</th>
                  </tr>
                </thead>
                <tbody>
                  {estimate.items.map((item, index) => (
                    <tr key={item.id}>
                      <td className="border border-gray-300 px-2 py-2 text-center">
                        {index + 1}
                      </td>
                      <td className="border border-gray-300 px-2 py-2">{item.name}</td>
                      <td className="border border-gray-300 px-2 py-2 text-right">
                        {item.quantity.toLocaleString()}
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-center">
                        {item.unit}
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-right">
                        ¥{item.unitPrice.toLocaleString()}
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-right">
                        ¥{item.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 小計・税・合計 */}
            <div className="flex justify-end mb-6">
              <div className="w-64">
                <div className="flex justify-between py-2 border-b">
                  <span>小計</span>
                  <span>¥{estimate.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>消費税（10%）</span>
                  <span>¥{estimate.tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 font-bold text-lg">
                  <span>合計（税込）</span>
                  <span>¥{estimate.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* 備考 */}
            {estimate.note && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-600 mb-2">備考</h3>
                <div className="bg-gray-50 p-3 rounded-lg text-sm whitespace-pre-wrap">
                  {estimate.note}
                </div>
              </div>
            )}

            {/* 会社情報 */}
            {company && (
              <div className="border-t pt-6 mt-6">
                <div className="text-right">
                  <p className="font-bold text-lg">{company.name}</p>
                  {company.address && <p className="text-sm text-gray-600">{company.address}</p>}
                  {company.phone && <p className="text-sm text-gray-600">TEL: {company.phone}</p>}
                  {company.email && (
                    <p className="text-sm text-gray-600">Email: {company.email}</p>
                  )}
                  {company.bankInfo && (
                    <div className="mt-3 text-left bg-gray-50 p-3 rounded text-sm">
                      <p className="font-medium mb-1">振込先</p>
                      <p className="whitespace-pre-wrap">{company.bankInfo}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 固定フッター */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
        <div className="max-w-lg mx-auto flex gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-xl font-bold text-lg"
          >
            戻る
          </button>
          <button
            onClick={handleSaveImage}
            disabled={saving}
            className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold text-lg active:bg-blue-700 disabled:opacity-50"
          >
            {saving ? '保存中...' : '画像として保存'}
          </button>
        </div>
      </div>
    </div>
  );
}
