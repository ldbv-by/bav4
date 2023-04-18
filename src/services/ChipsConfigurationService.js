/**
 * @module services/ChipsConfigurationService
 */
import { $injector } from '../injection';
import { FALLBACK_GEORESOURCE_ID_2, FALLBACK_GEORESOURCE_ID_3 } from './GeoResourceService';
import { loadBvvChipConfiguration } from './provider/chipsConfiguration.provider';
import { FALLBACK_TOPICS_IDS } from './TopicsService';

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
	 * If loading fails and the app is in standalone mode a fallback will be delivered.
	 * @public
	 * @async
	 * @returns {Promise<Array<module:domain/chipConfigurationTypeDef~ChipConfiguration>>}
	 */
	async all() {
		if (!this._configurations) {
			try {
				this._configurations = await this._provider();
			} catch (e) {
				this._configurations = [];
				if (this._environmentService.isStandalone()) {
					this._configurations.push(...this._newFallbackConfiguration());
					console.warn('Chips configuration could not be fetched from backend. Using fallback configuration ...');
				} else {
					throw e;
				}
			}
		}
		return this._configurations;
	}

	_newFallbackConfiguration() {
		return [
			{
				id: 'gh',
				title: 'Fork me', // required
				href: 'https://github.com/ldbv-by/bav4/', // required
				permanent: true, // required
				target: 'external', // required ["modal", "external"]
				observer: {
					// required [object, null]
					geoResources: [
						// required
					],
					topics: [
						// required
					]
				},
				style: {
					// required
					colorLight: 'var(--primary-color)', // required
					backgroundColorLight: 'var(--primary-bg-color)', // required
					colorDark: 'var(--primary-color)', // required
					backgroundColorDark: 'var(--primary-bg-color)', // required
					icon: '<path d="m 8.06415,0.2995526 c -4.260197,0 -7.70415223,3.4693444 -7.70415223,7.7613964 0,3.430867 2.20666073,6.335023 5.26788413,7.362895 0.3827318,0.07727 0.5229249,-0.167002 0.5229249,-0.372481 0,-0.179933 -0.012616,-0.796688 -0.012616,-1.439305 -2.1431086,0.462685 -2.5893925,-0.925211 -2.5893925,-0.925211 -0.3444112,-0.899506 -0.8547202,-1.13069 -0.8547202,-1.13069 -0.7014384,-0.475459 0.051094,-0.475459 0.051094,-0.475459 0.7780792,0.05141 1.186358,0.796688 1.186358,0.796688 0.6886649,1.1821 1.7983821,0.848097 2.2448237,0.64246 0.06371,-0.501163 0.2679279,-0.848097 0.4847619,-1.040804 -1.7092829,-0.179933 -3.5076649,-0.848097 -3.5076649,-3.8293681 0,-0.8480967 0.3059331,-1.5419653 0.7906951,-2.0816063 -0.076484,-0.1927064 -0.3444113,-0.9895518 0.076641,-2.0560597 0,0 0.6505021,-0.2056375 2.1172463,0.7966877 A 7.4070501,7.4070501 0 0 1 8.0641496,4.0516488 c 0.6505021,0 1.3136194,0.090045 1.9259593,0.2570468 1.4669011,-1.0023252 2.1174031,-0.7966877 2.1174031,-0.7966877 0.421052,1.0665079 0.152967,1.8633533 0.07648,2.0560597 0.497535,0.539641 0.790853,1.2335096 0.790853,2.0816063 0,2.9812711 -1.798381,3.6365041 -3.5204379,3.8293681 0.2807011,0.244116 0.5229254,0.706642 0.5229254,1.439147 0,1.040804 -0.012621,1.876127 -0.012621,2.133016 0,0.205637 0.1403505,0.449911 0.5229245,0.372798 3.061224,-1.028189 5.267885,-3.932187 5.267885,-7.363054 0.01262,-4.292052 -3.443952,-7.7613964 -7.6913753,-7.7613964 z" />'
				}
			},

			{
				id: 'smart_mapping',
				title: 'Smart Mapping', // required
				href: 'https://www.adv-smart.de/', // required
				permanent: false, // required
				target: 'external', // required ["modal", "external"]
				observer: {
					// required [object, null]
					geoResources: [
						// required
						FALLBACK_GEORESOURCE_ID_2,
						FALLBACK_GEORESOURCE_ID_3
					],
					topics: [
						// required
					]
				},
				style: {
					// required
					colorLight: 'var(--primary-color)', // required
					backgroundColorLight: 'var(--primary-bg-color)', // required
					colorDark: 'var(--primary-color)', // required
					backgroundColorDark: 'var(--primary-bg-color)', // required
					icon: '<path d="M8.5 6.5a.5.5 0 0 0-1 0v3.793L6.354 9.146a.5.5 0 1 0-.708.708l2 2a.5.5 0 0 0 .708 0l2-2a.5.5 0 0 0-.708-.708L8.5 10.293V6.5z"/><path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z"/>'
				}
			},
			{
				id: 'brradl22',
				title: 'BR-Radeltour',
				href: 'https://www.geodaten.bayern.de/bayernatlas-info/brradl22/index.html',
				permanent: false,
				target: 'modal',
				observer: {
					// required [object, null]
					geoResources: [
						// required
					],
					topics: [
						// required
						FALLBACK_TOPICS_IDS[1]
					]
				},
				style: {
					colorLight: 'var(--primary-color)', // required
					backgroundColorLight: 'var(--primary-bg-color)', // required
					colorDark: 'var(--primary-color)', // required
					backgroundColorDark: 'var(--primary-bg-color)', // required
					icon: '<path d="M5 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/><path d="m2.165 15.803.02-.004c1.83-.363 2.948-.842 3.468-1.105A9.06 9.06 0 0 0 8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6a10.437 10.437 0 0 1-.524 2.318l-.003.011a10.722 10.722 0 0 1-.244.637c-.079.186.074.394.273.362a21.673 21.673 0 0 0 .693-.125zm.8-3.108a1 1 0 0 0-.287-.801C1.618 10.83 1 9.468 1 8c0-3.192 3.004-6 7-6s7 2.808 7 6c0 3.193-3.004 6-7 6a8.06 8.06 0 0 1-2.088-.272 1 1 0 0 0-.711.074c-.387.196-1.24.57-2.634.893a10.97 10.97 0 0 0 .398-2z"/>'
				}
			}
		];
	}
}
