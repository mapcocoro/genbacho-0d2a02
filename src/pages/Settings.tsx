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
    <div className="min-h-screen bg-gray-100 pb-24">
      <Header />

      <div className="max-w-lg mx-auto px-4 py-4">
        <h2 className="text-lg font-bold text-gray-800 mb-4">会社情報設定</h2>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500 mb-4">
            ここで設定した情報が見積書に表示されます。
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                会社名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: 株式会社サンプル建設"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                住所
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="例: 東京都渋谷区..."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                電話番号
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="例: 03-1234-5678"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="例: info@example.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                振込先情報（任意）
              </label>
              <textarea
                value={bankInfo}
                onChange={(e) => setBankInfo(e.target.value)}
                placeholder="例:&#10;○○銀行 △△支店&#10;普通 1234567&#10;カ）サンプルケンセツ"
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base resize-none"
              />
            </div>
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
            onClick={handleSave}
            className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold text-lg active:bg-blue-700"
          >
            {saved ? '保存しました!' : '保存する'}
          </button>
        </div>
      </div>
    </div>
  );
}
