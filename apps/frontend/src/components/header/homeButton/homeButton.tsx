import React from 'react';
import {IconButton} from '@chakra-ui/react';
import {Tooltip} from '@/components/ui/tooltip';
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
			<IconButton onClick={() => router.push('/')}>
				<FaHome/>
			</IconButton>
		</Tooltip>
	);
};

export default HomeButton;