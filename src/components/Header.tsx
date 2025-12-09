import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-gray-800 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-lg mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 16H6c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h12c.55 0 1 .45 1 1v12c0 .55-.45 1-1 1z"/>
                <path d="M7 9h10v2H7zm0 4h7v2H7z"/>
              </svg>
            </div>
            <span className="text-base font-bold">見積もりPro</span>
          </Link>
          <nav className="flex gap-1">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'bg-gray-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              一覧
            </Link>
            <Link
              to="/settings"
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                isActive('/settings') || location.pathname === '/products'
                  ? 'bg-gray-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              設定
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
