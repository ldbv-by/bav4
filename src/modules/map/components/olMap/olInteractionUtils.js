import { isVertexOfGeometry } from './olGeometryUtils';
import { modifyStyleFunction } from './olStyleUtils';
import { $injector } from '../../../../injection';

export const InteractionStateType = {
	ACTIVE: 'active',
	DRAW: 'draw',
	MODIFY: 'modify',
	SELECT: 'select',
	OVERLAY: 'overlay'
};

export const InteractionSnapType = {
	FIRSTPOINT: 'firstPoint',
	LASTPOINT: 'lastPoint',
	VERTEX: 'vertex',
	EGDE: 'edge',
	FACE: 'face'
};

/**
 * Creates a snapOption-object for calls on openlayers map-objects
 * @param {Layer} interactionLayer the layer with the features to snap on
 * @param {boolean} modifiedFeaturesOnly whether or not only currently modified features a relevant for snapping
 * @returns {Object}
 */
export const getFeatureSnapOption = (interactionLayer, modifiedFeaturesOnly = false) => {
	const filter = modifiedFeaturesOnly ?
		itemLayer => itemLayer === interactionLayer && (itemLayer.getStyle && itemLayer.getStyle() === modifyStyleFunction) :
		itemLayer => itemLayer === interactionLayer;
	return { hitTolerance: 10, layerFilter: filter };
};


/**
 * returns the InteractionSnapType for a possible feature on a defined pixel-position and in a defined layer
 * @param {Map} map the openlayers map
 * @param {Layer} interactionLayer the layer with the feature(s) to snap on
 * @param {Pixel} pixel the position of the snapping
 * @returns {InteractionSnapType| null}
 */
export const getSnapState = (map, interactionLayer, pixel) => {
	let snapType = null;
	let vertexFeature = null;
	let featuresFromInteractionLayerCount = 0;
	map.forEachFeatureAtPixel(pixel, (feature, layer) => {
		if (layer === interactionLayer) {
			featuresFromInteractionLayerCount++;
		}
		if (!layer && feature.get('features').length > 0) {
			vertexFeature = feature;
			return;
		}
	}, getFeatureSnapOption(interactionLayer, true));

	if (vertexFeature) {
		snapType = InteractionSnapType.EGDE;
		const vertexGeometry = vertexFeature.getGeometry();
		const snappedFeature = vertexFeature.get('features')[0];
		const snappedGeometry = snappedFeature.getGeometry();

		if (isVertexOfGeometry(snappedGeometry, vertexGeometry)) {
			snapType = InteractionSnapType.VERTEX;
		}
	}
	if (!vertexFeature && featuresFromInteractionLayerCount > 0) {
		snapType = InteractionSnapType.FACE;
	}
	return snapType;
};


/**
 * returns a list of selectable features for a defined layer on a defined pixel-position
 * @param {Map} map
 * @param {Layer} interactionLayer
 * @param {Pixel} pixel
 * @returns {Array<Feature>} list of selectable features
 */
export const getSelectableFeatures = (map, interactionLayer, pixel) => {
	const features = [];

	map.forEachFeatureAtPixel(pixel, (feature, layer) => {
		if (layer === interactionLayer) {
			features.push(feature);
		}
	}, getFeatureSnapOption(interactionLayer));

	return features;
};

/**
 * removes the defined list of features from the defined layer
 * @param {Array<Feature>} selectedFeatures
 * @param {Layer} interactionLayer the layer, which contains the features
 * @param {Function} additionalAction a additional action before the removing of each feature takes place
 */
export const removeSelectedFeatures = (selectedFeatures, interactionLayer, additionalAction) => {
	const additionalRemoveAction = typeof (additionalAction) === 'function' ? additionalAction : () => { };
	selectedFeatures.forEach(f => {
		additionalRemoveAction(f);
		if (interactionLayer.getSource().hasFeature(f)) {
			interactionLayer.getSource().removeFeature(f);
		}
	});
};

export const getSnapTolerancePerDevice = () => {
	const { EnvironmentService } = $injector.inject('EnvironmentService');
	const environmentService = EnvironmentService;
	if (environmentService.isTouch()) {
		return 12;
	}
	return 4;
};

