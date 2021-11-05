import { FeatureInfoGeometryTypes } from '../../../../../../store/featureInfo/featureInfo.action';
import GeoJSON from 'ol/format/GeoJSON';

/**
 * BVV strategy for mapping an olFeature to a FeatureInfo item.
 * @function
 * @param {coordinate} coordinate3857
 * @returns {number} altitude loaded from backend
 */
export const getBvvFeatureInfo = (olFeature, layer) => {
	if (!olFeature.get('name') && !olFeature.get('description') && !olFeature.get('desc')) {
		return null;
	}

	const name = olFeature.get('name') ? `${olFeature.get('name')} - ${layer.label}` : `${layer.label}`;
	const content = olFeature.get('description') || olFeature.get('desc');
	const geometry = { data: new GeoJSON().writeGeometry(olFeature.getGeometry()), geometryType: FeatureInfoGeometryTypes.GEOJSON };
	return { title: name, content: content || null, geometry: geometry };
};
