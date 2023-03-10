import { Card, CardActionArea, CardContent, CardMedia, Typography } from "@mui/material";

export default function NftCard({ nft }) {
	function handleClick() {
		window.open(`https://opensea.io/assets/${nft.contractAddress}/${nft.id}`, '_blank');
	}

	return (
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
	);
}