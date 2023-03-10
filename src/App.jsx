import { useEffect, useState } from 'react'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { styled, alpha } from '@mui/material/styles';
import {
	AppBar,
	Toolbar,
	Box,
	Typography,
	InputBase,
	Button,
	Select,
	MenuItem,
	CssBaseline,
	Tabs,
	Tab,
	Grid,
	Card,
	CardContent,
	CardMedia,
	CardHeader,
	Avatar,
	CircularProgress,
	CardActionArea
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { ethers, utils } from 'ethers';
import { Alchemy, NftFilters, Utils } from 'alchemy-sdk';


function TokenGrid({ tokens, isLoading }) {
	const centerProps = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' };
	if (isLoading) {
		return (
			<Box sx={centerProps}>
				<CircularProgress />
			</Box>
		);
	}

	if (tokens.length === 0) {
		return (
			<Box sx={centerProps}>
				<Typography variant="h5">No Owned Tokens 😢</Typography>
			</Box>
		);
	}

	const handleClick = (token) => 
		window.open(`https://etherscan.io/address/${token.contractAddress}`, '_blank');

	return (
		<Grid container spacing={2}>
			{tokens.map((token, index) => (
				<Grid item key={index} xs={6} sm={4} md={3} lg={2}>
					<Card>
						<CardActionArea onClick={() => handleClick(token)}>
							<Box style={{ display: 'flex', justifyContent: 'space-between' }}>
								<CardHeader
									title={token.name}
									subheader={`$${token.symbol}`}
									style={{ wordBreak: 'break-word' }}
								/>
								{token.logo && <Avatar src={token.logo} sx={{ m: 1.5 }} />}
							</Box>
							<CardContent>
								<Typography variant="body1">
									Balance:
								</Typography>
								<Typography variant="body1" fontWeight='bold'>
									{Utils.formatUnits(token.tokenBalance, token.decimals)}
								</Typography>
							</CardContent>
						</CardActionArea>
					</Card>
				</Grid>
			))}
		</Grid>
	);
}

function NFTGrid({ nfts, isLoading }) {
	const centerProps = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' };
	if (isLoading) {
		return (
			<Box sx={centerProps}>
				<CircularProgress />
			</Box>
		);
	}

	if (nfts.length === 0) {
		return (
			<Box sx={centerProps}>
				<Typography variant="h5">No Owned NFTs 😢</Typography>
			</Box>
		);
	}

	const handleClick = (nft) =>
		window.open(`https://opensea.io/assets/${nft.contractAddress}/${nft.id}`, '_blank');

	return (
		<Grid container spacing={2}>
			{nfts.map((nft, index) => (
				<Grid item key={index} xs={6} sm={4} md={3} lg={2}>
					<Card>
						<CardActionArea onClick={() => handleClick(nft)}>
							<CardContent>
								<Typography variant="h5">
									{nft.title}
								</Typography>
								<Typography variant="h6">
									{` #${nft.id}`}
								</Typography>
								<Typography variant="body2" color="textSecondary">
									{` $${nft.symbol}`}
								</Typography>
							</CardContent>

							{nft.media &&
								(nft.media.format == 'mp4' ? (
									<CardMedia component='video' autoPlay loop>
										<source src={nft.media.raw} type='video/mp4' />
									</CardMedia>
								) : (
									<CardMedia
										component="img"
										image={nft.media.gateway}
										alt={nft.symbol}
									/>
								))
							}
						</CardActionArea>
					</Card>
				</Grid>
			))}
		</Grid>
	);
}

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

const Search = styled('div')(({ theme }) => ({
	position: 'relative',
	borderRadius: theme.shape.borderRadius,
	backgroundColor: alpha(theme.palette.common.white, 0.15),
	'&:hover': {
		backgroundColor: alpha(theme.palette.common.white, 0.25),
	},
	marginRight: theme.spacing(2),
	marginLeft: 0,
	width: '100%',
	[theme.breakpoints.up('sm')]: {
		marginLeft: theme.spacing(3),
		width: 'auto',
	},
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
	padding: theme.spacing(0, 2),
	height: '100%',
	position: 'absolute',
	pointerEvents: 'none',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
	color: 'inherit',
	'& .MuiInputBase-input': {
		padding: theme.spacing(1, 1, 1, 0),
		// vertical padding + font size from searchIcon
		paddingLeft: `calc(1em + ${theme.spacing(4)})`,
		transition: theme.transitions.create('width'),
		width: '100%',
		[theme.breakpoints.up('sm')]: {
			width: '12ch',
			'&:focus': {
				width: '45ch',
				'&::placeholder': {
					color: 'transparent',
				},
			},
		},
	},
}));

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

function App() {
	const [currnetAddress, setCurrentAddress] = useState("0x276417be271dbeb696cb97cda7c6982fd89e6bd4"); // vitalik's address
	const [walletAddress, setWalletAddress] = useState();
	const [network, setNetwork] = useState('eth-mainnet');
	const [tab, setTab] = useState(0);

	const [loading, setLoading] = useState(false);
	const [tokens, setTokens] = useState([]);
	const [nfts, setNfts] = useState([]);


	const shorten = address => address.slice(0, 4) + "..." + address.slice(-4);

	useEffect(() => {
		window.ethereum?.request({ method: 'eth_accounts' }).then(accounts => {
			setWalletAddress(accounts[0]);
		});

		window.ethereum?.on('accountsChanged', accounts => {
			setWalletAddress(accounts[0]);
		});
	}, []);

	useEffect(() => {
		createPortfolio(currnetAddress);
	}, [network, currnetAddress])

	function connect() {
		if (!window.ethereum) {
			alert("No Wallet Detected!\nPlease install Metamask");
		}
		// send request to prompt a connection
		// we don't need to wait for result since we set up a listener (App.js:56)
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		provider.send("eth_requestAccounts", []);
	}

	async function loadTokens(address, alchemy) {
		const tokenData = await alchemy.core.getTokenBalances(address);
		// console.log('TOKENDATA',tokenData);

		const tokenMetadata = await Promise.allSettled(
			tokenData.tokenBalances.map(
				token => alchemy.core.getTokenMetadata(token.contractAddress)
			)
		);
		// console.log('TOKENMETADATA',tokenMetadata);

		const tokenInfo = [];
		for (let i = 0; i < tokenMetadata.length; i++) {
			if (tokenMetadata[i].status === "fulfilled") {
				tokenInfo.push({
					...tokenData.tokenBalances[i],
					...tokenMetadata[i].value
				});
			}
		}

		console.log(tokenInfo);
		setTokens(tokenInfo);
	}

	async function loadNFTs(address, alchemy) {
		const nftData = network === 'eth-mainnet' ?
			await alchemy.nft.getNftsForOwner(address, {
				excludeFilters: [NftFilters.SPAM]
			}) : await alchemy.nft.getNftsForOwner(address);

		// console.log('NFTDSATA', nftData)

		const nftInfo = nftData.ownedNfts
			.map(nft => {
				return {
					contractAddress: nft.contract.address,
					title: nft.contract.name || nft.title,
					symbol: nft.contract.symbol,
					media: nft.media[0],
					id: nft.tokenId,
					floor: nft.contract.openSea.floorPrice
				}
			}
			);
		// console.log('NFTINFO',nftInfo);

		setNfts(nftInfo);
	}

	async function createPortfolio(address) {
		if (!utils.isAddress(address)) {
			alert("Invalid Address\nMake sure you enter a valid Ethereum address");
			return;
		}

		const alchemy = new Alchemy({
			apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
			network,
		});

		setLoading(true);

		await loadTokens(address, alchemy);
		await loadNFTs(address, alchemy);

		setLoading(false);
	}

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<AppBar position="static">
				<Toolbar>
					<Typography
						variant="h4"
						noWrap
						component="div"
						sx={{ display: { xs: 'none', sm: 'block' } }}
					>
						Ethereum Portfolio
					</Typography>
					<Search>
						<SearchIconWrapper>
							<SearchIcon />
						</SearchIconWrapper>
						<StyledInputBase
							placeholder="0x00...0000"
							inputProps={{ 'aria-label': 'search' }}
							// onChange={e => setInputAddress(e.target.value)}
							onKeyDown={e => { if (e.key === 'Enter') setCurrentAddress(e.target.value) }}
						/>
					</Search>
					<Box sx={{ flexGrow: 1 }} />
					<Select
						sx={{ m: 2 }}
						value={network}
						onChange={e => setNetwork(e.target.value)}
						size="small"
					>
						<MenuItem value='eth-mainnet'>Mainnet</MenuItem>
						<MenuItem value='eth-goerli'>Goerli</MenuItem>
					</Select>
					<Button
						variant='outlined'
						endIcon={
							<FiberManualRecordIcon
								fontSize='small'
								color={walletAddress ? "success" : "error"}
							/>
						}
						onClick={walletAddress ?
							() => setCurrentAddress(walletAddress) : connect
						}
					>
						{walletAddress ? shorten(walletAddress) : "Connect"}
					</Button>
				</Toolbar>
			</AppBar>
			<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
				<Tabs value={tab} onChange={(_, v) => setTab(v)} centered >
					<Tab label="NFTs" value={0} />
					<Tab label="Tokens" value={1} />
				</Tabs>
			</Box>
			<TabPanel value={tab} index={0}>
				<NFTGrid nfts={nfts} isLoading={loading} />
			</TabPanel>
			<TabPanel value={tab} index={1}>
				<TokenGrid tokens={tokens} isLoading={loading} />
			</TabPanel>
		</ThemeProvider>
	);
}

export default App;
