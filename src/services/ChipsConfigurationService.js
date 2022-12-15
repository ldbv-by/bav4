import { $injector } from '../injection';
import { loadBvvChipConfiguration } from './provider/chipsConfiguration.provider.test';

/**
 * @class
 * @author alsturm
 * @author taulinger
 */
export class ChipsConfigurationService {

	constructor(provider = loadBvvChipConfiguration) {
		this._provider = provider;
		this._configurations = null;
		const { EnvironmentService: environmentService } = $injector.inject('EnvironmentService');
		this._environmentService = environmentService;
	}

	/**
	 * Loads all available Chip configurations and caches them internally.
	 * If loading fails a fallback is delivered if app is in standalone mode
	 * @public
	 * @async
	 * @returns {Promise<Array<ChipConfiguration>>}
	 */
	async all() {
		if (!this._configurations) {
			try {
				this._configurations = await this._provider();
			}
			catch (e) {
				this._configurations = [];
				if (this._environmentService.isStandalone()) {
					this._configurations.push(...this._newFallbackConfiguration());
					console.warn('Chips configuration could not be fetched from backend. Using fallback configuration ...');
				}
				else {
					console.error('Chips configuration could not be fetched from backend.', e);
				}
			}
		}
		return this._configurations;
	}

	_newFallbackConfiguration() {
		return [
			{
				'id': 'foo',
				'title': 'geoResources', // required
				'href': 'https://geoportal.bayern.de/denkmalatlas/liste.html', // required
				'permanent': false, // required
				'target': 'external', // required ["modal", "external"]
				'observer': { // required [object, null]
					'geoResources': [ // required
						'luftbild'
					],
					'topics': [ // required

					]
				},
				'style': { // required
					'colorLight': 'var(--primary-color)', // required
					'backgroundColorLight': 'var(--primary-bg-color)', // required
					'colorDark': 'var(--primary-color)', // required
					'backgroundColorDark': 'var(--primary-bg-color)', // required
					'icon': '<path d="M8.5 6.5a.5.5 0 0 0-1 0v3.793L6.354 9.146a.5.5 0 1 0-.708.708l2 2a.5.5 0 0 0 .708 0l2-2a.5.5 0 0 0-.708-.708L8.5 10.293V6.5z"/><path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z"/>'
				}
			},
			{
				'id': 'bar',
				'title': 'BR-Radeltour',
				'href': 'https://www.geodaten.bayern.de/bayernatlas-info/grundsteuer-firststeps/index.html',
				'permanent': true,
				'target': 'modal',
				'observer': null,
				'style': {
					'colorLight': 'var(--primary-color)', // required
					'backgroundColorLight': 'var(--primary-bg-color)', // required
					'colorDark': 'var(--primary-color)', // required
					'backgroundColorDark': 'var(--primary-bg-color)', // required
					'icon': '<path d="M5 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/><path d="m2.165 15.803.02-.004c1.83-.363 2.948-.842 3.468-1.105A9.06 9.06 0 0 0 8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6a10.437 10.437 0 0 1-.524 2.318l-.003.011a10.722 10.722 0 0 1-.244.637c-.079.186.074.394.273.362a21.673 21.673 0 0 0 .693-.125zm.8-3.108a1 1 0 0 0-.287-.801C1.618 10.83 1 9.468 1 8c0-3.192 3.004-6 7-6s7 2.808 7 6c0 3.193-3.004 6-7 6a8.06 8.06 0 0 1-2.088-.272 1 1 0 0 0-.711.074c-.387.196-1.24.57-2.634.893a10.97 10.97 0 0 0 .398-2z"/>'
				}
			},
			{
				'id': 'ch',
				'title': 'Denkmäler suchen',
				'href': 'https://google.com',
				'permanent': false,
				'target': 'extern',
				'observer': null,
				'style': {
					'colorLight': 'var(--primary-color)', // required
					'backgroundColorLight': 'var(--primary-bg-color)', // required
					'colorDark': 'var(--primary-color)', // required
					'backgroundColorDark': 'var(--primary-bg-color)', // required
					'icon': null
				}
			},
			{
				'id': 'ch',
				'title': 'Denkmalliste',
				'href': 'https://google.com',
				'permanent': false,
				'target': 'extern',
				'observer': null,
				'style': {
					'colorLight': 'var(--primary-color)', // required
					'backgroundColorLight': 'var(--primary-bg-color)', // required
					'colorDark': 'var(--primary-color)', // required
					'backgroundColorDark': 'var(--primary-bg-color)', // required
					'icon': null
				}
			},
			{
				'id': 'ch',
				'title': 'Infos',
				'href': 'https://google.com',
				'permanent': false,
				'target': 'extern',
				'observer': null,
				'style': {
					'colorLight': 'var(--primary-color)', // required
					'backgroundColorLight': 'var(--primary-bg-color)', // required
					'colorDark': 'var(--primary-color)', // required
					'backgroundColorDark': 'var(--primary-bg-color)', // required
					'icon': null
				}
			},
			{
				'id': 'ch',
				'title': 'Ich Teste Gerne',
				'href': 'https://google.com',
				'permanent': false,
				'target': 'extern',
				'observer': null,
				'style': {
					'colorLight': 'var(--primary-color)', // required
					'backgroundColorLight': 'var(--primary-bg-color)', // required
					'colorDark': 'var(--primary-color)', // required
					'backgroundColorDark': 'var(--primary-bg-color)', // required
					'icon': null
				}
			},
			{
				'id': 'ch',
				'title': 'Ich arbeite schwer für mein Geld',
				'href': 'https://google.com',
				'permanent': false,
				'target': 'extern',
				'observer': null,
				'style': {
					'colorLight': 'var(--primary-color)', // required
					'backgroundColorLight': 'var(--primary-bg-color)', // required
					'colorDark': 'var(--primary-color)', // required
					'backgroundColorDark': 'var(--primary-bg-color)', // required
					'icon': null
				}
			},
			{
				'id': 'ea',
				'title': 'Theme',
				'href': 'https://www.karten.energieatlas.bayern.de/',
				'permanent': false,
				'target': 'extern',
				'observer': { // required [object, null]
					'geoResources': [ // required
						'6f5a389c-4ef3-4b5a-9916-475fd5c5962b',
						'd0e7d4ea-62d8-46a0-a54a-09654530beed'
					],
					'topics': [ // required
						'eab'
					]
				},
				'style': {
					'colorLight': 'var(--primary-color)', // required
					'backgroundColorLight': 'var(--primary-bg-color)', // required
					'colorDark': 'var(--primary-color)', // required
					'backgroundColorDark': 'var(--primary-bg-color)', // required
					'icon': null
				}
			},
			{
				'id': 'bau',
				'title': 'Bauleitpläne suchen',
				'href': 'https://geoportal.bayern.de/bauleitplanungsportal/index.html',
				'permanent': false,
				'target': 'extern',
				'observer': {
					'geoResources': [
						'26d2b2b8-3944-4a49-aec2-59f827d9aa9e'
					],
					'topics': []
				},
				'style': {
					'colorLight': 'hsl(60, 60%, 40%)',
					'backgroundColorLight': 'var(--primary-bg-color)',
					'colorDark': 'hsl(60, 70%, 70%)',
					'backgroundColorDark': 'var(--primary-bg-color)',
					'icon': '<path fill-rule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/><path fill-rule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/>'
				}
			}
		];
	}
}
