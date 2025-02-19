import React from 'react';
import {IconButton} from '@chakra-ui/react';
import {Tooltip} from '@/components/ui/tooltip';
import {useRouter} from 'next/navigation';
import {FaUser} from 'react-icons/fa';

const ProfileButton = () => {
	const router = useRouter();
	return (
		<Tooltip
			content="Перейти в профиль"
			openDelay={300}
			closeDelay={100}
		>
			<IconButton
				aria-label="Profile"
				onClick={() => router.push('/profile')}
			>
				<FaUser/>
			</IconButton>
		</Tooltip>
	);
};

export default ProfileButton;