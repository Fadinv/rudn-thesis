import HomeButton from '@frontend/components/header/homeButton/homeButton';
import ProfileButton from '@frontend/components/header/profileButton/profileButton';
import {Logout} from '@frontend/components/home/logout/logout';
import {ColorModeButton} from '@frontend/components/ui/color-mode';
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