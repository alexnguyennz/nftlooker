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
import { HamburgerIcon, QuestionIcon } from '@chakra-ui/icons';
import { FormControl, FormLabel, Switch } from '@chakra-ui/react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';

import { useDisclosure } from '@chakra-ui/react';

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

  // Modal
  const { isOpen, onOpen, onClose } = useDisclosure();

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
    <div className="p-5 space-y-3 flex flex-col min-h-screen">
      <div className="flex justify-end items-center space-x-3 ">
        {/* TESTING */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-center space-x-3">
            <Button
              onClick={() =>
                navigate(`/0x2aea6d8220b61950f30674606faaa01c23465299`)
              }
              size="xs"
            >
              ETH/MATIC
            </Button>
            <Button onClick={() => navigate(`/alice.eth`)} size="xs">
              .eth
            </Button>
            <Button onClick={() => navigate(`/brad.crypto`)} size="xs">
              .crypto
            </Button>
            <Button
              onClick={() =>
                navigate(`/0x40a7dc2ac7d5fc35da3a9d99552b18cd91188735`)
              }
              size="xs"
            >
              BSC
            </Button>
            <Button
              onClick={() =>
                navigate(`/0x3a52c7df1bb5e70a0a13e9c9c00f258fe9da68fd`)
              }
              size="xs"
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

        {/* INFO */}
        <button onClick={onOpen}>
          <QuestionIcon />
        </button>

        <Modal onClose={onClose} isOpen={isOpen} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Info</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <p>Current supported chains:</p>
              <ul className="list-disc pl-5">
                <li>Ethereum</li>
                <li>Polygon</li>
                <li>Binance Smart Chain</li>
                <li>Avalanche</li>
                <li>Fantom</li>
              </ul>
              <p>
                Please send me an email for any requests, suggestions, bugs,
                issues, etc.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button onClick={onClose}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>

      <header className="text-center space-y-3">
        <h1 className="text-6xl font-bold tracking-tighter">
          <Link to="/">nft looker.</Link>
        </h1>

        <h2 className="text-xl font-semibold">
          View NFTs across multiple blockchains.
        </h2>

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

          <div className="space-x-5">
            <Button
              type="submit"
              isLoading={props.loading}
              size="lg"
              loadingText="Loading"
              spinnerPlacement="end"
              colorScheme="blue"
              backgroundColor="#3182CE"
              rightIcon={<Search2Icon />}
            >
              Look
            </Button>

            <Button
              isLoading={props.loading}
              size="lg"
              loadingText="Loading"
              spinnerPlacement="end"
              colorScheme="blue"
              backgroundColor="#3182CE"
            >
              Random
            </Button>
          </div>
        </form>
      </header>

      <main className="flex-auto">
        <div className="my-10">
          <Outlet />
        </div>
      </main>

      <footer className="text-xl text-center ">
        <span>© NFT Looker 2022</span>
      </footer>
    </div>
  );
}
