import { useEffect, useState } from 'react'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
	Box,
	Typography,
	CssBaseline,
	Tabs,
	Tab,
	Link,
} from '@mui/material';
import { utils } from 'ethers';
import { Alchemy, NftFilters, Utils } from 'alchemy-sdk';
import TopBar from './TopBar';
import CardGrid from './CardGrid';

const theme = createTheme({
	palette: {
		mode: 'dark',
		primary: {
			main: '#AAAAAA',
		},
		secondary: {
			main: '#f50057',
		},
	},
});

function TabPanel(props) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`simple-tabpanel-${index}`}
			aria-labelledby={`simple-tab-${index}`}
			{...other}
		>
			{value === index && (
				<Box sx={{ p: 3 }}>
					<Typography>{children}</Typography>
				</Box>
			)}
		</div>
	);
}

function UserInfo({ address, balance }) {
  return (
    <Box sx={{ p: 2 }}>
			<Link
				variant='h6'
				color="#FFFFFF"
				underline='hover'
				href={`https://etherscan.io/address/${address}`}
				target="_blank"
			>
			 {address}
			</Link>
      <Typography variant="subtitle1">
        ETH Balance: {balance}
      </Typography>
    </Box>
  );
}


function App() {
	const [currnetAddress, setCurrentAddress] = useState("0x276417be271dbeb696cb97cda7c6982fd89e6bd4"); // random address
	const [walletAddress, setWalletAddress] = useState();
	const [network, setNetwork] = useState('eth-mainnet');
	const [tab, setTab] = useState(0);

	const [loading, setLoading] = useState(false);
	const [balance, setBalance] = useState();
	const [tokens, setTokens] = useState([]);
	const [nfts, setNfts] = useState([]);


	useEffect(() => {
		const setActiveAccount = accounts => setWalletAddress(accounts[0]);

		window.ethereum?.request({ method: 'eth_accounts' }).then(setActiveAccount);
		window.ethereum?.on('accountsChanged', setActiveAccount);

    return () => {
			window.ethereum?.removeListener('accountsChanged', setActiveAccount);
    };
	}, []);

	useEffect(() => {
		async function createPortfolio() {
			if (!utils.isAddress(currnetAddress)) {
				alert("Invalid Address\nMake sure you enter a valid Ethereum address");
				return;
			}
	
			const alchemy = new Alchemy({
				apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
				network,
			});
	
			setLoading(true);
	
			const ethBalance = await alchemy.core.getBalance(currnetAddress);
			setBalance(parseFloat(Utils.formatEther(ethBalance)).toFixed(4));
	
			await loadTokens(currnetAddress, alchemy);
			await loadNFTs(currnetAddress, alchemy);
	
			setLoading(false);
		}

		createPortfolio();
	}, [network, currnetAddress])


	async function loadTokens(address, alchemy) {
		const tokenData = await alchemy.core.getTokenBalances(address);

		const tokenMetadata = await Promise.allSettled(
			tokenData.tokenBalances.map(
				token => alchemy.core.getTokenMetadata(token.contractAddress)
			)
		);

		const tokenInfo = [];
		for (let i = 0; i < tokenMetadata.length; i++) {
			if (tokenMetadata[i].status === "fulfilled") {
				tokenInfo.push({
					...tokenData.tokenBalances[i],
					...tokenMetadata[i].value
				});
			}
		}

		setTokens(tokenInfo);
	}

	async function loadNFTs(address, alchemy) {
		const nftData = network === 'eth-mainnet' ?
		await alchemy.nft.getNftsForOwner(address, {
			excludeFilters: [NftFilters.SPAM]
		}) : 
		await alchemy.nft.getNftsForOwner(address); // spam filters dont exist on other networks

		const nftInfo = nftData.ownedNfts.map(nft => {
			return {
				contractAddress: nft.contract.address,
				title: nft.contract.name || nft.title,
				symbol: nft.contract.symbol,
				media: nft.media[0],
				id: nft.tokenId,
			}
		});

		setNfts(nftInfo);
	}

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<TopBar 
				network={network}
				setNetwork={setNetwork}
				walletAddress={walletAddress}
				setCurrentAddress={setCurrentAddress}
			/>
			<UserInfo
        address={currnetAddress} balance={balance}
      />
			<Box 
				sx={{
					bgcolor: 'background.paper',
					borderBottom: 1,
					borderColor: 'divider',
					position: 'sticky',
					top: 0,
					zIndex: 1,
				}}
			>
				<Tabs value={tab} onChange={(_, v) => setTab(v)} centered >
					<Tab label="NFTs" value={0} />
					<Tab label="Tokens" value={1} />
				</Tabs>
			</Box>
			<TabPanel value={tab} index={0}>
				<CardGrid type="nft" items={nfts} isLoading={loading} />
			</TabPanel>
			<TabPanel value={tab} index={1}>
				<CardGrid type="tokens" items={tokens} isLoading={loading} />
			</TabPanel>
		</ThemeProvider>
	);
}

export default App;
