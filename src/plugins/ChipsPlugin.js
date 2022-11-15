// import { $injector } from '../injection';
// import { QueryParameters } from '../domain/queryParameters';
import { BaPlugin } from './BaPlugin';
import { setCurrent } from '../store/chips/chips.action';


/**
 * @class
 */
export class ChipsPlugin extends BaPlugin {

	//TODO
	// _addChipsFromQueryParams(queryParams) {
	// }

	_addChipsFromConfig() {
		// 	//TODO
		// const { ChipsConfigurationService: ChipsConfigurationService } = $injector.inject('ChipsConfigurationService');

		//update store
		setCurrent(
			[
				{
					'id': 'foo',
					'title': 'zur Denkmalliste', // required
					'href': 'http://localhost:8383/DenkmalAtlas-2/liste.html', // required
					'permanent': false, // required
					'target': 'modal', // required ["modal", "external"]
					'observer': { // required [object, null]
						'geoResources': [ // required
							'6f5a389c-4ef3-4b5a-9916-475fd5c5962b',
							'd0e7d4ea-62d8-46a0-a54a-09654530beed'
						],
						'topics': [ // required
							'denkmal'
						]
					},
					'style': { // required
						'color': 'rgb(54, 157, 201)', // required
						'background-color': '#fff', // required
						'icon': null // required [String, null]
					}
				},
				{
					'id': 'bar',
					'title': 'Erste Schritte',
					'href': 'https://www.geodaten.bayern.de/bayernatlas-info/grundsteuer-firststeps/index.html',
					'permanent': true,
					'target': 'external',
					'observer': null,
					'style': {
						'color': 'rgb(54, 157, 201)',
						'background-color': '#000',
						'icon': '<path d=\'M6.371 8.107l-0.43 0.367c0.462 0.542 1.028 1.822 1.459 3.219s0.747 2.925 0.809 4.002l0.563-0.033c-0.066-1.155-0.39-2.703-0.832-4.135s-0.98-2.731-1.568-3.42z\'></path>'
					}
				}
			]



		);
	}

	async _init() {
		this._addChipsFromConfig();

	}

	/**
	 * @override
	 * @param {store} store
	 */
	async register() {
		return await this._init();
	}
}
