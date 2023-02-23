import { FeatureInfoGeometryTypes } from '../../../../store/featureInfo/featureInfo.action';
import GeoJSON from 'ol/format/GeoJSON';
import { getLineString, getStats } from '../../utils/olGeometryUtils';
import { $injector } from '../../../../injection';
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
	const { MapService: mapService, SecurityService: securityService, GeoResourceService: geoResourceService } = $injector.inject('MapService', 'SecurityService', 'GeoResourceService');
	const stats = getStats(olFeature.getGeometry(), { fromProjection: 'EPSG:' + mapService.getSrid(), toProjection: 'EPSG:' + mapService.getDefaultGeodeticSrid() });
	const elevationProfileCoordinates = getLineString(olFeature.getGeometry())?.getCoordinates() ?? [];
	const getContent = () => {
		const descContent = olFeature.get('description') || olFeature.get('desc');
		const geometryContent = html`</div><ba-geometry-info .statistics=${stats}></ba-geometry-info><div class='chips__container'><ba-profile-chip .coordinates=${elevationProfileCoordinates}></ba-profile-chip>`;

		return descContent ? html`<div class="content">${unsafeHTML(securityService.sanitizeHtml(descContent))}</div>${geometryContent}` : html`${geometryContent}`;
	};

	const geoRes = geoResourceService.byId(layerProperties.geoResourceId);
	const name = olFeature.get('name') ? `${securityService.sanitizeHtml(olFeature.get('name'))} - ${geoRes.label}` : `${geoRes.label}`;
	const content = getContent();
	const geometry = { data: new GeoJSON().writeGeometry(olFeature.getGeometry()), geometryType: FeatureInfoGeometryTypes.GEOJSON };
	return { title: name, content: content, geometry: geometry };
};
