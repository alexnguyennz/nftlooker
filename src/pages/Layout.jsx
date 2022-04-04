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
import { viewIsLoading, viewIsNotLoading } from '../state/loading/loadingSlice';
import { toggleTestnets, testnetsState } from '../state/testnets/testnetsSlice';
import {
  changeLimit,
  changeFilter,
  searchLimitState,
  searchFilterState,
} from '../state/search/searchSlice';
import { changeTab, tabState } from '../state/tab/tabSlice';
import { settingsState, toggleAutoplay } from '../state/settings/settingsSlice';

// React Query
import { useQuery } from 'react-query';

import WalletModal from '../components/WalletModal/WalletModal';

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

import { CUIAutoComplete } from 'chakra-ui-autocomplete';

import axios from 'axios';

// testing address
//const WALLET_ADDRESS = '0x2aea6d8220b61950f30674606faaa01c23465299';

export function Layout() {
  const [address, setAddress] = useState('');

  const [search, setSearch] = useState(['']);

  // Modal
  const { isOpen, onOpen, onClose } = useDisclosure();

  // initialise Ethers
  const { ethereum } = window;
  let provider;

  let navigate = useNavigate();
  let params = useParams();
  let location = useLocation();

  const fetchController = new AbortController();

  // Redux
  const loading = useSelector((state) => state.loading.value);
  const tab = useSelector(tabState);
  const settings = useSelector(settingsState);
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

    //dispatch(toggleAutoplay(Boolean(localStorage.getItem('autoplay'))));

    return () => {
      fetchController.abort();
      dispatch(viewIsNotLoading());
    };
  }, []);

  useEffect(() => {}, [ethereum]);

  async function getRandomWallet() {
    dispatch(viewIsLoading());

    const response = await axios(`/api/randomWallet`, {
      signal: fetchController.signal,
    }).catch((err) => console.log(err));

    setAddress(response.data);
    navigate(`/${response.data}`);
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (address) {
      navigate(`${address}`);
    }
  }

  function handleTestnetsToggle() {
    dispatch(toggleTestnets());
    navigate(location.pathname);
  }

  useEffect(() => {
    console.log('settings', settings);

    console.log('local', localStorage.getItem('autoplay'));
  }, [settings]);

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
                    Dark mode
                  </FormLabel>
                  <Switch
                    id="dark-mode"
                    isChecked={colorMode === 'light' ? false : true}
                    onChange={toggleColorMode}
                  />
                </FormControl>
              </MenuItem>

              <MenuItem>
                <FormControl className="flex justify-between">
                  <FormLabel htmlFor="autoplay-mode" mb="0">
                    Autoplay videos
                  </FormLabel>
                  <Switch
                    id="autoplay"
                    isChecked={settings.autoplay}
                    onChange={() => dispatch(toggleAutoplay())}
                  />
                </FormControl>
              </MenuItem>

              {/*
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
                </MenuItem>*/}
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
            <ModalBody>
              <p className="pt-3 pb-5">
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

              <Accordion>
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
              <Button onClick={onClose} className="mb-1">
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>

      <header className="text-center space-y-3">
        <h1 className="text-6xl font-bold tracking-tighter">
          <Link to="/">NFT Looker.</Link>
        </h1>

        <h2 className="text-xl font-semibold">
          {tab == 0 ? `View NFTs for any wallet.` : `Search for any NFT.`}
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
            <Tab>View</Tab>
            <Tab>Search</Tab>
          </TabList>
          <TabPanels>
            <TabPanel paddingX="0">
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
                        View
                      </Button>
                      <Button
                        onClick={getRandomWallet}
                        size="lg"
                        loadingText="Loading"
                        spinnerPlacement="end"
                        colorScheme="blue"
                      >
                        Random
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
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </TabPanel>
            <TabPanel paddingX="0">
              <div className="space-y-3 mx-auto text-center lg:w-1/2">
                <KeywordInput />
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
  const loading = useSelector((state) => state.loading.value);
  const searchLimit = useSelector(searchLimitState);
  const searchFilter = useSelector(searchFilterState);
  const dispatch = useDispatch();

  // React Router
  const navigate = useNavigate();
  const params = useParams();

  const colorModeSearch = useColorModeValue('white', '#1f2937');

  // Chakra UI Autocomplete
  let items = [];

  const [pickerItems, setPickerItems] = useState(items);

  const [selectedItems, setSelectedItems] = useState([]);

  const handleCreateItem = (item) => {
    // don't allow empty items
    if (item.value) {
      setPickerItems((curr) => [...curr, item]);
      setSelectedItems((curr) => [...curr, item]);
    }
  };

  // removal of items
  const handleSelectedItemsChange = (selectedItems) => {
    console.log('selectedItems', selectedItems);
    if (selectedItems) {
      setSelectedItems(selectedItems);
    }
  };

  // when a selected item is removed, also remove from picker list to allow re-entry
  useEffect(() => {
    setPickerItems(selectedItems);
  }, [selectedItems]);

  // load in keywords manually from a search route visit
  useEffect(() => {
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

      //items = keywords;
      setSelectedItems(keywords);
    }
  }, []);

  function handleSearch() {
    const keywords = selectedItems.map((item) => {
      return item.value;
    });

    console.log('selectedItems', selectedItems);

    const query = keywords.join(' ');

    if (query) {
      navigate(`/search/${query}`);
    }
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
            backgroundColor: `${colorModeSearch}`,
            size: 'lg',
            isDisabled: loading,
            isRequired: true,
          }}
          hideToggleButton
          createItemRenderer={(value) => `Add "${value}"`}
        />
      </div>
      <div>
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
            Search
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
            Cancel
          </Button>
        )}
        <Menu closeOnSelect={false} isLazy lazyBehavior padding="0">
          <MenuButton
            marginLeft="1.25rem"
            as={IconButton}
            aria-label="Options"
            icon={<SettingsIcon />}
            padding="18px"
            paddingY="24px"
          />
          <MenuList minWidth="120px" padding="0.75em">
            <MenuOptionGroup
              title="Limit"
              className="text-left"
              marginLeft="0"
              marginTop="0"
            >
              <Select
                defaultValue={searchLimit}
                onChange={(e) =>
                  dispatch(changeLimit(Number(e.currentTarget.value)))
                }
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
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
