import { $injector } from '../../../injection';
import { BaObserver } from '../../BaObserver';
import { setCurrent } from './topics.action';


/**
 * @class
 */
export class TopicsObserver extends BaObserver {

	async _init() {
		const { TopicsService: topicsService } = $injector.inject('TopicsService');
		//no try-catch needed, service at least delivers a fallback
		await topicsService.init();
		//update store
		setCurrent(topicsService.default().id);
	}

	/**
	 * @override
	 * @param {store} store 
	 */
	async register() {
		return await this._init();
	}
}
