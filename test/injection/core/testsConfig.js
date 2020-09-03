import { Injector } from '../../../src/injection/core/injector';

//Configure injection...
var $injector = new Injector();
var http  = { get: "I'm a http service." };
var router = { get: "I'm a router."};

$injector.registerSingleton("HttpService", http)
	.registerSingleton("RouterService", router);

export { $injector, http, router };