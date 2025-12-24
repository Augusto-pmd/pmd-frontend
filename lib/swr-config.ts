import { SWRConfiguration } from "swr";
import api from "./api";

export const swrConfig: SWRConfiguration = {
  fetcher: async (url: string) => {
    const res = await api.get(url);
    return res.data;
  },
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  shouldRetryOnError: true,
  errorRetryCount: 3,
};

