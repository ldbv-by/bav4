import { $injector } from '../../../../../src/injection';
import { TestUtils } from '../../../../test-utils.js';
import { provide as routingProvideFn } from '../../../../../src/modules/olMap/handler/routing/tooltipMessage.provider';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { ROUTING_CATEGORY, ROUTING_FEATURE_TYPE, RoutingFeatureTypes } from '../../../../../src/modules/olMap/handler/routing/OlRoutingHandler';

TestUtils.setupStoreAndDi({});
$injector.registerSingleton('TranslationService', { translate: (key, params = []) => `${key}${params.length ? ` [${params.join(',')}]` : ''}` });

describe('Routing tooltipMessageProvider', () => {
	const feature = new Feature({
		geometry: new Point([21, 42])
	});

	it('provides tooltip-messages', () => {
		feature.set(ROUTING_FEATURE_TYPE, RoutingFeatureTypes.ROUTE_ALTERNATIVE);
		feature.set(ROUTING_CATEGORY, { description: 'description' });
		expect(routingProvideFn({ feature })).toBe('olMap_handler_routing_choose_alternative_route [description]');

		feature.set(ROUTING_FEATURE_TYPE, RoutingFeatureTypes.ROUTE_SEGMENT);
		expect(routingProvideFn({ feature })).toBe('olMap_handler_routing_modify_segment');

		feature.set(ROUTING_FEATURE_TYPE, RoutingFeatureTypes.START);
		expect(routingProvideFn({ feature })).toBe('olMap_handler_routing_modify_start');

		feature.set(ROUTING_FEATURE_TYPE, RoutingFeatureTypes.DESTINATION);
		expect(routingProvideFn({ feature })).toBe('olMap_handler_routing_modify_destination');

		feature.set(ROUTING_FEATURE_TYPE, RoutingFeatureTypes.INTERMEDIATE);
		expect(routingProvideFn({ feature })).toBe('olMap_handler_routing_modify_intermediate');

		feature.set(ROUTING_FEATURE_TYPE, 'unknown');
		expect(routingProvideFn({ feature })).toBe('');
	});
});
