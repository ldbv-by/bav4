/**
 * @module store/catalog/catalog_action
 */
import { OPEN_NODES_CHANGED } from './catalog.reducer';
import { $injector } from '../../injection';
import { isString } from '../../utils/checks';

const getStore = () => {
	const { StoreService: storeService } = $injector.inject('StoreService');
	return storeService.getStore();
};

/**
 * Sets all open catalog node at once
 * @param {Array<string>} nodeIds
 * @function
 */
export const setOpenNodes = (nodeIds) => {
	if (Array.isArray(nodeIds)) {
		getStore().dispatch({
			type: OPEN_NODES_CHANGED,
			payload: nodeIds.filter((v) => isString(v))
		});
	}
};

/**
 * Adds a node to the list of open nodes.
 * @param {Array<string>} nodeId the id of an open node
 * @function
 */
export const addOpenNode = (nodeId) => {
	if (isString(nodeId)) {
		getStore().dispatch({
			type: OPEN_NODES_CHANGED,
			payload: [...getStore().getState().catalog.openNodes, nodeId]
		});
	}
};

/**
 * Removes a node from the list of open nodes.
 * @param {Array<string>} nodeId the id of an open node
 * @function
 */
export const removeOpenNode = (nodeId) => {
	if (isString(nodeId)) {
		getStore().dispatch({
			type: OPEN_NODES_CHANGED,
			payload: getStore()
				.getState()
				.catalog.openNodes.filter((id) => id !== nodeId)
		});
	}
};
