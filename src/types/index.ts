// 見積もり項目
export interface EstimateItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
  // 値引き情報
  discount?: {
    type: 'percent' | 'amount';  // %引き or 円引き
    value: number;               // 割引率 or 割引額
  };
  originalAmount?: number;       // 値引き前の金額
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
