/**
 * @module domain/wcEvents
 */

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
 * @name WcEvents
 */
export const WcEvents = Object.freeze({
	LOAD: 'ba-load',

	CHANGE: 'ba-change',

	GEOMETRY_CHANGE: 'ba-geometry-change',

	FEATURE_SELECT: 'ba-feature-select'
});
