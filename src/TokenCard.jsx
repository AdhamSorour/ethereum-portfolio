import { Avatar, Box, Card, CardActionArea, CardContent, CardHeader, Typography } from "@mui/material";
import { utils } from "ethers";

export default function TokenCard({ token }) {
	function handleClick() { 
		window.open(`https://etherscan.io/address/${token.contractAddress}`, '_blank');
	}

	return (
		<Card>
			<CardActionArea onClick={handleClick}>
				<Box style={{ display: 'flex', justifyContent: 'space-between' }}>
					<CardHeader
						title={token.name}
						subheader={`$${token.symbol}`}
						style={{ wordBreak: 'break-word' }}
					/>
					{token.logo && <Avatar src={token.logo} sx={{ m: 1.5 }} />}
				</Box>
				<CardContent>
					<Typography variant="body1" fontWeight='bold'>
						Balance: {parseFloat(utils.formatUnits(token.tokenBalance, token.decimals)).toFixed(2)}
					</Typography>
				</CardContent>
			</CardActionArea>
		</Card>
	);
}