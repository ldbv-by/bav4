/**
 * @module modules/olMap/handler/routing/tooltipMessage_provider
 */
import { $injector } from '../../../../injection';
import { ROUTING_CATEGORY, ROUTING_FEATURE_TYPE, RoutingFeatureTypes } from './OlRoutingHandler';

/**
 * Routing related implementation of {@link module:modules/olMap/tooltip/HelpTooltip~tooltipMessageProviderFunction}
 * @function
 * @type {module:modules/olMap/tooltip/HelpTooltip~tooltipMessageProviderFunction}
 */
export const provide = (interactionState) => {
	const { TranslationService: translationService } = $injector.inject('TranslationService');
	const translate = (key, params = []) => translationService.translate(key, params);

	const { feature } = interactionState;
	switch (feature.get(ROUTING_FEATURE_TYPE)) {
		case RoutingFeatureTypes.ROUTE_ALTERNATIVE: {
			const { description } = feature.get(ROUTING_CATEGORY);
			return translate('olMap_handler_routing_choose_alternative_route', [description]);
		}
		case RoutingFeatureTypes.ROUTE_SEGMENT: {
			return translate('olMap_handler_routing_modify_segment');
		}
		case RoutingFeatureTypes.START: {
			return translate('olMap_handler_routing_modify_start');
		}
		case RoutingFeatureTypes.DESTINATION: {
			return translate('olMap_handler_routing_modify_destination');
		}
		case RoutingFeatureTypes.INTERMEDIATE: {
			return translate('olMap_handler_routing_modify_intermediate');
		}
	}
	return '';
};
