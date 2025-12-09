import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-blue-600 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-lg mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-xl font-bold">
            見積もりアプリ
          </Link>
          <nav className="flex gap-4">
            <Link
              to="/"
              className={`text-sm ${isActive('/') ? 'font-bold underline' : 'opacity-80'}`}
            >
              一覧
            </Link>
            <Link
              to="/settings"
              className={`text-sm ${isActive('/settings') ? 'font-bold underline' : 'opacity-80'}`}
            >
              設定
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
