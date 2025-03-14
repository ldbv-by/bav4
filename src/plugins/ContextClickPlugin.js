/**
 * @module plugins/ContextClickPlugin
 */
import { observe } from '../utils/storeUtils';
import { BaPlugin } from './BaPlugin';
import { html } from 'lit-html';
import { closeContextMenu, openContextMenu } from '../store/mapContextMenu/mapContextMenu.action';
import { $injector } from '../injection';
import { createUniqueId } from '../utils/numberUtils';
import { addHighlightFeatures, removeHighlightFeaturesById } from '../store/highlight/highlight.action';
import { closeBottomSheet, openBottomSheet } from '../store/bottomSheet/bottomSheet.action';
import { INTERACTION_BOTTOM_SHEET_ID } from '../store/bottomSheet/bottomSheet.reducer';
import { HighlightFeatureType } from '../domain/highlightFeature';

/**
 * Plugin for context-click related slice-of-state management.
 * @class
 * @author taulinger
 */
export class ContextClickPlugin extends BaPlugin {
	async register(store) {
		// flag indicating if the BottomSheet was opened from here
		let bottomSheetOpenedFromHere = false;
		const highlightFeatureId = `${createUniqueId()}`;
		const { EnvironmentService: environmentService } = $injector.inject('EnvironmentService');

		const onBottomSheetChanged = (active) => {
			if (active.includes(INTERACTION_BOTTOM_SHEET_ID)) {
				bottomSheetOpenedFromHere = false;
			}
		};

		const onContextClick = ({ payload }) => {
			const { coordinate, screenCoordinate } = payload;
			const content = html`<ba-map-context-menu-content .coordinate=${coordinate}></ba-map-context-menu-content>`;

			if (environmentService.isTouch()) {
				removeHighlightFeaturesById(highlightFeatureId);
				addHighlightFeatures({ id: highlightFeatureId, data: coordinate, type: HighlightFeatureType.QUERY_SUCCESS });
				openBottomSheet(content, INTERACTION_BOTTOM_SHEET_ID);
				bottomSheetOpenedFromHere = true;
			} else {
				openContextMenu([screenCoordinate[0], screenCoordinate[1]], content);
			}
		};

		const onMoveOrClick = () => {
			if (environmentService.isTouch()) {
				removeHighlightFeaturesById(highlightFeatureId);
				if (bottomSheetOpenedFromHere) {
					closeBottomSheet(INTERACTION_BOTTOM_SHEET_ID);
				}
			} else {
				closeContextMenu();
			}
		};

		observe(store, (state) => state.pointer.contextClick, onContextClick);
		observe(store, (state) => state.pointer.click, onMoveOrClick);
		observe(store, (state) => state.map.moveStart, onMoveOrClick);
		observe(store, (state) => state.bottomSheet.active, onBottomSheetChanged);
		observe(
			store,
			(state) => state.tools.current,
			() => removeHighlightFeaturesById(highlightFeatureId)
		);
	}
}
