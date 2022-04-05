import { observe } from '../utils/storeUtils';
import { BaPlugin } from './BaPlugin';
import { html } from 'lit-html';
import { close, open } from '../store/mapContextMenu/mapContextMenu.action';
import { emitFixedNotification, clearFixedNotification } from '../store/notifications/notifications.action';
import { $injector } from '../injection';
import { createUniqueId } from '../utils/numberUtils';
import { addHighlightFeatures, HighlightFeatureType, removeHighlightFeaturesById } from '../store/highlight/highlight.action';


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
		const { EnvironmentService: environmentService }
			= $injector.inject('EnvironmentService');

		const onContextClick = ({ payload }) => {
			const { coordinate, screenCoordinate } = payload;
			const content = html`<ba-map-context-menu-content .coordinate=${coordinate}></ba-map-context-menu-content>`;

			if (environmentService.isTouch()) {
				removeHighlightFeaturesById(highlightFeatureId);
				addHighlightFeatures(
					{ id: highlightFeatureId, data: { coordinate: coordinate }, type: HighlightFeatureType.QUERY_SUCCESS }
				);
				emitFixedNotification(content);
			}
			else {
				open([screenCoordinate[0], screenCoordinate[1]], content);
			}
		};

		const onMoveOrClick = () => {
			if (environmentService.isTouch()) {
				removeHighlightFeaturesById(highlightFeatureId);
				clearFixedNotification();
			}
			else {
				close();
			}
		};

		observe(store, state => state.pointer.contextClick, onContextClick);
		observe(store, state => state.pointer.click, onMoveOrClick);
		observe(store, state => state.map.moveStart, onMoveOrClick);
	}
}
