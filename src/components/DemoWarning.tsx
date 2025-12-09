import { useState, useEffect } from 'react';

const DEMO_WARNING_KEY = 'kensetsu_demo_warning_shown';

export default function DemoWarning() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const shown = sessionStorage.getItem(DEMO_WARNING_KEY);
    if (!shown) {
      setShow(true);
    }
  }, []);

  const handleClose = () => {
    sessionStorage.setItem(DEMO_WARNING_KEY, 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-3">デモ版のご注意</h2>
          <p className="text-gray-600 mb-6 text-sm leading-relaxed">
            このアプリはデモ版です。
            <br />
            <strong className="text-red-600">実際の顧客情報は入力しないでください。</strong>
            <br />
            データはブラウザのローカルストレージに保存されます。
          </p>
          <button
            onClick={handleClose}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold text-lg active:bg-blue-700"
          >
            了解しました
          </button>
        </div>
      </div>
    </div>
  );
}
