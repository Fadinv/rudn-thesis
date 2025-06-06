import {Controller, Get} from '@nestjs/common';
import {AppService} from '@backend/app/app.service';

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get()
	healthCheck(): boolean {
		return this.appService.healthCheck();
	}
}
