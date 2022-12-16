import { $injector } from '../injection';
import { QueryParameters } from '../domain/queryParameters';
import { BaPlugin } from './BaPlugin';
import { setCurrent } from '../store/chips/chips.action';
import { observe } from '../utils/storeUtils';

/**
 * @class
 * @author alsturm
 * @author taulinger
 */
export class ChipsPlugin extends BaPlugin {

	_updateStore(chips, permanentChips, state) {

		const findTopicsChips = () => {
			return chips.filter(c => c.observer?.topics.includes(state.topics.current));
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
		const permanentChips = this._findPermanentAndQueryParamChips(chips);

		this._updateStore(chips, permanentChips, store.getState());
		observe(store, state => state, state => this._updateStore(chips, permanentChips, state));
		observe(store, state => state, state => this._updateStore(chips, permanentChips, state));
	}
}
