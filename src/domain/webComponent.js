/**
 * @module domain/webComponent
 */

import { QueryParameters } from './queryParameters';

/**
 * Enumeration of custom DOM event names dispatched by the <bayern-atlas> web component.
 *
 * Each property is the string name of a CustomEvent emitted by the component. Events are intended
 * to be listened for on the component instance (or bubbled to ancestor elements). Unless otherwise
 * documented for a specific event, listeners should assume the event is a CustomEvent with a
 * `detail` object containing event-specific payload, and that events may bubble and be composed.
 *
 * @enum {string}
 * @readonly
 */
export const WcEvents = Object.freeze({
	LOAD: 'baLoad',

	CHANGE: 'baChange',

	GEOMETRY_CHANGE: 'baGeometryChange',

	FEATURE_SELECT: 'baFeatureSelect'
});

/**
 * Defines a list of supported attributes
 * @readonly
 */
export const WcAttributes = Object.freeze([
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

/**
 * Enumeration of message keys broadcast bay the public WebComponent
 * @enum {string}
 * @readonly
 */
export const WcMessageKeys = Object.freeze({
	ADD_LAYER: 'addLayer',
	MODIFY_LAYER: 'modifyLayer',
	REMOVE_LAYER: 'removeLayer',
	MODIFY_VIEW: 'modifyView',
	ZOOM_TO_EXTENT: 'zoomToExtent',
	ZOOM_TO_LAYER_EXTENT: 'zoomToLayerExtent',
	ADD_MARKER: 'addMarker',
	REMOVE_MARKER: 'removeMarker',
	CLEAR_MARKERS: 'clearMarkers',
	CLEAR_HIGHLIGHTS: 'clearHighlights'
});
