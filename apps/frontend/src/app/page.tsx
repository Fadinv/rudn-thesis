'use client';

import React from 'react';
import Home from '@/components/home/home';

export default function IndexPage() {
	return (
		<Home
			onCreatePortfolio={() => console.log('Создать портфель')}
			onEditPortfolio={(id) => console.log(`Редактировать портфель ${id}`)}
			onDeletePortfolio={(id) => console.log(`Удалить портфель ${id}`)}
			onAddStock={(portfolioId) => console.log(`Добавить акцию в портфель ${portfolioId}`)}
			onUpdateStock={(portfolioId, stockId) =>
				console.log(`Обновить акцию ${stockId} в портфеле ${portfolioId}`)
			}
		/>
	);
}
