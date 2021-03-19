import { TopicsObserver } from '../../topics/store/TopicsObserver';

export const topicsModule = ($injector) => {
	$injector
		.registerSingleton('TopicsObserver', new TopicsObserver());
};