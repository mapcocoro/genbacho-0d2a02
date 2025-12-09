import type { Estimate, CompanyInfo } from '../types';
import type { MainCategory } from '../data/products';
import { productCatalog as defaultCatalog } from '../data/products';

const ESTIMATES_KEY = 'kensetsu_estimates';
const COMPANY_KEY = 'kensetsu_company';
const SETUP_DONE_KEY = 'kensetsu_setup_done';
const SEQUENCE_KEY = 'kensetsu_sequence';
const PRODUCTS_KEY = 'kensetsu_products';

// 見積もり保存
export const saveEstimates = (estimates: Estimate[]): void => {
  localStorage.setItem(ESTIMATES_KEY, JSON.stringify(estimates));
};

// 見積もり取得
export const getEstimates = (): Estimate[] => {
  const data = localStorage.getItem(ESTIMATES_KEY);
  return data ? JSON.parse(data) : [];
};

// 見積もり追加
export const addEstimate = (estimate: Estimate): void => {
  const estimates = getEstimates();
  estimates.unshift(estimate);
  saveEstimates(estimates);
};

// 見積もり更新
export const updateEstimate = (estimate: Estimate): void => {
  const estimates = getEstimates();
  const index = estimates.findIndex((e) => e.id === estimate.id);
  if (index !== -1) {
    estimates[index] = estimate;
    saveEstimates(estimates);
  }
};

// 見積もり削除
export const deleteEstimate = (id: string): void => {
  const estimates = getEstimates();
  const filtered = estimates.filter((e) => e.id !== id);
  saveEstimates(filtered);
};

// 見積もり取得（ID指定）
export const getEstimateById = (id: string): Estimate | null => {
  const estimates = getEstimates();
  return estimates.find((e) => e.id === id) || null;
};

// 会社情報保存
export const saveCompanyInfo = (company: CompanyInfo): void => {
  localStorage.setItem(COMPANY_KEY, JSON.stringify(company));
};

// 会社情報取得
export const getCompanyInfo = (): CompanyInfo | null => {
  const data = localStorage.getItem(COMPANY_KEY);
  return data ? JSON.parse(data) : null;
};

// セットアップ完了フラグ
export const isSetupDone = (): boolean => {
  return localStorage.getItem(SETUP_DONE_KEY) === 'true';
};

export const setSetupDone = (): void => {
  localStorage.setItem(SETUP_DONE_KEY, 'true');
};

// 連番を取得・更新
export const getNextSequence = (): number => {
  const current = localStorage.getItem(SEQUENCE_KEY);
  const next = current ? parseInt(current, 10) + 1 : 1;
  localStorage.setItem(SEQUENCE_KEY, String(next));
  return next;
};

// 現在の連番を取得（更新なし）
export const getCurrentSequence = (): number => {
  const current = localStorage.getItem(SEQUENCE_KEY);
  return current ? parseInt(current, 10) : 0;
};

// 見積番号生成（連番ベース）
export const generateEstimateNumber = (): string => {
  const seq = getNextSequence();
  return `EST-${String(seq).padStart(4, '0')}`;
};

// 請求書番号生成（見積もり番号から）
export const generateInvoiceNumber = (estimateNumber: string): string => {
  // EST-0001 → INV-0001
  return estimateNumber.replace('EST-', 'INV-');
};

// 商品カタログ保存
export const saveProductCatalog = (catalog: MainCategory[]): void => {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(catalog));
};

// 商品カタログ取得（保存されていなければデフォルトを返す）
export const getProductCatalog = (): MainCategory[] => {
  const data = localStorage.getItem(PRODUCTS_KEY);
  if (data) {
    return JSON.parse(data);
  }
  // 初回はデフォルトのカタログを保存して返す
  saveProductCatalog(defaultCatalog);
  return defaultCatalog;
};

// 商品カタログをデフォルトにリセット
export const resetProductCatalog = (): void => {
  saveProductCatalog(defaultCatalog);
};
