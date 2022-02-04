import { FeatureInfoGeometryTypes } from '../../../../../../store/featureInfo/featureInfo.action';
import GeoJSON from 'ol/format/GeoJSON';
import { getStats } from '../../olGeometryUtils';
import { $injector } from '../../../../../../injection';
import { html } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';

/**
 * BVV strategy for mapping an olFeature to a FeatureInfo item.
 * @function
 * @param {Feature} olFeature ol feature
 * @param {LayerProperties} layerProperties layerProperties
 * @returns {FeatureInfo} featureInfo
 */
export const getBvvFeatureInfo = (olFeature, layerProperties) => {
	if (!olFeature.get('name') && !olFeature.get('description') && !olFeature.get('desc') && !olFeature.getGeometry()) {
		return null;
	}
	const { MapService: mapService } = $injector.inject('MapService');
	const stats = getStats(olFeature.getGeometry(), { fromProjection: 'EPSG:' + mapService.getSrid(), toProjection: 'EPSG:' + mapService.getDefaultGeodeticSrid() });

	const getContent = () => {
		const descContent = olFeature.get('description') || olFeature.get('desc');
		const geometryContent = html`<ba-geometry-info .statistics=${stats}></ba-geometry-info>`;

		return descContent ? html`${unsafeHTML(descContent)}${geometryContent}` : html`${geometryContent}`;
	};


	const name = olFeature.get('name') ? `${olFeature.get('name')} - ${layerProperties.label}` : `${layerProperties.label}`;
	const content = getContent();
	const geometry = { data: new GeoJSON().writeGeometry(olFeature.getGeometry()), geometryType: FeatureInfoGeometryTypes.GEOJSON };
	return { title: name, content: content, geometry: geometry };
};
