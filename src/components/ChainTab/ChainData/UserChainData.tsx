import React, { useEffect } from 'react';

// State
import { useSelector } from 'react-redux';
// import { changeChainTab, chainTabState } from '../../../state/tab/tabSlice';
import { settingsState } from '../../../state/settings/settingsSlice';

// Data
import { useInfiniteQuery } from 'react-query';
import axios from 'axios';
import chains from '../../../data'; // placeholder data

// Chakra UI
import { useToast, Button } from '@chakra-ui/react';

// Components
import NFTCollection from '../../NFTCollection/NFTCollection';
import toast from '../../../components/Toast/Toast';

/* interface ChainProps {
  name: string;
  abbr: string;
  loaded: boolean;
  count: number;
  order: number;
  total: number;
}

interface Chains {
  [key: string]: ChainProps;
}

interface Props {
  chain: string;
  chainTabSet: boolean;
  chains: Chains;
  q: string;
  location: Location;
  wallet: string;
  //onChains: Function;
  //onChainTabSet: onChainTabSet
} */

function UserChainData(props) {
  // State
  const settings = useSelector(settingsState);

  const toastInstance = useToast();

  const chain = props.chain;

  const fetchNfts = async ({ pageParam = '' }) => {
    // reset UI state
    // only reset chain states when it's a fresh query, not more NFTs loaded to each tab
    /* if (pageParam === "") {
      console.log("no start param ")
      dispatch(changeChainTab(-1));
      props.onChainTabSet(false);
    } */

    props.onChains({
      name: chains[chain]['name'],
      abbr: chain,
      order: chains[chain]['order'],
      loaded: false,
      count: 0,
    });

    // old
    /* const { data } = await axios(
      `/api/nfts/chain/${chain}/address/${props.wallet}/limit/${settings.walletLimit}/` + pageParam
    ); */

    // new test
    const { data } = await axios(
      `/api/resolve/chain/${chain}/address/${props.wallet}/limit/${settings.limit}/` +
        pageParam
    );

    // console.log("Request:", `/api/resolve/chain/${chain}/address/${props.wallet}/limit/${settings.walletLimit}/` + pageParam)

    const nftCount = Object.values(data.data).flat().length;

    return {
      [chain]: {
        name: chains[chain]['name'],
        abbr: chain,
        order: chains[chain]['order'],
        data,
        loaded: true,
        count: nftCount,
        total: nftCount,
      },
    };
  };

  const { data, error, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery(
      ['userNfts', props.location, props.wallet, props.chain],
      fetchNfts,
      {
        retry: 1,
        getNextPageParam: (lastPage) => lastPage[chain].data.cursor, // only return valid cursor if not empty, otherwise return undefined to make this the last page,
      }
    );

  useEffect(() => {
    if (data) {
      const nftTotals = data.pages.reduce((acc, element) => {
        const nftCount = Object.values(element)[0]['count'];

        return acc + nftCount;
      }, 0);

      data.pages[0][chain].total = nftTotals;

      props.onChains(data.pages[0][chain]);

      // set the chain tab to one that has NFTs and only set it once i.e. the first loaded tab
      /*if (data.pages[0][chain].count > 0 && !props.chainTabSet) {
        //console.log('setting chain tab', chains[chain].order);
        console.log('current tab setting');
        //dispatch(changeChainTab(chains[chain].order));
        //props.onChainTabSet(true);
      } */
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      const noData = {
        name: chains[chain]['name'],
        abbr: chain,
        order: chains[chain]['order'],
        data: {
          data,
        },
        loaded: true,
        count: 0,
        total: 0,
      };

      props.onChains(noData);

      toast(toastInstance, 'error', 'Invalid address.');
    }
  }, [error]);

  if (!data) return null;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7 4xl:grid-cols-8 gap-10">
        {data.pages.map((page) => {
          return Object.keys(page[chain].data.data).map((collection) => (
            <NFTCollection
              key={page[chain].data.data[collection]}
              collection={page[chain].data.data[collection]}
              type={page[chain].data}
              chain={chain}
            />
          ));
        })}
      </div>

      <div className="text-center mt-5">
        {hasNextPage && (
          <Button
            type="submit"
            onClick={() => fetchNextPage()}
            disabled={!hasNextPage || isFetchingNextPage}
            isLoading={isFetchingNextPage}
            loadingText="Loading"
            spinnerPlacement="end"
            colorScheme="blue"
            lineHeight="1"
          >
            Load More +{settings.limit}
          </Button>
        )}
      </div>
    </>
  );
}

export default React.memo(UserChainData);
