import { $injector } from '.';
import { StoreService } from '../store/StoreService';
import { OlCoordinateService } from '../utils/OlCoordinateService';

const http = { get: 'I\'m a http service.' };
const router = { get: 'I\'m a router.' };

$injector
	.registerSingleton('HttpService', http)
	.registerSingleton('RouterService', router)
	.register('CoordinateService', OlCoordinateService)
	.registerSingleton('StoreService', new StoreService());


export let init = true;