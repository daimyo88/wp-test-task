import icon1 from '../assets/icons/icon1.png';
import icon2 from '../assets/icons/icon2.png';
import icon3 from '../assets/icons/icon3.png';

export const ICONS = [
	{
		name: 'default',
	},
	{
		name: 'Icon 1',
		src: icon1,
	},
	{
		name: 'Icon 2',
		src: icon2,
	},
	{
		name: 'Icon 3',
		src: icon3,
	},
];

export const DEFAULT_MARKER = {
	id: Date.now(),
	title: 'New Marker',
	description: 'Marker description',
	lat: '0',
	lng: '0',
	icon: 'default',
};
