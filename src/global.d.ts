import { MetaMaskInpageProvider } from '@metamask/providers';
import { QueryKey, UseQueryOptions, UseQueryResult } from 'react-query';

// Wallet Connection
declare global {
  interface Window {
    ethereum: MetaMaskInpageProvider;
  }
}

declare global {
  declare type UseMultipleSelectionStateChange<Item> =
    import('chakra-ui-autocomplete').UseMultipleSelectionStateChange<Item>;
}

// declare type UseToastOptions = import('@chakra-ui/react').UseToastOptions;

/* interface ChainProps {
  name: string;
  loaded: boolean;
  count: number;
  order: number;
} */

// React Query
declare module 'react-query' {
  export declare function useQueries<
    TData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey
  >(
    queries: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>[]
  ): UseQueryResult<TData, TError>[];
}
