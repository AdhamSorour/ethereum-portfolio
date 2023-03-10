import { Box, CircularProgress, Grid, Typography } from "@mui/material";
import NftCard from "./NftCard";
import TokenCard from "./TokenCard";

export default function CardGrid({ items, type, isLoading }) {
	const centerContentProps = {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		height: '50vh'
	};

	if (isLoading) {
		return (
			<Box sx={centerContentProps}>
				<CircularProgress />
			</Box>
		);
	}

	if (items.length === 0) {
		return (
			<Box sx={centerContentProps}>
				<Typography variant="h6">Nothing Found 😢</Typography>
			</Box>
		);
	}

	return (
		<Grid container spacing={2}>
			{items.map((item, index) =>(
				<Grid item key={index} xs={6} sm={4} md={3} lg={2}>
					{type === "nft"?  <NftCard nft={item} /> : <TokenCard token={item} />}
				</Grid>
			))}
		</Grid>
	);
}