import { $injector } from '../injection';
import { QueryParameters } from '../domain/queryParameters';
import { BaPlugin } from './BaPlugin';
import { setCurrent } from '../store/chips/chips.action';
import { observe } from '../utils/storeUtils';

/**
 * @class
 */
export class ChipsPlugin extends BaPlugin {

	constructor() {
		super();

		this._permanentAndParaChips = [];
		this._topicsChips = [];
		this._geoResourcesChips = [];
	}

	_addChipsWithPermanentState(allChips) {
		const chips = [];
		allChips.map((chip) => {
			if (chip.permanent === true) {
				chips.push(chip);
			}
		});
		return chips;
	}

	_addChipsFromQueryParams(queryParams, allChips) {
		const chips = [];
		const chipIds = queryParams.get(QueryParameters.CHIP);
		allChips.map((chip) => {
			if (chipIds.includes(chip.id)) {
				chips.push(chip);
			}
		});
		return chips;
	}

	_updateChips() {
		const chipConfigurationArray = [];
		chipConfigurationArray.push(...this._permanentAndParaChips);
		chipConfigurationArray.push(...this._topicsChips);
		chipConfigurationArray.push(...this._geoResourcesChips);
		const uniqueChipConfigurationArray = [...new Set(chipConfigurationArray)];
		setCurrent(uniqueChipConfigurationArray);
	}

	/**
	 * @override
	 * @param {Store} store
	 */
	async register(store) {

		const { ChipsConfigurationService: chipsConfigurationService, EnvironmentService: environmentService } = $injector.inject('ChipsConfigurationService', 'EnvironmentService');

		// let's get the initial Chips
		const allChips = [];
		try {
			allChips.push(...await chipsConfigurationService.all());
		}
		catch (ex) {
			console.error('ChipsConfigurationService could not be fetched from backend', ex);
		}

		const chipConfigurationArray = [];
		const queryParams = new URLSearchParams(environmentService.getWindow().location.search);
		//add permanent chips
		chipConfigurationArray.push(...this._addChipsWithPermanentState(allChips));
		//add from query params
		if (queryParams.has(QueryParameters.CHIP)) {
			chipConfigurationArray.push(...this._addChipsFromQueryParams(queryParams, allChips));
		}
		this._permanentAndParaChips.push(...chipConfigurationArray);
		this._updateChips();


		const onCurrentTopicChanged = (store) => {
			const chipConfigurationArray = [];
			allChips.map((chip) => {
				if (chip.observer && chip.observer.topics.includes(store.topics.current) && store.topicsContentPanel.index) {
					chipConfigurationArray.push(chip);
				}
			});
			this._topicsChips = chipConfigurationArray;
			this._updateChips();
		};

		const onActiveLayerChanged = (active) => {
			const chipConfigurationArray = [];
			allChips.map((chip) => {
				if (chip.observer) {
					active.map((geoResource) => {
						if (chip.observer.geoResources.includes(geoResource.geoResourceId)) {
							chipConfigurationArray.push(chip);
						}
					});
				}
			});
			this._geoResourcesChips = chipConfigurationArray;
			this._updateChips();
		};

		observe(store, store => store, onCurrentTopicChanged);
		observe(store, store => store.layers.active, onActiveLayerChanged);
	}
}
