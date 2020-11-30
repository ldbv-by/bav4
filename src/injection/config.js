import { $injector } from '.';
import { StoreService } from '../store/StoreService';
import { OlCoordinateService } from '../utils/OlCoordinateService';
import { EnvironmentService } from '../utils/EnvironmentService';

const http = { get: 'I\'m a http service.' };
const router = { get: 'I\'m a router.' };

$injector
	.registerSingleton('HttpService', http)
	.registerSingleton('RouterService', router)
	.register('CoordinateService', OlCoordinateService)
	.registerSingleton('EnvironmentService', new EnvironmentService(window))
	.registerSingleton('StoreService', new StoreService())
	.registerSingleton('SearchService', { getData : async () => [] });


export let init = true;