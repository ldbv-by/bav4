import { $injector } from '../../../injection';
import { BaObserver } from '../../BaObserver';


/**
 * @class
 */
export class TopicsObserver extends BaObserver {

	async _init() {
		const { TopicsService: topicsService } = $injector.inject('TopicsService');
		//no try-catch needed, service at least delivers a fallback
		await topicsService.init();
	}

	/**
	 * @override
	 * @param {store} store 
	 */
	async register() {
		return await this._init();
	}
}
