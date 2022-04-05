import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

// React Router
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// React Redux
import { Provider } from 'react-redux';
import store from './state/store';

// React Query
import { QueryClient, QueryClientProvider } from 'react-query';

// Chakra UI
import { ChakraProvider } from '@chakra-ui/react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: Infinity, // 60000, keep NFTs loaded in cache for at least a minute so user can navigate back to previous pages without refetching everything unless forced
    },
  },
});

// PAGES
import Layout from './pages/Layout';
import UserNFTs from './pages/UserNFTs';
import { Collection } from './pages/Collection';
import NFT from './pages/NFT';
import { SearchNFTs } from './pages/SearchNFTs';

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route path=":walletAddress" element={<UserNFTs />} />
                <Route
                  path=":chain/collection/:contractAddress"
                  element={<Collection />}
                />
                <Route
                  path=":chain/collection/:contractAddress/nft/:tokenId"
                  element={<NFT />}
                />
                <Route path="search/:q" element={<SearchNFTs />}></Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </ChakraProvider>
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
