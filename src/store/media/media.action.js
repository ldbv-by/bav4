/**
 * Action creators for media actions.
 * @module media/action
 */

import { $injector } from '../../injection';
import { COLOR_SCHEMA_CHANGED, MIN_WIDTH_CHANGED, ORIENTATION_CHANGED, RESPONSIVE_PARAMETER_OBSERVATION_CHANGED } from './media.reducer';

const getStore = () => {
	const { StoreService: storeService } = $injector.inject('StoreService');
	return storeService.getStore();
};

/**
 *
 * @param {boolean} isPortait
 * @function
 */
export const setIsPortrait = (isPortait) => {
	const { media: { observeResponsiveParameter } } = getStore().getState();
	if (observeResponsiveParameter) {
		getStore().dispatch({
			type: ORIENTATION_CHANGED,
			payload: isPortait
		});
	}
};

/**
 *
 * @param {boolean} isMinWidth
 * @function
 */
export const setIsMinWidth = (isMinWidth) => {
	const { media: { observeResponsiveParameter } } = getStore().getState();
	if (observeResponsiveParameter) {
		getStore().dispatch({
			type: MIN_WIDTH_CHANGED,
			payload: isMinWidth
		});
	}
};

/**
 *
 * @param {boolean} isDarkSchema
 * @function
 */
export const setIsDarkSchema = (isDarkSchema) => {
	getStore().dispatch({
		type: COLOR_SCHEMA_CHANGED,
		payload: isDarkSchema
	});
};

/**
 * Toggles the theme (light <-> dark)
 * @function
 */
export const toggleSchema = () => {
	const { media: { darkSchema } } = getStore().getState();
	getStore().dispatch({
		type: COLOR_SCHEMA_CHANGED,
		payload: !darkSchema
	});
};


/**
 * @function
 */
export const enableResponsiveParameterObservation = () => {

	getStore().dispatch({
		type: RESPONSIVE_PARAMETER_OBSERVATION_CHANGED,
		payload: true
	});
};

/**
 * @function
 */
export const disableResponsiveParameterObservation = () => {

	getStore().dispatch({
		type: RESPONSIVE_PARAMETER_OBSERVATION_CHANGED,
		payload: false
	});
};
