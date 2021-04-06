import { TopicsPlugin } from '../../topics/store/TopicsPlugin';

export const topicsModule = ($injector) => {
	$injector
		.registerSingleton('TopicsPlugin', new TopicsPlugin());
};