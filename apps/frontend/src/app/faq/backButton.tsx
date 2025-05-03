'use client';
import {Button, Icon} from '@chakra-ui/react';
import {useRouter} from 'next/navigation';
import React, {useCallback} from 'react';
import {LuArrowLeft} from 'react-icons/lu';

const BackButton = () => {
	const router = useRouter();

	const onClick = useCallback(() => {
		if (window.history.length > 1) {
			router.back();
		} else {
			router.push('/');
		}
	}, [router]);

	return (
		<Button
			variant="ghost"
			size="sm"
			onClick={onClick}
		>
			<Icon as={LuArrowLeft}/>
			Назад
		</Button>
	);
};

export default BackButton;