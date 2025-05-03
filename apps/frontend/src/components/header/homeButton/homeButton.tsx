'use client';
import React from 'react';
import {Button} from '@chakra-ui/react';
import {Tooltip} from '@frontend/components/ui/tooltip';
import {usePathname, useRouter} from 'next/navigation';
import {FaHome} from 'react-icons/fa';

const HomeButton = () => {
	const router = useRouter();
	const pathname = usePathname();

	if (pathname === '/') return null;

	return (
		<Tooltip
			content="На главную"
			openDelay={300}
			closeDelay={100}
		>
			<Button colorPalette="black" variant="outline" onClick={() => router.push('/')}>
				<FaHome/>
				Portfolio Analyzer
			</Button>
		</Tooltip>
	);
};

export default HomeButton;