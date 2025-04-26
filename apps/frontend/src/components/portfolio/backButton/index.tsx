import {IconButton} from '@chakra-ui/react';
import {FiArrowLeft} from 'react-icons/fi';
import React from 'react';

interface BackButtonProps {
	onClick: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({onClick}) => {
	return (
		<IconButton
			aria-label="Назад"
			variant="ghost"
			size="sm"
			onClick={onClick}
		>
			<FiArrowLeft/>
		</IconButton>
	);
};

export default BackButton;