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
import { SourceType } from '../../../../domain/sourceType';
import { EXCLUDED_COMMON_FEATURE_PROPERTY_KEYS, isInternalProperty, LEGACY_INTERNAL_FEATURE_PROPERTY_KEYS } from '../../../../utils/propertyUtils';
import { nothing } from '../../../../../node_modules/lit-html/lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import { isObject } from '../../../../utils/checks';

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
		GeoResourceService: geoResourceService,
		TranslationService: translationService,
		ImportOafService: importOafService
	} = $injector.inject('MapService', 'SecurityService', 'GeoResourceService', 'TranslationService', 'ImportOafService');
	const translate = (key) => translationService.translate(key);
	const geometryStatistic = getStats(olFeature.getGeometry());
	const elevationProfileCoordinates = getLineString(olFeature.getGeometry())?.getCoordinates() ?? [];
	const exportDataAsKML = new KML().writeFeatures([olFeature], { featureProjection: 'EPSG:' + mapService.getSrid() });
	const geoRes = geoResourceService.byId(layerProperties.geoResourceId);
	const oafCapabilities = importOafService.getFilterCapabilitiesFromCache(geoRes);
	const replaceOafQueryableIdByTitle = (id) => oafCapabilities?.queryables?.find((q) => q.id === id)?.title ?? id;

	const toggleCollapse = (e) => {
		e.currentTarget.classList.toggle('propshide');
	};

	const propsClasses = {
		propshide: olFeature.get('description') || olFeature.get('desc')
	};

	const getPropertiesTable = (props) => {
		const entries = Object.entries(props)
			.filter((entry) => !isInternalProperty(entry[0]))
			.filter((entry) => !LEGACY_INTERNAL_FEATURE_PROPERTY_KEYS.includes(entry[0]))
			.filter((entry) => !EXCLUDED_COMMON_FEATURE_PROPERTY_KEYS.includes(entry[0]));
		return entries.length
			? html`
					<button class="prop-header ba-list-item ba-list-item__header  ${classMap(propsClasses)}" @click="${toggleCollapse}">
						<span class="ba-list-item__text  ba-list-item__primary-text">${translate('olMap_handler_featureInfo_feature_properties')}</span>
						<span class="ba-list-item__after">
							<i class="icon icon-rotate-90 chevron "></i>
						</span>
					</button>
					<table id="props-table" class="props-table">
						<tbody>
							${entries.map((entry) => {
								const [key, value] = entry;
								const values = Array.isArray(value) ? value : [value];
								return html`<tr>
									<td>${replaceOafQueryableIdByTitle(key)}</td>
									<td>${values.map((v) => html`<div>${unsafeHTML(securityService.sanitizeHtml(isObject(v) ? JSON.stringify(v) : v))}</div>`)}</td>
								</tr>`;
							})}
						</tbody>
					</table>
				`
			: nothing;
	};

	const getContent = () => {
		const descContent = olFeature.get('description') || olFeature.get('desc');
		const propertiesTable = getPropertiesTable(olFeature.getProperties());
		const geometryContent = html`
		</div>
			<ba-geometry-info .statistic=${geometryStatistic}></ba-geometry-info>
			<div class='chips__container'>
				<ba-profile-chip .coordinates=${elevationProfileCoordinates}></ba-profile-chip>
				<ba-export-vector-data-chip .exportData=${exportDataAsKML}></ba-export-vector-data-chip>
				<ba-feature-info-collection-panel .configuration=${{ feature: new BaFeature(new BaGeometry(exportDataAsKML, SourceType.forKml()), olFeature.getId().toString()), geoResourceId: geoRes?.id ?? null }}></ba-feature-info-collection-panel>
			</div>`;

		return descContent
			? html`<div class="content">${unsafeHTML(securityService.sanitizeHtml(descContent))} ${propertiesTable} ${geometryContent}</div>`
			: html`${propertiesTable} ${geometryContent} `;
	};

	const name = geoRes
		? olFeature.get('name')
			? `${securityService.sanitizeHtml(olFeature.get('name'))} - ${geoRes.label}`
			: `${geoRes.label}`
		: `${securityService.sanitizeHtml(olFeature.get('name') ?? '')}`;
	const content = getContent();
	const geometry = new BaGeometry(new GeoJSON().writeGeometry(olFeature.getGeometry()), SourceType.forGeoJSON());
	return { title: name, content, geometry };
};
