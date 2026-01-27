import { QueryParameters } from '../../src/domain/queryParameters';
import { WcAttributes, WcEvents, WcMessageKeys } from '../../src/domain/webComponent';

describe('WcEvents', () => {
	it('provides an enum of all valid events of the public web component', () => {
		expect(Object.isFrozen(WcEvents)).toBeTrue();
		expect(Object.keys(WcEvents).length).toBe(4);

		expect(WcEvents.LOAD).toBe('baLoad');
		expect(WcEvents.CHANGE).toBe('baChange');
		expect(WcEvents.GEOMETRY_CHANGE).toBe('baGeometryChange');
		expect(WcEvents.FEATURE_SELECT).toBe('baFeatureSelect');
	});

	it('provides a list of all supported attributes', () => {
		expect(Object.isFrozen(WcAttributes)).toBeTrue();
		expect(WcAttributes).toEqual([
			QueryParameters.LAYER,
			QueryParameters.ZOOM,
			QueryParameters.CENTER,
			QueryParameters.ROTATION,
			QueryParameters.LAYER_VISIBILITY,
			QueryParameters.LAYER_OPACITY,
			QueryParameters.EC_SRID,
			QueryParameters.EC_GEOMETRY_FORMAT,
			QueryParameters.EC_MAP_ACTIVATION,
			QueryParameters.EC_LINK_TO_APP,
			QueryParameters.EC_DRAW_TOOL
		]);
	});

	it('provides an enum of all valid message keys', () => {
		expect(Object.isFrozen(WcMessageKeys)).toBeTrue();
		expect(Object.keys(WcMessageKeys).length).toBe(11);

		expect(WcMessageKeys.ADD_LAYER).toBe('addLayer');
		expect(WcMessageKeys.MODIFY_LAYER).toBe('modifyLayer');
		expect(WcMessageKeys.REMOVE_LAYER).toBe('removeLayer');
		expect(WcMessageKeys.MODIFY_VIEW).toBe('modifyView');
		expect(WcMessageKeys.ZOOM_TO_EXTENT).toBe('zoomToExtent');
		expect(WcMessageKeys.ZOOM_TO_LAYER_EXTENT).toBe('zoomToLayerExtent');
		expect(WcMessageKeys.ADD_MARKER).toBe('addMarker');
		expect(WcMessageKeys.REMOVE_MARKER).toBe('removeMarker');
		expect(WcMessageKeys.CLEAR_MARKERS).toBe('clearMarkers');
		expect(WcMessageKeys.CLEAR_HIGHLIGHTS).toBe('clearHighlights');
		expect(WcMessageKeys.CLOSE_TOOL).toBe('closeTool');
	});
});
