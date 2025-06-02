/**
 * @module domain/styles
 */
/**
 * @readonly
 * @enum {String}
 */
export const StyleSize = Object.freeze({
	SMALL: 'small',
	MEDIUM: 'medium',
	LARGE: 'large'
});

/**
 * StyleHint (styling theme) of a {@link AbstractVectorGeoResource} or a {@link BaFeature}
 * @readonly
 * @enum {string}
 */
export const StyleHint = Object.freeze({
	HIGHLIGHT: 'highlight',
	CLUSTER: 'cluster'
});

/**
 * Style of a {@link Layer }, a  {@link AbstractVectorGeoResource} or a {@link BaFeature}
 * @typedef {Object} LayerStyle
 * @property {string} [baseColor=null] A simple base color as style for this layer
 */
