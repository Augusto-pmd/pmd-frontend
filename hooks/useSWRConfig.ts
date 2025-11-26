import { SWRConfiguration } from "swr";
import api from "@/lib/api";

// SWR fetcher function
export const fetcher = async (url: string) => {
  const response = await api.get(url);
  return response.data;
};

// Global SWR configuration
export const swrConfig: SWRConfiguration = {
  fetcher,
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  shouldRetryOnError: (error: any) => {
    // Don't retry on 401 or 403
    if (error?.status === 401 || error?.status === 403) {
      return false;
    }
    return true;
  },
  errorRetryCount: 3,
  errorRetryInterval: 1000,
};

