/**
 * @module store/legend/legend_action
 */
import { $injector } from '../../injection/index';
import {
	ACTIVATE_LEGEND,
	CLEAR_PREVIEW_GEORESOURCE_ID,
	DEACTIVATE_LEGEND,
	SET_LEGEND_ITEMS,
	SET_MAP_RESOLUTION,
	SET_PREVIEW_GEORESOURCE_ID
} from './legend.reducer';

const getStore = () => {
	const { StoreService: storeService } = $injector.inject('StoreService');
	return storeService.getStore();
};

/**
 * Activates the legend.
 */
export const activateLegend = () => {
	getStore().dispatch({
		type: ACTIVATE_LEGEND,
		payload: null
	});
};

/**
 * Deactivates the legend.
 */
export const deactivateLegend = () => {
	getStore().dispatch({
		type: DEACTIVATE_LEGEND,
		payload: null
	});
};

/**
 * Adds a georesource id to the legend.
 */
export const setPreviewGeoresourceId = (id) => {
	getStore().dispatch({
		type: SET_PREVIEW_GEORESOURCE_ID,
		payload: id
	});
};

/**
 * Clears the georesource ids for the legend.
 */
export const clearPreviewGeoresourceId = () => {
	getStore().dispatch({
		type: CLEAR_PREVIEW_GEORESOURCE_ID,
		payload: null
	});
};

/**
 * Sets the items for the legend.
 */
export const setLegendItems = (items) => {
	getStore().dispatch({
		type: SET_LEGEND_ITEMS,
		payload: items
	});
};

/**
 * Sets the map resolution.
 */
export const setMapResolution = (resolution) => {
	getStore().dispatch({
		type: SET_MAP_RESOLUTION,
		payload: resolution
	});
};
