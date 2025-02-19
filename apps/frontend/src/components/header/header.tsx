import HomeButton from '@/components/header/homeButton/homeButton';
import ProfileButton from '@/components/header/profileButton/profileButton';
import {Logout} from '@/components/home/logout/logout';
import {ColorModeButton} from '@/components/ui/color-mode';
import {Flex} from '@chakra-ui/react';
import React from 'react';

const Header = () => {
	return (
		<Flex justify="space-between" align="center" mb={6}>
			<Flex gap={4}>
				<HomeButton/>
			</Flex>
			<Flex gap={4}>
				<ColorModeButton/>
				<ProfileButton/>
				<Logout/>
			</Flex>
		</Flex>
	);
};

export default Header;