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
 * List of tools that are available for the embed mode.
 * @constant {Array<Tools>}
 */
export const EmbedTools = Object.freeze([Tools.DRAW]);
