import { useEffect } from 'react';

// State
import { useSelector, useDispatch } from 'react-redux';
import { walletState, setWallet } from '../../state/wallet/walletSlice';

// Router
import { useNavigate } from 'react-router-dom';

// Wallet Libraries
import { ethers } from 'ethers';
import { sequence } from '0xsequence';
import WalletConnect from '@walletconnect/client';
import QRCodeModal from '@walletconnect/qrcode-modal';

// Components
import {
  useDisclosure,
  useColorModeValue,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
} from '@chakra-ui/react';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

// UTILS
import ellipseAddress from '../../utils/ellipseAddress';
import { explorer } from '../../utils/chainExplorer';

export default function WalletModal() {
  let provider;

  // State
  const dispatch = useDispatch();
  const wallet = useSelector(walletState);

  // Router
  const navigate = useNavigate();

  // Modal
  const { isOpen, onOpen, onClose } = useDisclosure();

  const colorMode = useColorModeValue('hover:bg-gray-100', 'hover:bg-gray-800');

  useEffect(() => {
    async function injectedListeners() {
      if (window.ethereum) {
        // persist connect state
        if (localStorage.getItem('WEB3_CONNECTED')) {
          connectMetaMask();
        }

        window.ethereum.on('accountsChanged', async (accounts) => {
          if (accounts.length > 0) {
            connectMetaMask();
          } else {
            disconnectWallet();
          }
        });
      }
    }

    injectedListeners();
  }, []);

  useEffect(() => {
    // console.log('color mode', colorMode);
  }, [colorMode]);

  useEffect(() => {
    // console.log('wallet state', wallet);
  }, [wallet]);

  async function connectMetaMask() {
    if (window.ethereum) {
      //
      onClose();

      try {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.send('eth_requestAccounts', []);
        // const accounts = await window.ethereum.request({
        //   method: 'eth_requestAccounts',
        //  });

        console.log('Connecting wallet');
        dispatch(
          setWallet({
            address: accounts[0],
            chain: window.ethereum.networkVersion,
          })
        );

        // persist connect state
        localStorage.setItem('WEB3_CONNECTED', 'true');

        // manually get data for NFTs
        //setAddress(account[0]);
        //navigate(`/${account[0]}`);

        console.log('Connected wallet:', accounts[0]);
      } catch (err) {
        console.log(err);
      }
    }
  }

  async function disconnectWallet() {
    try {
      onClose();
      // reset wallet connection
      provider = null;
      dispatch(setWallet({ address: '', chain: '' }));

      const sequenceWallet = new sequence.Wallet('polygon');
      sequenceWallet.disconnect();

      // persist connect state
      localStorage.removeItem('WEB3_CONNECTED');

      // reset app state
      // setAddress('');
      navigate('/');

      console.log('Disconnected wallet.');
    } catch (err) {
      console.error(err);
    }
  }

  async function connectWalletConnect() {
    const connector = new WalletConnect({
      bridge: 'https://bridge.walletconnect.org', // Required
      qrcodeModal: QRCodeModal,
    });

    if (!connector.connected) {
      // create new session
      connector.createSession();
    }
  }

  async function connectSequence() {
    const wallet = new sequence.Wallet('polygon');

    const connectDetails = await wallet.connect({
      app: 'NFT Looker',
    });

    const walletAddress = await wallet.getAddress();
    const chainId = connectDetails.chainId;

    console.log('connectDetails', connectDetails);
    dispatch(setWallet({ address: walletAddress, chain: chainId }));
  }

  if (!wallet.address) {
    return (
      <>
        <Button
          colorScheme="red"
          backgroundColor="red.400"
          rightIcon={<AccountBalanceWalletIcon />}
          onClick={onOpen}
        >
          Connect
        </Button>
        <Modal size="xl" onClose={onClose} isOpen={isOpen} isCentered>
          {/* chakra-radii-md: 0.375rem; */}
          <ModalOverlay /> {/* force scrollbar */}
          <ModalContent className="mx-5">
            <ModalBody padding="0">
              <div className="modal-wallets grid sm:grid-cols-3">
                <div
                  className={`p-5 text-center cursor-pointer transition ${colorMode}`}
                  onClick={window.ethereum && connectMetaMask}
                >
                  <img
                    src="/icons/metamask.svg"
                    width="71"
                    height="71"
                    className="mx-auto"
                  />
                  <h3 className="text-center font-bold text-xl">MetaMask</h3>
                  {window.ethereum ? (
                    <p>Connect to your MetaMask Wallet</p>
                  ) : (
                    <p className="mt-3">
                      <a
                        href="https://metamask.io/download/"
                        target="_blank"
                        rel="noreferrer noopener nofollow"
                      >
                        <Button colorScheme="red" backgroundColor="red.400">
                          Install MetaMask
                        </Button>
                      </a>
                    </p>
                  )}
                </div>
                {
                  <div
                    className={`p-5 text-center cursor-pointer transition ${colorMode}`}
                    onClick={connectWalletConnect}
                  >
                    <img
                      src="/icons/walletconnect.svg"
                      width="64"
                      height="64"
                      className="mx-auto"
                    />
                    <h3 className="text-center font-bold text-xl">
                      WalletConnect
                    </h3>
                    <p>Scan with WalletConnect</p>
                  </div>
                }
                <div
                  className={`p-5 text-center cursor-pointer transition ${colorMode}`}
                  onClick={connectSequence}
                >
                  <img
                    src="/icons/sequence.svg"
                    width="64"
                    height="64"
                    className="mx-auto"
                  />
                  <h3 className="text-center font-bold text-xl">Sequence</h3>
                  <p>Connect to your Sequence Wallet</p>
                </div>
              </div>
            </ModalBody>
          </ModalContent>
        </Modal>
      </>
    );
  }

  return (
    <>
      <a
        href={`https://${explorer(wallet.chain)}/address/${wallet.address}`}
        target="_blank"
        rel="noreferrer noopener nofollow"
        title={`View on ${explorer(wallet.chain)}`}
      >
        {ellipseAddress(wallet.address)}
      </a>

      {/* 
      
      "whiteAlpha" | "blackAlpha" | "gray" | "red" | "orange" | "yellow" | "green" | "teal" | "blue" | "cyan" | "purple" | "pink" | "linkedin" | "facebook" | "messenger" | "whatsapp" | "twitter" | "telegram"
      */}

      <Button onClick={() => navigate(`/${wallet.address}`)}>Portfolio</Button>
      <Button
        colorScheme="red"
        backgroundColor="red.400"
        rightIcon={<AccountBalanceWalletIcon />}
        onClick={disconnectWallet}
      >
        Disconnect
      </Button>
    </>
  );
}
