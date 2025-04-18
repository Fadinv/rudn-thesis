import {toaster} from '@frontend/components/ui/toaster';
import {client} from '@frontend/lib/apollo-client';
import {debounce} from '@frontend/lib/tools';

export async function logoutOutOfSession() {
	try {
		await client.resetStore();
	} catch (err) {
		console.error('Logout error:', err);
	}
}

const showToast = () => {
	toaster.create({
		title: 'Сессия завершена',
		description: 'Пожалуйста, войдите снова.',
		type: 'error',
	});
};

export const throttledLogoutOfSessionToast = debounce(showToast, 100);