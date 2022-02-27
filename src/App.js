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
  const [loading, setLoading] = useState(false);

  const [testnets, setTestnets] = useState(false);

  //let navigate = useNavigate();
  //let location = useLocation();

  return (
    <div className="App ">
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <Layout
                loading={loading}
                onLoading={(isLoading) => setLoading(isLoading)}
                testnets={testnets}
                onSetTestnets={(testnets) => setTestnets(testnets)}
              />
            }
          >
            <Route
              path=":walletAddress"
              element={
                <UserNFTs
                  loading={loading}
                  testnets={testnets}
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
            <Route
              path="search/:q"
              element={
                <SearchNFTs
                  loading={loading}
                  onLoading={(isLoading) => setLoading(isLoading)}
                />
              }
            ></Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
