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

import Footer from '../components/layouts/Footer';

// Chakra
import { Stack, Input } from '@chakra-ui/react';
import { Button, ButtonGroup } from '@chakra-ui/react';
import { Search2Icon, SettingsIcon } from '@chakra-ui/icons';
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
  Select,
} from '@chakra-ui/react';
import { IconButton } from '@chakra-ui/react';
import {
  SunIcon,
  MoonIcon,
  HamburgerIcon,
  QuestionIcon,
} from '@chakra-ui/icons';
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

import { useColorMode, useColorModeValue } from '@chakra-ui/react';

import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';

import { library, icon } from '@fortawesome/fontawesome-svg-core';

import {
  Ethereum,
  Polygon,
  Binance,
  Avalanche,
  Fantom,
} from '../components/ChainIcons';

import ellipseAddress from '../utils/ellipseAddress';
import axios from 'axios';

import { TagsInput } from 'react-tag-input-component';

// testing address
const WALLET_ADDRESS = '0x2aea6d8220b61950f30674606faaa01c23465299';

export function Layout(props) {
  const [address, setAddress] = useState(WALLET_ADDRESS);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);

  const [search, setSearch] = useState('');

  // Modal
  const { isOpen, onOpen, onClose } = useDisclosure();

  // initialise Ethers
  const { ethereum } = window;
  let provider;

  let navigate = useNavigate();
  let params = useParams();
  let location = useLocation();

  const fetchController = new AbortController();

  // Color Mode
  const { colorMode, toggleColorMode } = useColorMode();
  const colorModeBg = useColorModeValue('white', '#1f2937');
  const colorModeBody = useColorModeValue('bg-rose-50', 'bg-gray-900'); // chakra gray-800 #1A202C
  const colorModeBodyHex = useColorModeValue('#fff1f2', '#111827');
  const colorModeView = useColorModeValue('pink', 'gray');
  // bg-rose-50 background-color: rgb(255 241 242); #fff1f2
  // bg-gray-900 	background-color: rgb(17 24 39); #111827

  const colorModeInverseBg = useColorModeValue('black', 'white');

  useEffect(() => {
    return () => {
      fetchController.abort();
      props.onLoading(false);
    };
  }, []);

  useEffect(() => {
    // reset app state if you go to / route
    //console.log('params', location);
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

  async function getRandomWallet() {
    props.onLoading(true);

    const response = await axios
      .get(`/api/randomWallet`, { signal: fetchController.signal })
      .catch((err) => console.log(err));

    console.log('response', response);

    setAddress(response.data);
    navigate(`/${response.data}`);
  }

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

    if (!address) {
      console.log('none');
    }
    navigate(`${address}`);
  }

  function handleSearch(e) {
    e.preventDefault();
    console.log('running search');

    navigate(`/search/${search}`);
  }

  function handleTestnetsToggle() {
    props.onSetTestnets(!props.testnets);

    if (address) {
      navigate(`${address}`);
    }
  }

  return (
    <div
      className={`p-5 space-y-3 flex flex-col min-h-screen ${colorModeBody}`}
    >
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
            connect
          </Button>
        ) : (
          <>
            <Button
              onClick={() =>
                navigate(`/${walletAddress}`, {
                  state: { address: walletAddress },
                })
              }
            >
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
            <MenuList minWidth="50px">
              <MenuItem>
                <FormControl className="flex justify-between">
                  <FormLabel htmlFor="dark-mode" mb="0">
                    dark mode
                  </FormLabel>
                  <Switch
                    id="dark-mode"
                    isChecked={colorMode === 'light' ? false : true}
                    onChange={toggleColorMode}
                  />
                </FormControl>
              </MenuItem>

              <MenuItem>
                <FormControl className="flex justify-between items-center">
                  <FormLabel htmlFor="testnet" mb="0">
                    add testnets
                  </FormLabel>
                  <Switch
                    id="testnet"
                    isChecked={props.testnets}
                    onChange={handleTestnetsToggle}
                    isDisabled={props.loading}
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

        <Modal size="xl" onClose={onClose} isOpen={isOpen} isCentered>
          <ModalOverlay />
          <ModalContent className="mx-5">
            <ModalHeader></ModalHeader>
            <ModalCloseButton />
            <ModalBody className="">
              <p className="pb-5">
                NFT Looker is a simple way to view NFTs - by entering a wallet
                address or searching using keywords. You can view an individual
                NFT or collection for more info.
              </p>

              <p className="pb-5">
                Compatible with{' '}
                <a
                  href="https://ens.domains/"
                  target="_blank"
                  rel="noreferrer noopener follow"
                >
                  ENS
                </a>{' '}
                and{' '}
                <a
                  href="https://unstoppabledomains.com/"
                  target="_blank"
                  rel="noreferrer noopener follow"
                >
                  Unstoppable Domains
                </a>
                .
              </p>

              <Accordion allowMultiple>
                <AccordionItem>
                  <h2>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        Supported file formats
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    <ul className="list-disc pl-5">
                      <li>images</li>
                      <li>videos</li>
                      <li>3D models</li>
                    </ul>
                  </AccordionPanel>
                </AccordionItem>
                <AccordionItem>
                  <h2>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        Supported mainnets
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    <ul className="list-disc pl-5">
                      <li>Ethereum</li>
                      <li>Polygon</li>
                      <li>Binance Smart Chain</li>
                      <li>Avalanche</li>
                      <li>Fantom</li>
                    </ul>
                  </AccordionPanel>
                </AccordionItem>

                <AccordionItem>
                  <h2>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        Supported testnets
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    <ul className="list-disc pl-5">
                      <li>Ropsten (Ethereum)</li>
                      <li>Rinkeby (Ethereum)</li>
                      <li>Goerli (Ethereum)</li>
                      <li>Kovan (Ethereum)</li>
                      <li>Mumbai (Polygon)</li>
                      <li>Testnet (Binance Smart Chain)</li>
                      <li>Fuji (Avalanche)</li>
                    </ul>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>

              <p className="pt-5">
                NFTs will not appear or display correctly for a number of
                reasons including:
              </p>
              <ul className="list-disc pl-5">
                <li>slow or down IPFS gateways</li>
                <li>
                  unusual metadata formats and not using common property names
                  e.g. name, image, description
                </li>
                <li>broken metadata and/or media (image, video) links</li>
                <li>dead or insecure sites</li>
              </ul>
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
          view NFTs across multiple blockchains.
        </h2>

        {/* Type
"line" | "enclosed" | "enclosed-colored" | "soft-rounded" | "solid-rounded" | "unstyled"*/}
        <Tabs
          align="center"
          size="lg"
          variant="soft-rounded"
          colorScheme={colorModeView}

          //backgroundColor={colorModeBody}
        >
          <TabList>
            <Tab>View</Tab>
            <Tab>Search</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <h3 className="text-lg font-semibold">
                view a wallet{`'`}s NFTs
              </h3>
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
                  isDisabled={props.loading || props.randomLoading}
                  backgroundColor={colorModeBg}
                />

                <div className="space-x-5">
                  <Button
                    type="submit"
                    isLoading={props.loading}
                    size="lg"
                    loadingText="Loading"
                    spinnerPlacement="end"
                    colorScheme="blue"
                    rightIcon={<Search2Icon />}
                    //isDisabled={!address}
                  >
                    view
                  </Button>
                  {!props.loading && (
                    <Button
                      onClick={getRandomWallet}
                      isLoading={props.loading}
                      size="lg"
                      loadingText="Loading"
                      spinnerPlacement="end"
                      colorScheme="blue"
                    >
                      random
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        fill={colorModeBg}
                        width="20"
                        className="ml-2"
                      >
                        <path d="M424.1 287c-15.13-15.12-40.1-4.426-40.1 16.97V352h-48L153.6 108.8c-6-8-15.5-12.8-25.6-12.8H32c-17.69 0-32 14.3-32 32s14.31 32 32 32h80l182.4 243.2c6 8.1 15.5 12.8 25.6 12.8h63.97v47.94c0 21.39 25.86 32.12 40.99 17l79.1-79.98c9.387-9.387 9.387-24.59 0-33.97L424.1 287zM336 160h47.97v48.03c0 21.39 25.87 32.09 40.1 16.97l79.1-79.98c9.387-9.391 9.385-24.59-.001-33.97l-79.1-79.98c-15.13-15.12-40.99-4.391-40.99 17V96H320c-10.06 0-19.56 4.75-25.59 12.81L254 162.7l39.1 53.3 42.9-56zM112 352H32c-17.69 0-32 14.31-32 32s14.31 32 32 32h96c10.06 0 19.56-4.75 25.59-12.81l40.4-53.87L154 296l-42 56z" />
                      </svg>
                    </Button>
                  )}
                </div>
              </form>
            </TabPanel>
            <TabPanel>
              <h3 className="text-lg font-semibold">
                search for NFTs with keywords
              </h3>

              <form
                //onSubmit={handleSearch}
                onSubmit={handleSearch}
                className="space-y-3 mx-auto text-center lg:w-1/2"
              >
                {/*<div className="search-box">
                  <TagsInput
                    value={search}
                    onChange={setSearch}
                    name="search"
                    className="search"
                    placeHolder="Enter keywords"
                  />
                  </div>*/}
                <div className="flex items-center space-x-3">
                  <Input
                    placeholder="Enter keywords"
                    value={search}
                    onChange={(e) => setSearch(e.currentTarget.value)}
                    size="lg"
                    autoFocus
                    isDisabled={props.loading || props.randomLoading}
                    backgroundColor={colorModeBg}
                  />
                  <Box>
                    <Menu
                      closeOnSelect={false}
                      isLazy
                      lazyBehavior
                      padding="50px"
                    >
                      <MenuButton
                        as={IconButton}
                        aria-label="Options"
                        icon={<SettingsIcon />}
                        padding="18px"
                        paddingY="24px"
                      />
                      <MenuList minWidth="120px" className="p-3">
                        <MenuOptionGroup
                          defaultValue="5"
                          title="Limit"
                          type="radio"
                          className="text-left"
                          marginLeft="0"
                        >
                          <Select className="">
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                          </Select>
                        </MenuOptionGroup>
                      </MenuList>
                    </Menu>
                  </Box>
                </div>

                <div className="space-x-5">
                  <Button
                    type="submit"
                    isLoading={props.loading}
                    size="lg"
                    loadingText="Loading"
                    spinnerPlacement="end"
                    colorScheme="blue"
                    rightIcon={<Search2Icon />}
                  >
                    search
                  </Button>
                </div>
              </form>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </header>

      <main className="flex-auto">
        <div className="my-10">
          <Outlet />
        </div>
      </main>

      <Footer colorMode={colorModeInverseBg} />
    </div>
  );
}
