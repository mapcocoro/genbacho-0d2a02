import type { Estimate, CompanyInfo } from '../types';

const ESTIMATES_KEY = 'kensetsu_estimates';
const COMPANY_KEY = 'kensetsu_company';
const SETUP_DONE_KEY = 'kensetsu_setup_done';

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

// 見積番号生成
export const generateEstimateNumber = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return `EST-${year}${month}${day}-${random}`;
};
