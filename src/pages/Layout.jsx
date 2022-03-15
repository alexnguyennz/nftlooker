import { useEffect, useState } from 'react';

// React Router
import {
  Outlet,
  Link,
  useNavigate,
  useParams,
  useLocation,
} from 'react-router-dom';

// Redux
import { useSelector, useDispatch } from 'react-redux';
import {
  viewIsLoading,
  viewIsNotLoading,
  loadingState,
} from '../state/loading/loadingSlice';
import { toggleTestnets, testnetsState } from '../state/testnets/testnetsSlice';
import {
  changeLimit,
  changeFilter,
  searchLimitState,
  searchFilterState,
} from '../state/search/searchSlice';
import { changeTab, tabState } from '../state/tab/tabSlice';

import { useIsFetching } from 'react-query';

// Wallet connectivity
import { ethers } from 'ethers';
import { sequence } from '0xsequence';
import WalletModal from '../components/WalletModal/WalletModal';
/* import WalletConnectProvider from '@walletconnect/web3-provider';
import { Buffer } from 'buffer';
if (!window.Buffer) window.Buffer = Buffer; */
//import WalletConnectQRCodeModal from '@walletconnect-qrcode-modal';

import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

import Footer from '../components/layouts/Footer';

// Chakra
import { Stack, Input } from '@chakra-ui/react';
import { Button, ButtonGroup } from '@chakra-ui/react';
import { Search2Icon, SettingsIcon } from '@chakra-ui/icons';
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import {
  useDisclosure,
  useColorMode,
  useColorModeValue,
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Switch,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  IconButton,
  Spinner,
} from '@chakra-ui/react';
import {
  SunIcon,
  MoonIcon,
  HamburgerIcon,
  QuestionIcon,
  CloseIcon,
  SmallCloseIcon,
} from '@chakra-ui/icons';

import {
  AutoComplete,
  AutoCompleteInput,
  AutoCompleteItem,
  AutoCompleteList,
  AutoCompleteTag,
  AutoCompleteCreatable,
} from '@choc-ui/chakra-autocomplete';
import { CUIAutoComplete } from 'chakra-ui-autocomplete';

import { library, icon } from '@fortawesome/fontawesome-svg-core';

import {
  Ethereum,
  Polygon,
  Binance,
  Avalanche,
  Fantom,
} from '../components/ChainIcons';

// UTILS
import ellipseAddress from '../utils/ellipseAddress';
import { explorer } from '../utils/chainExplorer';

import axios from 'axios';

// Tags
import { TagsInput } from 'react-tag-input-component';
import ReactTagInput from '@pathofdev/react-tag-input';
import '@pathofdev/react-tag-input/build/index.css';

// testing address
//const WALLET_ADDRESS = '0x2aea6d8220b61950f30674606faaa01c23465299';

export function Layout(props) {
  const [address, setAddress] = useState('');
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [chain, setChain] = useState(null);

  const [search, setSearch] = useState(['']);
  const [tags, setTags] = useState([]);

  const isFetching = useIsFetching();

  useEffect(() => {
    if (isFetching > 0) {
      console.log('FETCHING');
    } else {
      console.log('STOPPED FETCHING');
    }
  }, [isFetching]);

  // Modal
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: walletModalIsOpen,
    onOpen: walletModalOnOpen,
    onClose: walletModalOnClose,
  } = useDisclosure();

  // initialise Ethers
  const { ethereum } = window;
  let provider;

  let navigate = useNavigate();
  let params = useParams();
  let location = useLocation();

  const fetchController = new AbortController();

  // Redux
  const loading = useSelector(loadingState);
  const testnets = useSelector(testnetsState);
  const searchLimit = useSelector(searchLimitState);
  const searchFilter = useSelector(searchFilterState);
  const tab = useSelector(tabState);
  const dispatch = useDispatch();

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
    // reset app state if you go to / route
    //console.log('params', location);

    if (params.walletAddress) {
      setAddress(params.walletAddress);
    } else {
      setAddress('');
    }
  }, [location]);

  // set the input field to the walletAddress param
  useEffect(() => {
    //console.log('params', params.walletAddress);
    if (params.walletAddress) {
      setAddress(params.walletAddress);
    } else if (params.q) {
      setSearch(params.q);
    }

    return () => {
      fetchController.abort();
      dispatch(viewIsNotLoading());
    };
  }, []);

  useEffect(() => {}, [ethereum]);

  async function getRandomWallet() {
    dispatch(viewIsLoading());

    const response = await axios
      .get(`/api/randomWallet`, { signal: fetchController.signal })
      .catch((err) => console.log(err));

    setAddress(response.data);
    navigate(`/${response.data}`);
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (address) {
      navigate(`${address}`);
    } else {
      //alert('nivalid');
    }
  }

  function handleSearch(e) {
    e.preventDefault();

    console.log('search', search);
    navigate(`/search/${search}`);
  }

  function handleTestnetsToggle() {
    dispatch(toggleTestnets());
    navigate(location.pathname);
  }

  function handleNewSearch() {
    navigate(`/search/${search}`);
  }

  return (
    <div
      className={`p-5 space-y-3 flex flex-col min-h-screen ${colorModeBody}`}
    >
      <div className="flex justify-end items-center space-x-3 ">
        {/* TESTING */}
        {process.env.NODE_ENV === 'development' && (
          <Box>
            <Menu closeOnSelect={false}>
              <MenuButton as={Button} aria-label="Options">
                Testing
              </MenuButton>
              <MenuList minWidth="50px">
                <MenuItem
                  onClick={() =>
                    navigate(`/0x2aea6d8220b61950f30674606faaa01c23465299`)
                  }
                >
                  ETH/MATIC
                </MenuItem>
                <MenuItem onClick={() => navigate(`/alice.eth`)}>
                  alice.eth
                </MenuItem>
                <MenuItem onClick={() => navigate(`/brad.crypto`)}>
                  brad.crypto
                </MenuItem>
                <MenuItem
                  onClick={() =>
                    navigate(`/0x40a7dc2ac7d5fc35da3a9d99552b18cd91188735`)
                  }
                >
                  BSC
                </MenuItem>
                <MenuItem
                  onClick={() =>
                    navigate(`/0x3a52c7df1bb5e70a0a13e9c9c00f258fe9da68fd`)
                  }
                >
                  FTM/AVAX
                </MenuItem>
              </MenuList>
            </Menu>
          </Box>
        )}

        <WalletModal />

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
                    isChecked={testnets}
                    onChange={handleTestnetsToggle}
                    isDisabled={loading}
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
          <ModalOverlay overflowY="scroll" />
          <ModalContent className="ml-5 mr-10">
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
                <li>
                  general unreliability and poor performance when accessing IPFS
                  data
                </li>
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
          {tab == 0 ? `view NFTs for any wallet.` : `search for any NFT.`}
        </h2>

        {/* Type
"line" | "enclosed" | "enclosed-colored" | "soft-rounded" | "solid-rounded" | "unstyled"*/}
        <Tabs
          index={tab}
          onChange={(index) => dispatch(changeTab(index))}
          align="center"
          size="lg"
          variant="soft-rounded"
          colorScheme={colorModeView}

          //backgroundColor={colorModeBody}
        >
          <TabList>
            <Tab>view</Tab>
            <Tab>search</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <form
                onSubmit={handleSubmit}
                className="space-y-3 mx-auto text-center lg:w-1/2"
              >
                <Input
                  placeholder="Enter wallet address or domain"
                  value={address}
                  onChange={(e) => setAddress(e.currentTarget.value)}
                  size="lg"
                  isDisabled={loading}
                  backgroundColor={colorModeBg}
                  isRequired
                />

                <div className="space-x-5">
                  {!loading && (
                    <>
                      <Button
                        type="submit"
                        isLoading={loading}
                        size="lg"
                        loadingText="Loading"
                        spinnerPlacement="end"
                        colorScheme="blue"
                        rightIcon={<Search2Icon />}
                      >
                        view
                      </Button>
                      <Button
                        onClick={getRandomWallet}
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
                    </>
                  )}

                  {loading && (
                    <Button
                      type="submit"
                      size="lg"
                      loadingText="Loading"
                      spinnerPlacement="end"
                      colorScheme="red"
                      backgroundColor="red.400"
                      rightIcon={<Spinner w={4} h={4} />}
                      onClick={() => navigate('/')}
                    >
                      cancel
                    </Button>
                  )}
                </div>
              </form>
            </TabPanel>
            <TabPanel>
              <div
                //onSubmit={handleSearch}
                onSubmit={null}
                className="space-y-3 mx-auto text-center lg:w-1/2"
              >
                {/*<Input
                  placeholder="Enter keywords"
                  value={search}
                  onChange={(e) => setSearch(e.currentTarget.value)}
                  size="lg"
                  isDisabled={loading}
                  backgroundColor={colorModeBg}
                  isRequired
                  />*/}

                <KeywordInput />

                {/*<div className="space-x-5">
                  {!loading && (
                    <Button
                      //type="submit"
                      isLoading={loading}
                      size="lg"
                      loadingText="Loading"
                      spinnerPlacement="end"
                      colorScheme="blue"
                      rightIcon={<Search2Icon />}
                      onClick={handleSearch}
                    >
                      search
                    </Button>
                  )}

                  {loading && (
                    <Button
                      type="submit"
                      size="lg"
                      loadingText="Loading"
                      spinnerPlacement="end"
                      colorScheme="red"
                      backgroundColor="red.400"
                      rightIcon={<Spinner w={4} h={4} />}
                      onClick={() => navigate('/')}
                    >
                      cancel
                    </Button>
                  )}
                  <Menu closeOnSelect={false} isLazy lazyBehavior>
                    <MenuButton
                      as={IconButton}
                      aria-label="Options"
                      icon={<SettingsIcon />}
                      padding="18px"
                      paddingY="26px"
                    />
                    <MenuList minWidth="120px" className="p-3">
                      <MenuOptionGroup
                        title="Limit"
                        className="text-left"
                        marginLeft="0"
                        marginTop="0"
                      >
                        <Select
                          defaultValue={searchLimit}
                          onChange={(e) =>
                            dispatch(changeLimit(e.currentTarget.value))
                          }
                        >
                          <option value="5">5</option>
                          <option value="10">10</option>
                          <option value="25">25</option>
                          <option value="50">50</option>
                          <option value="100">100</option>
                        </Select>
                      </MenuOptionGroup>
                      <MenuOptionGroup
                        title="Filter"
                        className="text-left"
                        marginLeft="0"
                      >
                        <Select
                          defaultValue={searchFilter}
                          onChange={(e) =>
                            dispatch(changeFilter(e.currentTarget.value))
                          }
                        >
                          <option value="global">All</option>
                          <option value="name">Name</option>
                          <option value="description">Description</option>
                          <option value="attributes">Attributes</option>
                        </Select>
                      </MenuOptionGroup>
                    </MenuList>
                  </Menu>
                        </div>*/}
              </div>
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

function KeywordInput() {
  // Redux
  const loading = useSelector(loadingState);
  const testnets = useSelector(testnetsState);
  const searchLimit = useSelector(searchLimitState);
  const searchFilter = useSelector(searchFilterState);
  const tab = useSelector(tabState);
  const dispatch = useDispatch();

  // React Router
  const navigate = useNavigate();
  const params = useParams();

  // Chakra UI Autocomplete
  let items = [];

  const [pickerItems, setPickerItems] = useState(items);

  const [selectedItems, setSelectedItems] = useState([]);

  const handleCreateItem = (item) => {
    setPickerItems((curr) => [...curr, item]);
    setSelectedItems((curr) => [...curr, item]);
  };

  const handleSelectedItemsChange = (selectedItems) => {
    if (selectedItems) {
      setSelectedItems(selectedItems);
    }
  };

  useEffect(() => {
    //console.log('params', params.q);

    // add tags manually based on query
    if (params.q) {
      // convert params into array
      const queries = params.q.split(' ');

      // convert back into keywords to load into initial input state
      const keywords = queries.map((query) => {
        return {
          label: query,
          value: query,
        };
      });

      //console.log();
      items = keywords;
      setSelectedItems(keywords);
    }
    //items =
  }, []);

  /* useEffect(() => {
    const keywords = selectedItems.map((item) => {
      return item.value;
    });

    console.log('Keywords', keywords);
  }, [items]); */

  function handleSearch() {
    const keywords = selectedItems.map((item) => {
      return item.value;
    });

    console.log('selectedItems', selectedItems);

    const query = keywords.join(' ');
    console.log('query', query);

    navigate(`/search/${query}`);
  }

  return (
    <>
      <div className="tag-input">
        <CUIAutoComplete
          placeholder="Enter keywords"
          onCreateItem={handleCreateItem}
          items={pickerItems}
          selectedItems={selectedItems}
          onSelectedItemsChange={(changes) =>
            handleSelectedItemsChange(changes.selectedItems)
          }
          tagStyleProps={{
            rounded: 'full',
            px: 4,
            py: 1,
            fontSize: '1rem',
          }}
          inputStyleProps={{
            backgroundColor: 'white',
            size: 'lg',
          }}
          hideToggleButton
          createItemRenderer={(value) => `Add "${value}"`}
        />
      </div>
      <div className="space-x-5">
        {!loading && (
          <Button
            //type="submit"
            isLoading={loading}
            size="lg"
            loadingText="Loading"
            spinnerPlacement="end"
            colorScheme="blue"
            rightIcon={<Search2Icon />}
            onClick={handleSearch}
          >
            search
          </Button>
        )}

        {loading && (
          <Button
            type="submit"
            size="lg"
            loadingText="Loading"
            spinnerPlacement="end"
            colorScheme="red"
            backgroundColor="red.400"
            rightIcon={<Spinner w={4} h={4} />}
            onClick={() => navigate('/')}
          >
            cancel
          </Button>
        )}
        <Menu closeOnSelect={false} isLazy lazyBehavior>
          <MenuButton
            as={IconButton}
            aria-label="Options"
            icon={<SettingsIcon />}
            padding="18px"
            paddingY="26px"
          />
          <MenuList minWidth="120px" className="p-3">
            <MenuOptionGroup
              title="Limit"
              className="text-left"
              marginLeft="0"
              marginTop="0"
            >
              <Select
                defaultValue={searchLimit}
                onChange={(e) => dispatch(changeLimit(e.currentTarget.value))}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </Select>
            </MenuOptionGroup>
            <MenuOptionGroup
              title="Filter"
              className="text-left"
              marginLeft="0"
            >
              <Select
                defaultValue={searchFilter}
                onChange={(e) => dispatch(changeFilter(e.currentTarget.value))}
              >
                <option value="global">All</option>
                <option value="name">Name</option>
                <option value="description">Description</option>
                <option value="attributes">Attributes</option>
              </Select>
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </div>
    </>
  );
}
