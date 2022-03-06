import { useEffect, useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from 'react-router-dom';

// PAGES
import { Layout } from './pages/Layout';
import { UserNFTs } from './pages/UserNFTs';
import { Collection } from './pages/Collection';
import { NFT } from './pages/NFT';
import { SearchNFTs } from './pages/SearchNFTs';

function App() {
  return (
    <div className="App">
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
    </div>
  );
}

export default App;
