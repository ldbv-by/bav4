/**
 * @module modules/olMap/handler/featureInfo/featureInfoItem_provider
 */
import GeoJSON from 'ol/format/GeoJSON';
import { getLineString, getStats } from '../../utils/olGeometryUtils';
import { $injector } from '../../../../injection';
import { html } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { KML } from 'ol/format';
import { FeatureInfoGeometryTypes } from '../../../../domain/featureInfo';
import { isPrimitive } from '../../../../utils/checks';

/**
 * BVV strategy for mapping an olFeature to a FeatureInfo item.
 * @function
 * @param {Feature} olFeature ol feature
 * @param {module:store/layers/layers_action~LayerProperties} layerProperties layerProperties
 * @returns {module:store/featureInfo/featureInfo_action~FeatureInfo} featureInfo
 */
export const getBvvFeatureInfo = (olFeature, layerProperties) => {
	if (!olFeature.getGeometry()) {
		return null;
	}

	const {
		MapService: mapService,
		SecurityService: securityService,
		GeoResourceService: geoResourceService
	} = $injector.inject('MapService', 'SecurityService', 'GeoResourceService');
	const stats = getStats(olFeature.getGeometry());
	const elevationProfileCoordinates = getLineString(olFeature.getGeometry())?.getCoordinates() ?? [];
	const exportData = new KML().writeFeatures([olFeature], { featureProjection: 'EPSG:' + mapService.getSrid() });

	const getContent = () => {
		const descContent = olFeature.get('description') || olFeature.get('desc');
		const properties = html`
			<table>
				${olFeature
					.getKeys()
					.map((key) => ({ key, prop: olFeature.get(key) }))
					.filter(({ prop }) => isPrimitive(prop))
					.map(
						({ key, prop }) =>
							html`<tr>
								<td>${key}</td>
								<td>${prop}</td>
							</tr>`
					)}
			</table>
		`;
		const geometryContent = html`
		</div>
			<ba-geometry-info .statistics=${stats}></ba-geometry-info>
			<div class='chips__container'>
				<ba-profile-chip .coordinates=${elevationProfileCoordinates}></ba-profile-chip>
				<ba-export-vector-data-chip .exportData=${exportData}></ba-export-vector-data-chip>
			</div>`;

		return descContent
			? html`<div class="content">${unsafeHTML(securityService.sanitizeHtml(descContent))}</div>
					${properties} ${geometryContent}`
			: html`${properties} ${geometryContent}`;
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
