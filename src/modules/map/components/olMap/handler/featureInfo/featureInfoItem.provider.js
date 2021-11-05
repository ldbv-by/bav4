import { FeatureInfoGeometryTypes } from '../../../../../../store/featureInfo/featureInfo.action';
import GeoJSON from 'ol/format/GeoJSON';

/**
 * BVV strategy for mapping an olFeature to a FeatureInfo item.
 * @function
 * @param {Feature} olFeature ol feature
 * @param {LayerProperties} layerProperties layerProperties
 * @returns {FeatureInfo} featureInfo
 */
export const getBvvFeatureInfo = (olFeature, layerProperties) => {
	if (!olFeature.get('name') && !olFeature.get('description') && !olFeature.get('desc')) {
		return null;
	}

	const name = olFeature.get('name') ? `${olFeature.get('name')} - ${layerProperties.label}` : `${layerProperties.label}`;
	const content = olFeature.get('description') || olFeature.get('desc');
	const geometry = { data: new GeoJSON().writeGeometry(olFeature.getGeometry()), geometryType: FeatureInfoGeometryTypes.GEOJSON };
	return { title: name, content: content || null, geometry: geometry };
};
