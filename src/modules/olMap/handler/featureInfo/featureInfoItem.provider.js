/**
 * @module modules/olMap/handler/featureInfo/featureInfoItem_provider
 */
import { FeatureInfoGeometryTypes } from '../../../../store/featureInfo/featureInfo.action';
import GeoJSON from 'ol/format/GeoJSON';
import {
	getLineString,
	getStats,
	PROFILE_GEOMETRY_SIMPLIFY_MAX_COUNT_COORDINATES,
	PROFILE_GEOMETRY_SIMPLIFY_DISTANCE_TOLERANCE_3857,
	simplify
} from '../../utils/olGeometryUtils';
import { $injector } from '../../../../injection';
import { html } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { KML } from 'ol/format';

/**
 * BVV strategy for mapping an olFeature to a FeatureInfo item.
 * @function
 * @param {Feature} olFeature ol feature
 * @param {module:store/layers/layers_action~LayerProperties} layerProperties layerProperties
 * @returns {module:store/featureInfo/featureInfo_action~FeatureInfo} featureInfo
 */
export const getBvvFeatureInfo = (olFeature, layerProperties) => {
	if (!olFeature.get('name') && !olFeature.get('description') && !olFeature.get('desc') && !olFeature.getGeometry()) {
		return null;
	}

	const {
		MapService: mapService,
		SecurityService: securityService,
		GeoResourceService: geoResourceService
	} = $injector.inject('MapService', 'SecurityService', 'GeoResourceService');
	const stats = getStats(olFeature.getGeometry(), {
		fromProjection: 'EPSG:' + mapService.getSrid(),
		toProjection: 'EPSG:' + mapService.getLocalProjectedSrid(),
		toProjectionExtent: mapService.getLocalProjectedSridExtent()
	});
	const elevationProfileCoordinates =
		simplify(
			getLineString(olFeature.getGeometry()),
			PROFILE_GEOMETRY_SIMPLIFY_MAX_COUNT_COORDINATES,
			PROFILE_GEOMETRY_SIMPLIFY_DISTANCE_TOLERANCE_3857
		)?.getCoordinates() ?? [];
	const exportData = new KML().writeFeatures([olFeature], { featureProjection: 'EPSG:' + mapService.getSrid() });

	const getContent = () => {
		const descContent = olFeature.get('description') || olFeature.get('desc');
		const geometryContent = html`
		</div>
			<ba-geometry-info .statistics=${stats}></ba-geometry-info>
			<div class='chips__container'>
				<ba-profile-chip .coordinates=${elevationProfileCoordinates}></ba-profile-chip>
				<ba-export-vector-data-chip .exportData=${exportData}></ba-export-vector-data-chip>
			</div>`;

		return descContent
			? html`<div class="content">${unsafeHTML(securityService.sanitizeHtml(descContent))}</div>
					${geometryContent}`
			: html`${geometryContent}`;
	};

	const geoRes = geoResourceService.byId(layerProperties.geoResourceId);
	const name = geoRes
		? olFeature.get('name')
			? `${securityService.sanitizeHtml(olFeature.get('name'))} - ${geoRes.label}`
			: `${geoRes.label}`
		: `${securityService.sanitizeHtml(olFeature.get('name') ?? '')}`;
	const content = getContent();
	const geometry = { data: new GeoJSON().writeGeometry(olFeature.getGeometry()), geometryType: FeatureInfoGeometryTypes.GEOJSON };
	return { title: name, content: content, geometry: geometry };
};
