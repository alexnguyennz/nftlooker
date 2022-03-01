import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

// React Router
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';

// React Redux
import { Provider } from 'react-redux';
import store from './state/store';

// React Query
import { QueryClient, QueryClientProvider } from 'react-query';

// Chakra UI
import { ChakraProvider } from '@chakra-ui/react';

const queryClient = new QueryClient();

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
