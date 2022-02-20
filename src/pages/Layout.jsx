import { useEffect, useState } from 'react';

// React Router
import { Outlet, Link, useNavigate, useParams } from 'react-router-dom';

// Ethers
import { ethers } from 'ethers';

// MUI
import { TextField } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import {
  Ethereum,
  Polygon,
  Binance,
  Avalanche,
  Fantom,
} from '../components/ChainIcons';

import ellipseAddress from '../utils/ellipseAddress';

// testing address
const WALLET_ADDRESS = '0x2aea6d8220b61950f30674606faaa01c23465299';

export function Layout(props) {
  const [address, setAddress] = useState(WALLET_ADDRESS);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);

  // initialise Ethers
  const { ethereum } = window;
  let provider;

  let navigate = useNavigate();
  let params = useParams();

  // set the input field to the walletAddress param
  useEffect(() => {
    if (params.walletAddress) {
      setAddress(params.walletAddress);
    }
  }, []);

  async function connectWallet() {
    if (ethereum) {
      try {
        provider = new ethers.providers.Web3Provider(ethereum);
        const account = await provider.send('eth_requestAccounts', []);

        setWalletAddress(account[0]);
        setWalletConnected(true);

        // manually get data for NFTs
        setAddress(account[0]);

        navigate(`/${account[0]}`);

        console.log('Connected wallet:', account[0]);
      } catch (err) {
        console.log(err);
      }
    }
  }

  async function disconnectWallet() {
    try {
      // reset wallet connection
      provider = null;
      setWalletAddress('');
      setWalletConnected(false);

      // reset app state
      setAddress('');
      navigate('/');

      console.log('Disconnected wallet.');
    } catch (err) {
      console.error(err);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();

    navigate(`${address}`);
  }

  return (
    <div className="p-5 space-y-3">
      <div className="flex justify-end items-center space-x-3">
        {walletAddress && (
          <a
            href={`https://etherscan.io/address/${walletAddress}`}
            target="_blank"
            rel="noreferrer noopener nofollow"
            title="View on Etherscan"
          >
            {ellipseAddress(walletAddress)}
          </a>
        )}
        {!walletConnected ? (
          <LoadingButton
            onClick={connectWallet}
            variant="outlined"
            size="medium"
            sx={{
              textTransform: 'capitalize',
            }}
          >
            Connect <AccountBalanceWalletIcon />
          </LoadingButton>
        ) : (
          <>
            <LoadingButton
              onClick={() => navigate(`/${walletAddress}`)}
              variant="outlined"
              size="medium"
              sx={{
                textTransform: 'capitalize',
              }}
            >
              Portfolio
            </LoadingButton>
            <LoadingButton
              onClick={disconnectWallet}
              variant="outlined"
              color="error"
              size="medium"
              sx={{
                textTransform: 'capitalize',
              }}
            >
              Disconnect
            </LoadingButton>
          </>
        )}
      </div>
      <div className="space-y-3">
        <header>
          <h1 className="text-6xl text-center font-bold">
            <Link to="/">nft looker.</Link>
          </h1>

          <div className="text-center space-x-5">
            <Ethereum />
            <Polygon />
            <Binance />
            <Avalanche />
            <Fantom />
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="mx-auto lg:w-1/2">
            <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
              {/* <AccountBalanceWalletIcon
                sx={{ color: 'action.active', mr: 1, my: 2 }}
              /> */}
              <TextField
                fullWidth
                id="wallet-address"
                label="Enter wallet address or domain"
                value={address}
                onChange={(e) => setAddress(e.currentTarget.value)}
                autoFocus
              />
            </Box>
          </div>
          <div className="text-center">
            <LoadingButton
              type="submit"
              endIcon={<SearchIcon />}
              loading={props.loading}
              loadingPosition="end"
              variant="contained"
              size="large"
              color="info"
              sx={{
                textTransform: 'capitalize',
              }}
            >
              Look
            </LoadingButton>
          </div>
        </form>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
