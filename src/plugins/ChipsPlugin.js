import { $injector } from '../injection';
import { QueryParameters } from '../domain/queryParameters';
import { BaPlugin } from './BaPlugin';
import { setCurrent } from '../store/chips/chips.action';
import { observe } from '../utils/storeUtils';

/**
 * This plugin loads all available chips and permanently updates the chips slice-of-state dependent on the app's state.
 * @class
 * @author alsturm
 * @author taulinger
 */
export class ChipsPlugin extends BaPlugin {

	_updateStore(chips, permanentChips, state) {

		const findTopicsChips = () => {
			return state.topicsContentPanel.index // check topics only if TopicsContentPanel is displayed at least at level 1
				? chips.filter(c => c.observer?.topics.includes(state.topics.current))
				: [];
		};

		const findActiveGeoResourceChips = () => {
			const geoResourceIds = state.layers.active.map(l => l.geoResourceId);
			return chips.filter(c => geoResourceIds.some(grId => c.observer?.geoResources.includes(grId)));
		};

		setCurrent([...new Set([...permanentChips, ...findTopicsChips(), ...findActiveGeoResourceChips()])]);
	}

	_findPermanentAndQueryParamChips(chips) {
		const { EnvironmentService: environmentService } = $injector.inject('EnvironmentService');

		const findChipsFromQueryParams = () => {
			const queryParams = new URLSearchParams(environmentService.getWindow().location.search);
			const chipId = queryParams.get(QueryParameters.CHIP) ?? [];
			return chips.filter(c => chipId === c.id);
		};

		return [...chips.filter(c => c.permanent), ...findChipsFromQueryParams(chips)];
	}

	/**
	 * @override
	 * @param {Store} store
	 */
	async register(store) {
		const { ChipsConfigurationService: chipsConfigurationService }
			= $injector.inject('ChipsConfigurationService');

		const chips = await chipsConfigurationService.all();
		const permanentChips /** let's store them here*/ = this._findPermanentAndQueryParamChips(chips);

		// initial update
		this._updateStore(chips, permanentChips, store.getState());
		// register observer
		observe(store, state => state, state => this._updateStore(chips, permanentChips, state));
		observe(store, state => state, state => this._updateStore(chips, permanentChips, state));
	}
}
