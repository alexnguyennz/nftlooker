import { useEffect } from 'react';

// State
import { useSelector, useDispatch } from 'react-redux';
import { walletState, setWallet } from '../../state/wallet/walletSlice';

// Router
import { useNavigate } from 'react-router-dom';

// Wallet Libraries
import { ethers } from 'ethers';
import { sequence } from '0xsequence';

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
import Web3 from 'web3';

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
          connectWallet();
        }

        window.ethereum.on('accountsChanged', async (accounts) => {
          if (accounts.length > 0) {
            connectWallet();
          } else {
            disconnectWallet();
          }
        });
      }
    }

    injectedListeners();
  }, []);

  useEffect(() => {
    console.log('color mode', colorMode);
  }, [colorMode]);

  useEffect(() => {
    console.log('wallet state', wallet);
  }, [wallet]);

  async function connectWallet() {
    if (window.ethereum) {
      //
      onClose();

      try {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        const account = await provider.send('eth_requestAccounts', []);

        console.log('connect wallet');
        dispatch(
          setWallet({
            address: account[0],
            chain: window.ethereum.networkVersion,
          })
        );

        // persist connect state
        localStorage.setItem('WEB3_CONNECTED', true);

        // manually get data for NFTs
        //setAddress(account[0]);
        //navigate(`/${account[0]}`);

        console.log('Connected wallet:', account[0]);
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
    //  Create WalletConnect Provider
    /*const provider = new WalletConnectProvider({
      infuraId: '27e484dcd9e3efcfd25a83a78777cdf1',
    });

    //  Enable session (triggers QR Code modal)
    await provider.enable(); */
  }

  async function connectSequenceWallet() {
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
          connect
        </Button>
        <Modal
          size="xl"
          onClose={onClose}
          isOpen={isOpen}
          isCentered
          className="rounded-none"
        >
          {/* chakra-radii-md: 0.375rem; */}
          <ModalOverlay /> {/* force scrollbar */}
          <ModalContent className="ml-5 mr-10">
            <ModalBody padding="0">
              <div className="modal-wallets grid sm:grid-cols-2 ">
                <div
                  className={`p-5 text-center cursor-pointer transition ${colorMode}`}
                  onClick={connectWallet}
                >
                  <img
                    src="/icons/metamask.svg"
                    width="64"
                    height="64"
                    className="mx-auto"
                  />
                  <h3 className="text-center font-bold text-xl">MetaMask</h3>
                  <p>Connect to your MetaMask Wallet</p>
                </div>
                {/*
                  <div className={`p-5 text-center cursor-pointer transition hover:${colorMode}`}>
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
                */}
                <div
                  className={`p-5 text-center cursor-pointer transition ${colorMode}`}
                  onClick={connectSequenceWallet}
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

      <Button onClick={() => navigate(`/${wallet.address}`)}>portfolio</Button>
      <Button
        colorScheme="red"
        backgroundColor="red.400"
        rightIcon={<AccountBalanceWalletIcon />}
        onClick={disconnectWallet}
      >
        disconnect
      </Button>
    </>
  );
}
