import { Injector } from '../../../src/injection/core/injector';

//Configure injection...
let $injector = new Injector();
let http  = { get: 'I\'m a http service.' };
let router = { get: 'I\'m a router.' };

$injector.registerSingleton('HttpService', http)
	.registerSingleton('RouterService', router);

export { $injector, http, router };