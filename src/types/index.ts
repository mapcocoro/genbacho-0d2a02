// 見積もり項目
export interface EstimateItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
}

// 顧客情報
export interface CustomerInfo {
  name: string;
  address: string;
  phone: string;
}

// 見積もり
export interface Estimate {
  id: string;
  estimateNumber: string;
  customer: CustomerInfo;
  workType: string;
  items: EstimateItem[];
  subtotal: number;
  tax: number;
  total: number;
  note: string;
  createdAt: string;
  validUntil: string;
}

// 会社情報
export interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  bankInfo: string;
}

// プリセット項目
export interface PresetItem {
  name: string;
  unit: string;
  unitPrice?: number;
}

export interface PresetCategory {
  category: string;
  items: PresetItem[];
}
