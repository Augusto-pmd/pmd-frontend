import useSWR from "swr";
import { fetcher } from "./useSWRConfig";

export interface AuditLog {
  id: string;
  userId?: string;
  userName?: string;
  action: string;
  entity?: string;
  entityId?: string;
  details?: string;
  timestamp: string;
}

export function useAuditLogs() {
  const { data, error, isLoading } = useSWR<AuditLog[]>("/audit", fetcher);

  return {
    logs: data || [],
    isLoading,
    error,
  };
}

