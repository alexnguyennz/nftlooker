import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

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

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider>
          <App />
        </ChakraProvider>
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
