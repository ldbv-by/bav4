/**
 * @module plugins/RoutingPlugin
 */
import { observe, observeOnce } from '../utils/storeUtils';
import { addLayer, removeLayer } from '../store/layers/layers.action';
import { BaPlugin } from './BaPlugin';
import { activate, deactivate, reset, setCategory, setDestination, setWaypoints } from '../store/routing/routing.action';
import { Tools } from '../domain/tools';
import { $injector } from '../injection/index';
import { LevelTypes, emitNotification } from '../store/notifications/notifications.action';
import { closeBottomSheet, openBottomSheet } from '../store/bottomSheet/bottomSheet.action';
import { html } from '../../node_modules/lit-html/lit-html';
import { CoordinateProposalType, RoutingStatusCodes } from '../domain/routing';
import { HighlightFeatureType, addHighlightFeatures, clearHighlightFeatures, removeHighlightFeaturesById } from '../store/highlight/highlight.action';
import { setCurrentTool } from '../store/tools/tools.action';
import { closeContextMenu } from '../store/mapContextMenu/mapContextMenu.action';
import { QueryParameters } from '../domain/queryParameters';
import { setTab } from '../store/mainMenu/mainMenu.action';
import { TabIds } from '../domain/mainMenu';
import { isCoordinate } from '../utils/checks';

/**
 * Id of the temporary layer used for routing interaction when the tool is activated.
 * LayerHandler of a map implementation will also use this id as their key.
 */
export const ROUTING_LAYER_ID = 'routing_layer';
/**
 * Id of a permanent layer used for displaying a route.
 */
export const PERMANENT_ROUTE_LAYER_ID = 'perm_rt_layer';
/**
 * Id of a permanent layer used for displaying the waypoints of a route.
 */
export const PERMANENT_WP_LAYER_ID = 'perm_wp_layer';

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
	#translationService;
	#environmentService;
	#routingService;

	constructor() {
		super();
		this._initialized = false;
		const {
			TranslationService: translationService,
			EnvironmentService: environmentService,
			RoutingService: routingService
		} = $injector.inject('TranslationService', 'EnvironmentService', 'RoutingService');
		this.#translationService = translationService;
		this.#environmentService = environmentService;
		this.#routingService = routingService;
	}

	/**
	 * @override
	 */
	async register(store) {
		const lazyInitialize = async () => {
			if (!this._initialized) {
				// let's initial the routing service
				try {
					await this.#routingService.init();
					setCategory(this.#routingService.getCategories()[0]?.id);
					// parse query parameters if available
					this._parseRouteFromQueryParams(this.#environmentService.getQueryParams());
					return (this._initialized = true);
				} catch (ex) {
					console.error('Routing service could not be initialized', ex);
					emitNotification(`${this.#translationService.translate('global_routingService_init_exception')}`, LevelTypes.ERROR);
				}
				return false;
			}
			return true;
		};

		if (this.#environmentService.getQueryParams().has(QueryParameters.ROUTE_WAYPOINTS)) {
			setCurrentTool(Tools.ROUTING); // implicitly calls onToolChanged()
		}

		const onToolChanged = async (toolId) => {
			if (toolId !== Tools.ROUTING) {
				removeHighlightFeaturesById(RoutingPlugin.HIGHLIGHT_FEATURE_ID);
				closeBottomSheet();
				deactivate();
			} else {
				if (await lazyInitialize()) {
					// we activate the tool after another possible active tool was deactivated
					setTimeout(() => {
						activate();
						setTab(TabIds.ROUTING);
					});
				}
			}
		};

		const onChange = (changedState) => {
			if (changedState) {
				clearHighlightFeatures();
				closeContextMenu();
				addLayer(ROUTING_LAYER_ID, { constraints: { hidden: true, alwaysTop: true } });
				removeLayer(PERMANENT_ROUTE_LAYER_ID);
				removeLayer(PERMANENT_WP_LAYER_ID);
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
		const onLayerRemoved = (eventLike, state) => {
			if (!state.routing.active && [PERMANENT_ROUTE_LAYER_ID, PERMANENT_WP_LAYER_ID].includes(eventLike.payload)) {
				reset();
			}
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
		observe(
			store,
			(state) => state.layers.removed,
			(eventLike, state) => onLayerRemoved(eventLike, state)
		);
	}

	_parseRouteFromQueryParams(queryParams) {
		if (queryParams.has(QueryParameters.ROUTE_WAYPOINTS)) {
			const parseWaypoints = (waypointsAsString) => {
				const waypoints = [];
				const routeValues = waypointsAsString.split(',');
				if (routeValues.length > 1 && routeValues.length % 2 === 0) {
					for (let index = 0; index < routeValues.length - 1; index = index + 2) {
						waypoints.push([parseFloat(routeValues[index]), parseFloat(routeValues[index + 1])]);
					}
				}
				return waypoints.filter((c) => isCoordinate(c));
			};

			const waypoints = parseWaypoints(queryParams.get(QueryParameters.ROUTE_WAYPOINTS));
			if (waypoints.length > 0) {
				if (queryParams.has(QueryParameters.ROUTE_CATEGORY)) {
					const catId = queryParams.get(QueryParameters.ROUTE_CATEGORY);
					// update the category only if catId is a known id
					if (this.#routingService.getCategoryById(catId)) {
						setCategory(catId);
					}
				}
				waypoints.length === 1 ? setDestination(waypoints[0]) : setWaypoints(waypoints);
			}
		}
	}

	static get HIGHLIGHT_FEATURE_ID() {
		return '#routingPluginHighlightFeatureId';
	}
}
