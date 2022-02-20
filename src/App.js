import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// PAGES
import { Layout } from './pages/Layout';
import { UserNFTs } from './pages/UserNFTs';
import { Collection } from './pages/Collection';
import { NFT } from './pages/NFT';

function App() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <Layout
                loading={loading}
                onLoading={(isLoading) => setLoading(isLoading)}
              />
            }
          >
            <Route
              path=":walletAddress"
              element={
                <UserNFTs
                  loading={loading}
                  onLoading={(isLoading) => setLoading(isLoading)}
                />
              }
            />
            <Route
              path=":chain/collection/:contractAddress"
              element={
                <Collection
                  loading={loading}
                  onLoading={(isLoading) => setLoading(isLoading)}
                />
              }
            />
            <Route
              path=":chain/collection/:contractAddress/nft/:tokenId"
              element={
                <NFT
                  loading={loading}
                  onLoading={(isLoading) => setLoading(isLoading)}
                />
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
