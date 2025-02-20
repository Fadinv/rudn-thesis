'use client';

import Home from '@/components/home/home';
import {Center} from '@chakra-ui/react';
import {useEffect} from 'react';

export default function IndexPage() {
	useEffect(() => {
		fetch('https://api.polygon.io/v3/reference/tickers?market=stocks&active=true&limit=1000&apiKey=_0LJipyYoitCKXGgB2f4xpJAcEPm8bD0')
			.then(res => res.json())
			.then((res) => {
				console.log('response', res, res.results[0]);
				console.log(res.results[0] && JSON.stringify(res.results[0]))
			})
			.catch((e) => {
				console.error('ERROR: ', e);
			})
	}, []);

	return (
		<Center>
			<Home/>
		</Center>
	);
}
