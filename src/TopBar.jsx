import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import {
	AppBar,
	Toolbar,
	Box,
	Typography,
	InputBase,
	Button,
	Select,
	MenuItem
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { ethers } from 'ethers';

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


export default function TopBar({
	network,
	setNetwork,
	walletAddress,
	setCurrentAddress,
}) {
	const shorten = address => address.slice(0, 4) + "..." + address.slice(-4);

	function connect() {
		if (!window.ethereum) {
			alert("No Wallet Detected!\nPlease install Metamask");
		}
		// send request to prompt a connection
		// we don't need to wait for result since we set up a listener (App.js:56)
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		provider.send("eth_requestAccounts", []);
	}

	return (
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
	);
}

