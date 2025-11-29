export type TransactionType = "EXPENSE" | "INCOME";

export type Category =
  | "FOOD" // 食費
  | "DAILY" // 日用品
  | "TRANSPORT" // 交通費
  | "UTILITIES" // 水道光熱費
  | "RENT" // 家賃
  | "ENTERTAINMENT" // 交際費・娯楽
  | "MEDICAL" // 医療費
  | "CLOTHING" // 衣服
  | "EDUCATION" // 教育・教養
  | "INSURANCE" // 保険
  | "SUBSCRIPTION" // サブスクリプション
  | "OTHER" // その他
  | "SALARY" // 給与
  | "BONUS" // ボーナス
  | "INVESTMENT"; // 投資収益

export interface Transaction {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  amount: number;
  type: TransactionType;
  category: Category;
  description: string;
  merchant?: string; // 店舗名・サービス名
  source: "MANUAL" | "CSV" | "API";
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
}

export const CATEGORY_LABELS: Record<Category, string> = {
  FOOD: "食費",
  DAILY: "日用品",
  TRANSPORT: "交通費",
  UTILITIES: "水道光熱費",
  RENT: "家賃",
  ENTERTAINMENT: "交際費・娯楽",
  MEDICAL: "医療費",
  CLOTHING: "衣服",
  EDUCATION: "教育・教養",
  INSURANCE: "保険",
  SUBSCRIPTION: "サブスク",
  OTHER: "その他",
  SALARY: "給与",
  BONUS: "ボーナス",
  INVESTMENT: "投資収益",
};
