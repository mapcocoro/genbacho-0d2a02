import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import type { CompanyInfo } from '../types';
import { getCompanyInfo, saveCompanyInfo, setSetupDone } from '../utils/storage';

export default function Settings() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [bankInfo, setBankInfo] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const company = getCompanyInfo();
    if (company) {
      setName(company.name);
      setAddress(company.address);
      setPhone(company.phone);
      setEmail(company.email);
      setBankInfo(company.bankInfo);
    }
  }, []);

  const handleSave = () => {
    if (!name.trim()) {
      alert('会社名を入力してください');
      return;
    }

    const company: CompanyInfo = {
      name,
      address,
      phone,
      email,
      bankInfo,
    };

    saveCompanyInfo(company);
    setSetupDone();
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <Header />

      <div className="max-w-lg mx-auto px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-gray-600 rounded flex items-center justify-center">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">設定</h2>
            <p className="text-sm text-gray-500">会社情報・商品マスタ</p>
          </div>
        </div>

        {/* 商品マスタ管理へのリンク */}
        <button
          onClick={() => navigate('/products')}
          className="w-full bg-white rounded border border-gray-200 p-4 mb-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gray-500 rounded flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12zM10 9h8v2h-8V9zm0 3h4v2h-4v-2zm0-6h8v2h-8V6z"/>
              </svg>
            </div>
            <div className="text-left">
              <div className="font-bold text-gray-900">商品マスタ管理</div>
              <div className="text-sm text-gray-500">商品の追加・編集・削除</div>
            </div>
          </div>
          <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
          </svg>
        </button>

        <div className="bg-white rounded border border-gray-200 p-4">
          <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
            会社情報
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                会社名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: 株式会社サンプル建設"
                className="w-full border border-gray-300 rounded px-3 py-2.5 text-base focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                住所
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="例: 東京都渋谷区..."
                className="w-full border border-gray-300 rounded px-3 py-2.5 text-base focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                電話番号
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9-]/g, '');
                  setPhone(value);
                }}
                placeholder="例: 03-1234-5678"
                className="w-full border border-gray-300 rounded px-3 py-2.5 text-base focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none"
                inputMode="numeric"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="例: info@example.com"
                className="w-full border border-gray-300 rounded px-3 py-2.5 text-base focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                振込先情報（任意）
              </label>
              <textarea
                value={bankInfo}
                onChange={(e) => setBankInfo(e.target.value)}
                placeholder="例:&#10;○○銀行 △△支店&#10;普通 1234567&#10;カ）サンプルケンセツ"
                rows={4}
                className="w-full border border-gray-300 rounded px-3 py-2.5 text-base resize-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none"
              />
            </div>
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
            onClick={handleSave}
            className={`flex-1 py-3 rounded font-bold transition-colors ${
              saved
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 text-white hover:bg-gray-900'
            }`}
          >
            {saved ? '保存しました' : '保存する'}
          </button>
        </div>
      </div>
    </div>
  );
}
