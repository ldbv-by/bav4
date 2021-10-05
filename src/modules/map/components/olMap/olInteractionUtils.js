import { isVertexOfGeometry } from './olGeometryUtils';
import { modifyStyleFunction } from './olStyleUtils';

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


export const getFeatureSnapOption = (interactionLayer, modifiedFeaturesOnly = false) => {
	const filter = modifiedFeaturesOnly ?
		itemLayer => itemLayer === interactionLayer || (itemLayer.getStyle && itemLayer.getStyle() === modifyStyleFunction) :
		itemLayer => itemLayer === interactionLayer;
	return { hitTolerance: 10, layerFilter: filter };
};

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
