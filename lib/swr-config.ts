import { SWRConfiguration } from "swr";
import api from "./api";

export const swrConfig: SWRConfiguration = {
  fetcher: (url: string) => {
    return api.get(url).then((res) => res.data);
  },
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  shouldRetryOnError: true,
  errorRetryCount: 3,
};

