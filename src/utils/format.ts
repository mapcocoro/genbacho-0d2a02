// 金額フォーマット
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(amount);
};

// 日付フォーマット
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

// 30日後の日付を取得
export const getValidUntilDate = (): string => {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().split('T')[0];
};

// 今日の日付を取得
export const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

// UUID生成
export const generateId = (): string => {
  return crypto.randomUUID();
};
