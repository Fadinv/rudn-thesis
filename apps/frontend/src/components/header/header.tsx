'use client';
import HomeButton from '@frontend/components/header/homeButton/homeButton';
import LoginButton from '@frontend/components/loginButton/loginButton';
import {ColorModeButton} from '@frontend/components/ui/color-mode';
import {ProfileMenu} from '@frontend/components/header/profileMenu';
import {Flex} from '@chakra-ui/react';
import {useCurrentUserQuery} from '@frontend/generated/graphql-hooks';
import {FC} from 'react';


interface HeaderProps {
	doNotRedirect?: boolean;
}

const Header: FC<HeaderProps> = ({doNotRedirect}) => {
	const {data, called, loading} = useCurrentUserQuery({fetchPolicy: 'cache-first'});

	if (!called || loading) return null;

	const hasUser = !!data?.currentUser;

	return (
		<Flex width="100%" justify="space-between" align="center" mb={6} px={4}>
			<Flex gap={4}>
				<HomeButton/>
			</Flex>
			<Flex gap={4}>
				<ColorModeButton/>
				{hasUser ? <ProfileMenu/> : <LoginButton size={'xs'} doNotRedirect={doNotRedirect}/>}
			</Flex>
		</Flex>
	);
};

export default Header;