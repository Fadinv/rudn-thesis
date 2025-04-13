'use client';

import React from 'react';
import Home from '@frontend/components/home/home';

export default function IndexPage() {
	return (
		<Home
			onAddStock={(portfolioId) => console.log(`Добавить акцию в портфель ${portfolioId}`)}
			onUpdateStock={(portfolioId, stockId) =>
				console.log(`Обновить акцию ${stockId} в портфеле ${portfolioId}`)
			}
		/>
	);
}
