import { useEffect, useState } from 'react';

// React Router
import {
  Outlet,
  Link,
  useNavigate,
  useParams,
  useLocation,
} from 'react-router-dom';

// Ethers
import { ethers } from 'ethers';

import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

// Chakra
import { Stack, Input } from '@chakra-ui/react';
import { Button, ButtonGroup } from '@chakra-ui/react';
import { Search2Icon } from '@chakra-ui/icons';
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuItemOption,
  MenuGroup,
  MenuOptionGroup,
  MenuDivider,
  Box,
} from '@chakra-ui/react';
import { IconButton } from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import { FormControl, FormLabel, Switch } from '@chakra-ui/react';

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
  let location = useLocation();

  useEffect(() => {
    // reset app state if you go to / route
    if (location.pathname == '/') {
      setAddress('');
    }
  }, [location]);

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
        {/* TESTING */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-center">
            <Button
              onClick={() =>
                navigate(`/0x2aea6d8220b61950f30674606faaa01c23465299`)
              }
            >
              ETH/MATIC
            </Button>
            <Button onClick={() => navigate(`/alice.eth`)}>.eth</Button>
            <Button onClick={() => navigate(`/brad.crypto`)}>.crypto</Button>
            <Button
              onClick={() =>
                navigate(`/0x40a7dc2ac7d5fc35da3a9d99552b18cd91188735`)
              }
            >
              BSC
            </Button>
            <Button
              onClick={() =>
                navigate(`/0x3a52c7df1bb5e70a0a13e9c9c00f258fe9da68fd`)
              }
            >
              FTM/AVAX
            </Button>
          </div>
        )}
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
          <Button
            colorScheme="red"
            rightIcon={<AccountBalanceWalletIcon />}
            onClick={connectWallet}
          >
            Connect
          </Button>
        ) : (
          <>
            <Button onClick={() => navigate(`/${walletAddress}`)}>
              Portfolio
            </Button>
            <Button colorScheme="red" onClick={disconnectWallet}>
              Disconnect
            </Button>
          </>
        )}
        <Box>
          <Menu closeOnSelect={false}>
            <MenuButton
              as={IconButton}
              aria-label="Options"
              icon={<HamburgerIcon />}
            />
            <MenuList minWidth="100px">
              <MenuItem>
                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="testnet" mb="0">
                    Enable testnets
                  </FormLabel>
                  <Switch
                    id="testnet"
                    isChecked={props.testnets}
                    onChange={() => props.onSetTestnets(!props.testnets)}
                  />
                </FormControl>
              </MenuItem>
            </MenuList>
          </Menu>
        </Box>
      </div>

      <div className="space-y-3">
        <header className="text-center">
          <h1 className="text-6xl font-bold">
            <Link to="/">nft looker.</Link>
          </h1>

          <h2 className="text-xl">View NFTs across multiple blockchains.</h2>

          {/*<div className="text-center space-x-5">
            <Ethereum />
            <Polygon />
            <Binance />
            <Avalanche />
            <Fantom />
        </div>*/}
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-3 mx-auto text-center lg:w-1/2"
        >
          <Input
            placeholder="Enter wallet address or domain"
            value={address}
            onChange={(e) => setAddress(e.currentTarget.value)}
            size="lg"
            autoFocus
          />

          <Button
            type="submit"
            isLoading={props.loading}
            size="lg"
            loadingText="Loading"
            spinnerPlacement="end"
            colorScheme="blue"
            rightIcon={<Search2Icon />}
          >
            Look
          </Button>
        </form>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
