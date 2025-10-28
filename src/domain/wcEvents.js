/**
 * @module domain/wcEvents
 */
/**
 * Enum which holds all events triggered by the public Web Component
 * @readonly
 * @enum {String}
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
 *
 * @property {string} LOAD
 * 'ba-load' — Emitted once when the public web component has finished initializing and its
 * internal resources (for example an iframe or remote data) have successfully loaded.
 *
 * @property {string} CHANGE
 * 'ba-change' — Emitted whenever a public property or configuration of the component changes.
 * Useful for observing reactive updates originating from the component.
 *
 * @property {string} GEOMETRY_CHANGE
 * 'ba-geometry-change' — TODO
 *
 * @property {string} FEATURE_SELECT
 * 'ba-feature-select' — TODO
 *
 * @example
 * // Listen for the component to be ready:
 * element.addEventListener(WcEvents.LOAD, (evt) => { / safe to interact with component / });
 *
 * @see CustomEvent
 */
export const WcEvents = Object.freeze({
	LOAD: 'ba-load',

	CHANGE: 'ba-change',

	GEOMETRY_CHANGE: 'ba-geometry-change',

	FEATURE_SELECT: 'ba-feature-select'
});
