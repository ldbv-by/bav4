import { Injector } from '../../../src/injection/core/injector';

//Configure injection...
const $injector = new Injector();
const http = { get: "I'm a http service." };
const router = { get: "I'm a router." };

$injector.registerSingleton('HttpService', http).registerSingleton('RouterService', router);

export { $injector, http, router };
