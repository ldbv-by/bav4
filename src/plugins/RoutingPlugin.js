/**
 * @module plugins/RoutingPlugin
 */
import { observe, observeOnce } from '../utils/storeUtils';
import { addLayer, removeLayer } from '../store/layers/layers.action';
import { BaPlugin } from './BaPlugin';
import { activate, deactivate, reset, setCategory } from '../store/routing/routing.action';
import { Tools } from '../domain/tools';
import { $injector } from '../injection/index';
import { LevelTypes, emitNotification } from '../store/notifications/notifications.action';
import { closeBottomSheet, openBottomSheet } from '../store/bottomSheet/bottomSheet.action';
import { html } from '../../node_modules/lit-html/lit-html';
import { CoordinateProposalType, RoutingStatusCodes } from '../domain/routing';
import { HighlightFeatureType, addHighlightFeatures, clearHighlightFeatures, removeHighlightFeaturesById } from '../store/highlight/highlight.action';
import { setCurrentTool } from '../store/tools/tools.action';
import { closeContextMenu } from '../store/mapContextMenu/mapContextMenu.action';

/**
 * Id of the layer used for routing interaction.
 * LayerHandler of a map implementation will also use this id as their key.
 */
export const ROUTING_LAYER_ID = 'routing_layer';

/**
 * This plugin observes the 'active' property of the routing store.
 * On changes, it adds a layer with a specific and constant id
 * to the layers store or removes this layer from the store (see: {@link ROUTING_LAYER_ID}).
 *
 * As a result of the change of the layers store, a map implementation will search for a handler registered for that id,
 * and, if found, will activate or deactivate this handler.
 *
 * @class
 * @author taulinger
 */
export class RoutingPlugin extends BaPlugin {
	constructor() {
		super();
		this._initialized = false;
		const { TranslationService: translationService } = $injector.inject('TranslationService');
		this._translationService = translationService;
	}
	/**
	 * @override
	 * @param {Store} store
	 */
	async register(store) {
		const { RoutingService: routingService } = $injector.inject('RoutingService');

		const lazyInitialize = async () => {
			if (!this._initialized) {
				// let's initial the routing service
				try {
					await routingService.init();
					setCategory(routingService.getCategories()[0]?.id);
					return (this._initialized = true);
				} catch (ex) {
					console.error('Routing service could not be initialized', ex);
					emitNotification(`${this._translationService.translate('global_routingService_init_exception')}`, LevelTypes.ERROR);
				}
				return false;
			}
			return true;
		};

		const onToolChanged = async (toolId) => {
			if (toolId !== Tools.ROUTING) {
				removeHighlightFeaturesById(RoutingPlugin.HIGHLIGHT_FEATURE_ID);
				closeBottomSheet();
				reset();
				deactivate();
			} else {
				if (await lazyInitialize()) {
					// we activate the tool after another possible active tool was deactivated
					setTimeout(() => {
						activate();
					});
				}
			}
		};

		const onChange = (changedState) => {
			if (changedState) {
				addLayer(ROUTING_LAYER_ID, { constraints: { hidden: true, alwaysTop: true } });
			} else {
				removeLayer(ROUTING_LAYER_ID);
			}
		};

		const onProposalChange = (proposal, state) => {
			const { coord, type: proposalType } = proposal;

			if (proposalType === CoordinateProposalType.EXISTING_START_OR_DESTINATION && state.routing.waypoints.length < 2) {
				return;
			}

			setCurrentTool(Tools.ROUTING);

			clearHighlightFeatures();
			closeContextMenu();

			addHighlightFeatures({
				id: RoutingPlugin.HIGHLIGHT_FEATURE_ID,
				type: [CoordinateProposalType.EXISTING_INTERMEDIATE, CoordinateProposalType.EXISTING_START_OR_DESTINATION].includes(proposalType)
					? HighlightFeatureType.DEFAULT
					: HighlightFeatureType.MARKER_TMP,
				data: { coordinate: [...coord] }
			});
			const content = html`<ba-proposal-context-content></ba-proposal-context-content>`;
			openBottomSheet(content);
			// we also want to remove the highlight feature when the BottomSheet was closed
			observeOnce(
				store,
				(state) => state.bottomSheet.data,
				() => removeHighlightFeaturesById(RoutingPlugin.HIGHLIGHT_FEATURE_ID)
			);
		};
		const onRoutingStatusChanged = async (status) => {
			if ([RoutingStatusCodes.Start_Missing, RoutingStatusCodes.Destination_Missing].includes(status)) {
				setCurrentTool(Tools.ROUTING);
			}
		};
		const onWaypointsChanged = () => {
			clearHighlightFeatures();
			closeContextMenu();
			closeBottomSheet();
		};

		observe(store, (state) => state.routing.active, onChange);
		observe(store, (state) => state.tools.current, onToolChanged, false);
		observe(
			store,
			(state) => state.routing.proposal,
			(eventLike, state) => onProposalChange(eventLike.payload, state)
		);
		observe(
			store,
			(state) => state.routing.status,
			(status) => onRoutingStatusChanged(status)
		);
		observe(
			store,
			(state) => state.routing.waypoints,
			() => onWaypointsChanged()
		);
	}

	static get HIGHLIGHT_FEATURE_ID() {
		return '#routingPluginHighlightFeatureId';
	}
}
