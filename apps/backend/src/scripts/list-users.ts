import {NestFactory} from '@nestjs/core';
import {AppModule} from '@backend/app/app.module';
import {UsersService} from '@backend/modules/users/users.service';
import {PortfolioService} from '@backend/modules/portfolio/application/portfolio.service';
import {PortfolioReportService} from '@backend/modules/portfolio-report/application/portfolio-report.service';

async function main() {
	const app = await NestFactory.createApplicationContext(AppModule);

	const usersService = app.get(UsersService);
	const portfolioService = app.get(PortfolioService);
	const reportService = app.get(PortfolioReportService);

	const users = await usersService.findAll(); // метод должен вернуть список всех пользователей
	for (const user of users) {
		console.log(`📨 Пользователь: (ID: ${user.id}) ${user.email}. Telegram: ${!!user.telegramId ? '+' : '-'}`);
		const portfolios = await portfolioService.getUserPortfolios(user);

		if (!portfolios?.items?.length) {
			console.log('  └─ 🗂️ Портфелей нет');
			continue;
		}

		for (const portfolio of portfolios.items) {
			console.log(`  └─ 📁 ${portfolio.name}`);

			const reports = await reportService.getReportsByPortfolio(portfolio.id);
			if (!reports.length) {
				console.log(`     └─ 📉 Отчётов нет`);
			} else {
				const byStatus: Record<string, number> = {};
				for (const report of reports) {
					byStatus[report.status] = (byStatus[report.status] || 0) + 1;
				}

				for (const [status, count] of Object.entries(byStatus)) {
					console.log(`     └─ ${status}: ${count}`);
				}
			}
		}
	}

	await app.close();
}

main().catch(console.error);
