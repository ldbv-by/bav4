import { observe } from '../utils/storeUtils';
import { BaPlugin } from './BaPlugin';
import { html } from 'lit-html';
import { close, open } from '../store/mapContextMenu/mapContextMenu.action';
import { $injector } from '../injection';
import { createUniqueId } from '../utils/numberUtils';
import { addHighlightFeatures, HighlightFeatureType, removeHighlightFeaturesById } from '../store/highlight/highlight.action';
import { closeBottomSheet, openBottomSheet } from '../store/bottomSheet/bottomSheet.action';

/**
 * Plugin for contextClick state management.
 * @class
 * @author taulinger
 */
export class ContextClickPlugin extends BaPlugin {
	/**
	 * @override
	 * @param {Store} store
	 */
	async register(store) {
		const highlightFeatureId = createUniqueId();
		const { EnvironmentService: environmentService } = $injector.inject('EnvironmentService');

		const onContextClick = ({ payload }) => {
			const { coordinate, screenCoordinate } = payload;
			const content = html`<ba-map-context-menu-content .coordinate=${coordinate}></ba-map-context-menu-content>`;

			if (environmentService.isTouch()) {
				removeHighlightFeaturesById(highlightFeatureId);
				addHighlightFeatures({ id: highlightFeatureId, data: { coordinate: coordinate }, type: HighlightFeatureType.QUERY_SUCCESS });
				openBottomSheet(content);
			} else {
				open([screenCoordinate[0], screenCoordinate[1]], content);
			}
		};

		const onMoveOrClick = () => {
			if (environmentService.isTouch()) {
				removeHighlightFeaturesById(highlightFeatureId);
				closeBottomSheet();
			} else {
				close();
			}
		};

		observe(store, (state) => state.pointer.contextClick, onContextClick);
		observe(store, (state) => state.pointer.click, onMoveOrClick);
		observe(store, (state) => state.map.moveStart, onMoveOrClick);
	}
}
