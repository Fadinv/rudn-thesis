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

const showOutOfSessionToast = () => {
	toaster.create({
		title: 'Сессия завершена',
		description: 'Пожалуйста, войдите снова.',
		type: 'error',
	});
};

const showInvalidTokenToast = () => {
	toaster.create({
		title: 'Недействительный токен',
		description: 'Пожалуйста, уточните правильность токена. Вероятно он истек.',
		type: 'error',
	});
};

export const throttledLogoutOfSessionToast = debounce(showOutOfSessionToast, 100);
export const throttledInvalidTokenToast = debounce(showInvalidTokenToast, 100);