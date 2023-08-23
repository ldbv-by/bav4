/**
 * @module modules/olMap/utils/olInteractionUtils
 */
import { isVertexOfGeometry } from './olGeometryUtils';
import { modifyStyleFunction } from './olStyleUtils';
import { $injector } from '../../../injection';
import { noModifierKeys, singleClick } from 'ol/events/condition';

/**
 * @readonly
 * @enum {String}
 */
export const InteractionStateType = Object.freeze({
	ACTIVE: 'active',
	DRAW: 'draw',
	MODIFY: 'modify',
	SELECT: 'select',
	OVERLAY: 'overlay'
});

/**
 * @readonly
 * @enum {String}
 */
export const InteractionSnapType = Object.freeze({
	FIRSTPOINT: 'firstPoint',
	LASTPOINT: 'lastPoint',
	VERTEX: 'vertex',
	EDGE: 'edge',
	FACE: 'face'
});

/**
 * Creates a snapOption-object for calls on openlayers map-objects
 * @param {Layer} interactionLayer the layer with the features to snap on
 * @param {boolean} modifiedFeaturesOnly whether or not only currently modified features a relevant for snapping
 * @returns {Object}
 */
export const getFeatureSnapOption = (interactionLayer, modifiedFeaturesOnly = false) => {
	if (modifiedFeaturesOnly) {
		return {
			hitTolerance: 10,
			layerFilter: (itemLayer) => itemLayer === interactionLayer || (itemLayer.getStyle && itemLayer.getStyle() === modifyStyleFunction)
		};
	}
	return { hitTolerance: 10, layerFilter: (itemLayer) => itemLayer === interactionLayer };
};

/**
 * Creates a standard option-object for a openlayers select-interaction, to make
 * all features in the defined layer selectable
 * @param {Layer} interactionLayer the interactionLayer with possible selectable features
 * @returns {Object} the option-object for the select-interaction
 */
export const getSelectOptions = (interactionLayer) => {
	const layerFilter = (itemLayer) => {
		return itemLayer === interactionLayer;
	};
	const featureFilter = (itemFeature, itemLayer) => {
		if (layerFilter(itemLayer)) {
			return itemFeature;
		}
		return null;
	};
	return {
		layers: layerFilter,
		filter: featureFilter,
		style: null
	};
};

/**
 * Creates a standard optn-object for a openlayers modify-interaction, to make
 * all features in the defined feature-collection modifyable
 * @param {Collection<Feature>} modifyableFeatures the collection of all possible modifyable features
 * @returns {Object} the option-object
 */
export const getModifyOptions = (modifyableFeatures) => {
	return {
		features: modifyableFeatures,
		style: modifyStyleFunction,
		deleteCondition: (event) => {
			const isDeletable = noModifierKeys(event) && singleClick(event);
			return isDeletable;
		}
	};
};

/**
 * returns the InteractionSnapType for a possible feature on a defined pixel-position and in a defined layer
 * @param {Map} map the openlayers map
 * @param {Layer} interactionLayer the layer with the feature(s) to snap on
 * @param {Pixel} pixel the position of the snapping
 * @returns {InteractionSnapType| null}
 */
export const getSnapState = (map, interactionLayer, pixel) => {
	const featuresFromInteractionLayer = [];
	const vertexFeature = map.forEachFeatureAtPixel(
		pixel,
		(feature, layer) => {
			if (layer === interactionLayer) {
				featuresFromInteractionLayer.push(feature);
			}
			if (!layer && feature.get('features').length > 0) {
				return feature;
			}
		},
		getFeatureSnapOption(interactionLayer, true)
	);

	if (vertexFeature) {
		const vertexGeometry = vertexFeature.getGeometry();
		const snappedFeature = vertexFeature.get('features')[0];
		const snappedGeometry = snappedFeature.getGeometry();

		if (isVertexOfGeometry(snappedGeometry, vertexGeometry)) {
			return InteractionSnapType.VERTEX;
		}
		return InteractionSnapType.EDGE;
	}
	if (!vertexFeature && featuresFromInteractionLayer.length > 0) {
		return InteractionSnapType.FACE;
	}
	return null;
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

	map.forEachFeatureAtPixel(
		pixel,
		(feature, layer) => {
			if (layer === interactionLayer) {
				features.push(feature);
			}
		},
		getFeatureSnapOption(interactionLayer)
	);

	return features;
};

/**
 * removes the defined list of features from the defined layer
 * @param {Array<Feature>} selectedFeatures
 * @param {Layer} interactionLayer the layer, which contains the features
 * @param {Function} [additionalAction] an additional action before the removal of each feature takes place
 */
export const removeSelectedFeatures = (selectedFeatures, interactionLayer, additionalAction) => {
	const additionalRemoveAction = typeof additionalAction === 'function' ? additionalAction : () => {};
	selectedFeatures.forEach((f) => {
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
