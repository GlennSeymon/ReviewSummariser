import { RiStarSmileFill, RiStarSmileLine } from 'react-icons/ri';

interface Props {
	rating: number;
}

const StarRating = ({ rating }: Props) => {
	const placeholders = [1, 2, 3, 4, 5];

	return (
		<div className='flex gap-1 text-yellow-500'>
			{placeholders.map((p) =>
				p < rating ? <RiStarSmileFill key={p} /> : <RiStarSmileLine key={p} />
			)}
		</div>
	);
};

export default StarRating;
