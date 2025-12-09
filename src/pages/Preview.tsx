import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import Header from '../components/Header';
import type { Estimate, CompanyInfo } from '../types';
import { getEstimateById, getCompanyInfo } from '../utils/storage';
import { formatDate } from '../utils/format';

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
      // Tailwind CSS v4のoklchカラーをhtml2canvasが解析できないため、
      // 一時的にスタイルを上書きしてから画像を生成
      const element = previewRef.current;

      // すべての要素のスタイルを一時的に強制上書き
      const allElements = element.querySelectorAll('*');
      const originalStyles: { el: Element; bg: string; color: string; border: string }[] = [];

      allElements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        const computed = window.getComputedStyle(htmlEl);
        originalStyles.push({
          el,
          bg: htmlEl.style.backgroundColor,
          color: htmlEl.style.color,
          border: htmlEl.style.borderColor,
        });

        // oklchカラーをRGBに変換（computedStyleはRGBで返される）
        if (computed.backgroundColor && computed.backgroundColor !== 'rgba(0, 0, 0, 0)') {
          htmlEl.style.backgroundColor = computed.backgroundColor;
        }
        if (computed.color) {
          htmlEl.style.color = computed.color;
        }
        if (computed.borderColor) {
          htmlEl.style.borderColor = computed.borderColor;
        }
      });

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      // スタイルを元に戻す
      originalStyles.forEach(({ el, bg, color, border }) => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.backgroundColor = bg;
        htmlEl.style.color = color;
        htmlEl.style.borderColor = border;
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

  // 値引き合計を計算
  const totalDiscount = estimate?.items.reduce((sum, item) => {
    if (item.discount && item.originalAmount) {
      return sum + (item.originalAmount - item.amount);
    }
    return sum;
  }, 0) || 0;

  // 値引き前の合計
  const subtotalBeforeDiscount = estimate?.items.reduce((sum, item) => {
    return sum + (item.originalAmount || item.amount);
  }, 0) || 0;

  if (!estimate) {
    return (
      <div className="min-h-screen bg-slate-100">
        <Header />
        <div className="max-w-lg mx-auto px-4 py-8 text-center">
          <p className="text-slate-500">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <Header />

      <div className="max-w-lg mx-auto px-4 py-4">
        <h2 className="text-base font-bold text-gray-800 mb-3">見積書プレビュー</h2>

        {/* 見積書プレビュー - 伝統的な白黒ビジネス文書スタイル */}
        {/* html2canvasがoklchカラーに対応していないため、インラインスタイルでRGBカラーを指定 */}
        <div
          ref={previewRef}
          className="shadow-lg overflow-hidden"
          style={{
            fontFamily: "'Noto Serif JP', 'Yu Mincho', 'Hiragino Mincho ProN', serif",
            backgroundColor: '#ffffff',
            color: '#000000',
          }}
        >
          {/* ヘッダー */}
          <div className="border-b-2 border-black text-center py-5">
            <h1 className="text-2xl font-semibold tracking-[0.3em] text-black">御 見 積 書</h1>
          </div>

          <div className="p-5">
            {/* 宛名と見積情報 */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="border-b border-black pb-0.5 inline-block">
                  <p className="text-lg font-semibold text-black">
                    {estimate.customer.name} 様
                  </p>
                </div>
                {estimate.customer.address && (
                  <p className="text-xs text-black mt-1">{estimate.customer.address}</p>
                )}
                {estimate.customer.phone && (
                  <p className="text-xs text-black">TEL: {estimate.customer.phone}</p>
                )}
              </div>
              <div className="text-right text-xs text-black">
                <p>No. {estimate.estimateNumber}</p>
                <p className="mt-0.5">{formatDate(estimate.createdAt)}</p>
                <p className="mt-0.5">有効期限: {formatDate(estimate.validUntil)}</p>
              </div>
            </div>

            {/* 合計金額 */}
            <div className="border border-black mb-6">
              <div className="flex items-center">
                <div className="bg-gray-200 px-3 py-2 border-r border-black text-sm font-semibold w-24 text-center">
                  御見積金額
                </div>
                <div className="flex-1 px-3 py-2 text-right">
                  <span className="text-xl font-bold text-black">
                    ¥{estimate.total.toLocaleString()}.-
                  </span>
                  <span className="text-xs text-black ml-1">（税込）</span>
                </div>
              </div>
            </div>

            {/* 明細テーブル */}
            <div className="mb-5">
              <table className="w-full text-xs border-collapse border border-black">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-black px-1 py-1.5 text-center w-6">No</th>
                    <th className="border border-black px-1.5 py-1.5 text-left">摘　要</th>
                    <th className="border border-black px-1 py-1.5 text-right w-12">数量</th>
                    <th className="border border-black px-1 py-1.5 text-center w-8">単位</th>
                    <th className="border border-black px-1 py-1.5 text-right w-16">単価</th>
                    <th className="border border-black px-1 py-1.5 text-right w-20">金額</th>
                  </tr>
                </thead>
                <tbody>
                  {estimate.items.map((item, index) => (
                    <tr key={item.id}>
                      <td className="border border-black px-1 py-1 text-center">
                        {index + 1}
                      </td>
                      <td className="border border-black px-1.5 py-1 whitespace-nowrap overflow-hidden">
                        {item.name}
                      </td>
                      <td className="border border-black px-1 py-1 text-right">
                        {item.quantity}
                      </td>
                      <td className="border border-black px-1 py-1 text-center">
                        {item.unit}
                      </td>
                      <td className="border border-black px-1 py-1 text-right">
                        {item.unitPrice.toLocaleString()}
                      </td>
                      <td className="border border-black px-1 py-1 text-right">
                        {(item.originalAmount || item.amount).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {/* 集計行 */}
                  {totalDiscount > 0 && (
                    <>
                      <tr>
                        <td colSpan={4}></td>
                        <td className="border border-black px-1 py-1 text-right bg-gray-50">定価小計</td>
                        <td className="border border-black px-1 py-1 text-right">
                          ¥{subtotalBeforeDiscount.toLocaleString()}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={4}></td>
                        <td className="border border-black px-1 py-1 text-right bg-gray-50">値引き</td>
                        <td className="border border-black px-1 py-1 text-right">
                          △¥{totalDiscount.toLocaleString()}
                        </td>
                      </tr>
                    </>
                  )}
                  <tr>
                    <td colSpan={4}></td>
                    <td className="border border-black px-1 py-1 text-right bg-gray-50">小　計</td>
                    <td className="border border-black px-1 py-1 text-right">
                      ¥{estimate.subtotal.toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={4}></td>
                    <td className="border border-black px-1 py-1 text-right bg-gray-50">消費税</td>
                    <td className="border border-black px-1 py-1 text-right">
                      ¥{estimate.tax.toLocaleString()}
                    </td>
                  </tr>
                  <tr className="font-semibold">
                    <td colSpan={4}></td>
                    <td className="border border-black px-1 py-1 text-right bg-gray-100">合　計</td>
                    <td className="border border-black px-1 py-1 text-right">
                      ¥{estimate.total.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 備考 */}
            {estimate.note && (
              <div className="mb-5">
                <table className="w-full border-collapse text-xs">
                  <tbody>
                    <tr>
                      <td className="border border-black px-2 py-1 bg-gray-50 w-16 align-top">備考</td>
                      <td className="border border-black px-2 py-1 whitespace-pre-wrap">
                        {estimate.note}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* 会社情報 */}
            {company && (
              <div className="border-t border-black pt-4 mt-5">
                <div className="text-right text-xs">
                  <p className="font-semibold text-sm text-black">{company.name}</p>
                  {company.address && <p className="text-black mt-0.5">{company.address}</p>}
                  {company.phone && <p className="text-black">TEL: {company.phone}</p>}
                  {company.email && <p className="text-black">{company.email}</p>}
                </div>
                {company.bankInfo && (
                  <div className="mt-3">
                    <table className="w-full border-collapse text-xs">
                      <tbody>
                        <tr>
                          <td className="border border-black px-2 py-1 bg-gray-50 w-20 align-top">振込先</td>
                          <td className="border border-black px-2 py-1 whitespace-pre-wrap">
                            {company.bankInfo}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 固定フッター */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 shadow-lg">
        <div className="max-w-lg mx-auto flex gap-2">
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded font-bold hover:bg-gray-200 transition-colors"
          >
            戻る
          </button>
          <button
            onClick={handleSaveImage}
            disabled={saving}
            className="flex-1 bg-gray-800 text-white py-3 rounded font-bold hover:bg-gray-900 transition-colors disabled:opacity-50"
          >
            {saving ? '保存中...' : '画像として保存'}
          </button>
        </div>
      </div>
    </div>
  );
}
