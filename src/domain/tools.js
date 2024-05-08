/**
 * @module domain/tools
 */
/**
 * Enum which holds all valid tool ids.
 * @readonly
 * @enum {String}
 */
export const Tools = Object.freeze({
	MEASURE: 'measure',
	DRAW: 'draw',
	SHARE: 'share',
	IMPORT: 'import',
	EXPORT: 'export',
	ROUTING: 'routing'
});

/**
 * Enum of tools that are available for the public web component.
 * @constant {Array<Tools>}
 */
export const WcTools = Object.freeze([Tools.DRAW]);
