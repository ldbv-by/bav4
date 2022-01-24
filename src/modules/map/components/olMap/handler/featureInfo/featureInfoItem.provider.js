import { FeatureInfoGeometryTypes } from '../../../../../../store/featureInfo/featureInfo.action';
import GeoJSON from 'ol/format/GeoJSON';
import { getStats } from '../../olGeometryUtils';
import { $injector } from '../../../../../../injection';

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
	const { MapService: mapService } = $injector.inject('MapService');
	const stats = getStats(olFeature.getGeometry(), { fromProjection: 'EPSG:' + mapService.getSrid(), toProjection: 'EPSG:' + mapService.getDefaultGeodeticSrid() });

	const name = olFeature.get('name') ? `${olFeature.get('name')} - ${layerProperties.label}` : `${layerProperties.label}`;
	const content = olFeature.get('description') || olFeature.get('desc');
	const geometry = { data: new GeoJSON().writeGeometry(olFeature.getGeometry()), geometryType: FeatureInfoGeometryTypes.GEOJSON, statistics: stats };
	return { title: name, content: content || null, geometry: geometry };
};
