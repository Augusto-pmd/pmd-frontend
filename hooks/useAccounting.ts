import useSWR from "swr";
import { fetcher } from "./useSWRConfig";

export interface AccountingReport {
  id: string;
  type: string;
  period: string;
  totalAssets?: number;
  totalLiabilities?: number;
  netWorth?: number;
  createdAt?: string;
}

export function useAccounting() {
  const { data, error, isLoading } = useSWR<AccountingReport[]>("/accounting", fetcher);

  return {
    reports: data || [],
    isLoading,
    error,
  };
}

