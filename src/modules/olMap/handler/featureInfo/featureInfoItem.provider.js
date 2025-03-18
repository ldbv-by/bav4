/**
 * @module modules/olMap/handler/featureInfo/featureInfoItem_provider
 */
import GeoJSON from 'ol/format/GeoJSON';
import { getLineString, getStats } from '../../utils/olGeometryUtils';
import { $injector } from '../../../../injection';
import { html } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { KML } from 'ol/format';
import { BaGeometry } from '../../../../domain/geometry';
import { BaFeature } from '../../../../domain/feature';
import { SourceType, SourceTypeName } from '../../../../domain/sourceType';

/**
 * BVV specific implementation of {@link module:modules/olMap/handler/featureInfo/OlFeatureInfoHandler~featureInfoProvider}
 * @function
 * @type {module:modules/olMap/handler/featureInfo/OlFeatureInfoHandler~featureInfoProvider}
 */
export const bvvFeatureInfoProvider = (olFeature, layerProperties) => {
	if (!olFeature.get('name') && !olFeature.get('description') && !olFeature.get('desc') && !olFeature.getGeometry()) {
		return null;
	}

	const {
		MapService: mapService,
		SecurityService: securityService,
		GeoResourceService: geoResourceService
	} = $injector.inject('MapService', 'SecurityService', 'GeoResourceService');
	const geometryStatistic = getStats(olFeature.getGeometry());
	const elevationProfileCoordinates = getLineString(olFeature.getGeometry())?.getCoordinates() ?? [];
	const exportDataAsKML = new KML().writeFeatures([olFeature], { featureProjection: 'EPSG:' + mapService.getSrid() });

	const getContent = () => {
		const descContent = olFeature.get('description') || olFeature.get('desc');
		const geometryContent = html`
		</div>
			<ba-geometry-info .statistic=${geometryStatistic}></ba-geometry-info>
			<div class='chips__container'>
				<ba-profile-chip .coordinates=${elevationProfileCoordinates}></ba-profile-chip>
				<ba-export-vector-data-chip .exportData=${exportDataAsKML}></ba-export-vector-data-chip>
				<ba-feature-info-collection-panel .configuration=${{ feature: new BaFeature(new BaGeometry(exportDataAsKML, SourceType.forKml()), olFeature.getId()), geoResourceId: geoRes?.id ?? null }}></ba-feature-info-collection-panel>
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
	const geometry = new BaGeometry(new GeoJSON().writeGeometry(olFeature.getGeometry()), new SourceType(SourceTypeName.GEOJSON));
	return { title: name, content, geometry };
};
