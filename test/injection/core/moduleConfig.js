export const myModule = ($injector) => {
	const http = { get: "I'm a http service." };
	const router = { get: "I'm a router." };
	$injector.registerSingleton('HttpService', http).registerSingleton('RouterService', router);
};
