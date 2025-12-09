import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import EstimateForm from './pages/EstimateForm';
import Preview from './pages/Preview';
import Settings from './pages/Settings';
import ProductManagement from './pages/ProductManagement';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/estimate/new" element={<EstimateForm />} />
        <Route path="/estimate/:id" element={<EstimateForm />} />
        <Route path="/preview/:id" element={<Preview />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/products" element={<ProductManagement />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
