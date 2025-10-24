/**
 * @module modules/utils/components/showCase/testPanels/VectorDataStylingTestPanel
 */
import { html } from 'lit-html';
import { MvuElement } from '../../../../MvuElement';
import { $injector } from '../../../../../injection/index';
import { addLayer } from '../../../../../store/layers/layers.action';
import { VectorGeoResource, VectorSourceType } from '../../../../../domain/geoResources';
import { BaFeature } from '../../../../../domain/feature';
import { BaGeometry } from '../../../../../domain/geometry';
import { SourceType } from '../../../../../domain/sourceType';
import { createUniqueId } from '../../../../../utils/numberUtils';
import { StyleHint } from '../../../../../domain/styles';

/**
 * Test panel for VectorData styling
 * @class
 */
export class VectorDataStylingTestPanel extends MvuElement {
	constructor() {
		super();
		const { ImportVectorDataService, GeoResourceService } = $injector.inject('ImportVectorDataService', 'GeoResourceService');
		this._importVectorDataService = ImportVectorDataService;
		this._geoResourceService = GeoResourceService;
	}

	createView() {
		const ewkt = 'SRID=3857;POINT Z(1175135.201038777 6407648.071937083 0)';
		const geoResourceStyle = { baseColor: '#f08126' };
		const layerStyle = { baseColor: '#57C785' };
		const featureStyle = { baseColor: '#2A7B9B' };

		const newFeature = () => new BaFeature(new BaGeometry(ewkt, SourceType.forEwkt(3857)), `${createUniqueId()}`);

		const add_WithoutStyle = () => {
			const vgr_noStyle = new VectorGeoResource(`${createUniqueId()}`, 'No Style at all').addFeature(newFeature()).setHidden(true);

			this._geoResourceService.addOrReplace(vgr_noStyle);
			addLayer(vgr_noStyle.id);
		};

		const add_GeoResourceWithStyleHint = () => {
			const vgr_GeoResourceStyle = new VectorGeoResource(`${createUniqueId()}`, 'GeoResource has StyleHint')
				.addFeature(newFeature())
				.setStyleHint(StyleHint.HIGHLIGHT)
				.setHidden(true);

			this._geoResourceService.addOrReplace(vgr_GeoResourceStyle);
			addLayer(vgr_GeoResourceStyle.id);
		};

		const add_GeoResourceWithStyle = () => {
			const vgr_GeoResourceStyle = new VectorGeoResource(`${createUniqueId()}`, 'GeoResource has Style')
				.addFeature(newFeature())
				.setStyleHint(StyleHint.HIGHLIGHT)
				.setStyle(geoResourceStyle)
				.setHidden(true);

			this._geoResourceService.addOrReplace(vgr_GeoResourceStyle);
			addLayer(vgr_GeoResourceStyle.id);
		};

		const add_LayerWithStyle = () => {
			const vgr_GeoResourceStyle = new VectorGeoResource(`${createUniqueId()}`, 'Layer has Style')
				.addFeature(newFeature())
				.setStyleHint(StyleHint.HIGHLIGHT)
				.setStyle(geoResourceStyle)
				.setHidden(true);

			this._geoResourceService.addOrReplace(vgr_GeoResourceStyle);
			addLayer(vgr_GeoResourceStyle.id, { style: layerStyle });
		};

		const add_BaFeatureWithStyleHint = () => {
			const vgr_GeoResourceStyle = new VectorGeoResource(`${createUniqueId()}`, 'BaFeature has StyleHint')
				.addFeature(newFeature().setStyleHint(StyleHint.HIGHLIGHT))
				.setStyle(geoResourceStyle)
				.setHidden(true);

			this._geoResourceService.addOrReplace(vgr_GeoResourceStyle);
			addLayer(vgr_GeoResourceStyle.id);
		};

		const add_BaFeatureWithStyle = () => {
			const vgr_GeoResourceStyle = new VectorGeoResource(`${createUniqueId()}`, 'BaFeature has Style')
				.addFeature(newFeature().setStyle(featureStyle))
				.setStyleHint(StyleHint.HIGHLIGHT)
				.setStyle(geoResourceStyle)
				.setHidden(true);

			this._geoResourceService.addOrReplace(vgr_GeoResourceStyle);
			addLayer(vgr_GeoResourceStyle.id, { style: layerStyle });
		};

		const add_DataSourceHasStyle = async () => {
			const kml =
				'<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd"><Document><name>Drawing</name><Placemark id="draw_marker_1751472597861"><Style><IconStyle><scale>1.125</scale><Icon><href>https://services.atlas.bayern.de/icons/255,0,0/marker.png</href><gx:w>48</gx:w><gx:h>48</gx:h></Icon><hotSpot x="24" y="0" xunits="pixels" yunits="pixels"/></IconStyle></Style><Point><coordinates>10.5564198,49.7764351</coordinates></Point></Placemark></Document></kml>';
			const vgr_GeoResourceStyle = new VectorGeoResource(`${createUniqueId()}`, 'Data Source has its own Style', VectorSourceType.KML)
				.setSource(kml, 4326)
				.setStyleHint(StyleHint.HIGHLIGHT)
				.setStyle(geoResourceStyle)
				.setHidden(true);

			this._geoResourceService.addOrReplace(vgr_GeoResourceStyle);
			addLayer(vgr_GeoResourceStyle.id, { style: layerStyle });
		};

		const kmlWithPlacemarkName =
			'<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd"><Placemark id="draw_marker_1761131323377"><name>Feature Label</name><Style><IconStyle><scale>1.125</scale><Icon><href>https://services.atlas.bayern.de/icons/255,0,0/marker.png</href><gx:w>48</gx:w><gx:h>48</gx:h></Icon><hotSpot x="24" y="0" xunits="pixels" yunits="pixels"/></IconStyle><LabelStyle><color>ff0000ff</color><scale>1.5</scale></LabelStyle></Style><ExtendedData><Data name="showPointNames"><value>true</value></Data></ExtendedData><Point><coordinates>12.13020862,49.03296179,0</coordinates></Point></Placemark></kml>';

		const add_NoFeatureLabels = async () => {
			const vgr_GeoResourceStyle = new VectorGeoResource(`${createUniqueId()}`, 'No feature labels at all', VectorSourceType.KML)
				.setSource(kmlWithPlacemarkName, 4326)
				.setShowPointNames(false)
				.setHidden(true);

			this._geoResourceService.addOrReplace(vgr_GeoResourceStyle);
			addLayer(vgr_GeoResourceStyle.id);
		};

		const add_FeatureLabelsAllowedByGeoResource = async () => {
			const vgr_GeoResourceStyle = new VectorGeoResource(`${createUniqueId()}`, 'GeoResource allows labels', VectorSourceType.KML)
				.setSource(kmlWithPlacemarkName, 4326)
				.setShowPointNames(true)
				.setHidden(true);

			this._geoResourceService.addOrReplace(vgr_GeoResourceStyle);
			addLayer(vgr_GeoResourceStyle.id);
		};

		const add_FeatureLabelsAllowedByLayer = async () => {
			const vgr_GeoResourceStyle = new VectorGeoResource(`${createUniqueId()}`, 'Layer allows labels', VectorSourceType.KML)
				.setSource(kmlWithPlacemarkName, 4326)
				.setShowPointNames(false)
				.setHidden(true);

			this._geoResourceService.addOrReplace(vgr_GeoResourceStyle);
			addLayer(vgr_GeoResourceStyle.id, { constraints: { displayFeatureLabels: true } });
		};

		const add_FeatureLabelsDisabledByGeoLayer = async () => {
			const vgr_GeoResourceStyle = new VectorGeoResource(`${createUniqueId()}`, 'Layer denies labels', VectorSourceType.KML)
				.setSource(kmlWithPlacemarkName, 4326)
				.setShowPointNames(true)
				.setHidden(true);

			this._geoResourceService.addOrReplace(vgr_GeoResourceStyle);
			addLayer(vgr_GeoResourceStyle.id, { constraints: { displayFeatureLabels: false } });
		};

		return html`
			<h3>Vector Data Styling</h3>
			<div class="example row">
				<ba-button .label=${'No Style at all'} .type=${'primary'} @click=${add_WithoutStyle}></ba-button>
				<ba-button .label=${'GeoResource has StyleHint'} .type=${'primary'} @click=${add_GeoResourceWithStyleHint}></ba-button>
				<ba-button .label=${'GeoResource has Style'} .type=${'primary'} @click=${add_GeoResourceWithStyle}></ba-button>
				<ba-button .label=${'Layer has Style'} .type=${'primary'} @click=${add_LayerWithStyle}></ba-button>
				<ba-button .label=${'BaFeature has StyleHint'} .type=${'primary'} @click=${add_BaFeatureWithStyleHint}></ba-button>
				<ba-button .label=${'BaFeature has Style'} .type=${'primary'} @click=${add_BaFeatureWithStyle}></ba-button>
				<ba-button .label=${'Data source has its own Style'} .type=${'primary'} @click=${add_DataSourceHasStyle}></ba-button>
			</div>

			<h3>Vector Data Labeling</h3>
			<div class="example row">
				<ba-button .label=${'No feature labels at all'} .type=${'primary'} @click=${add_NoFeatureLabels}></ba-button>
				<ba-button .label=${'GeoResource allows labels'} .type=${'primary'} @click=${add_FeatureLabelsAllowedByGeoResource}></ba-button>
				<ba-button .label=${'Layer allows labels'} .type=${'primary'} @click=${add_FeatureLabelsAllowedByLayer}></ba-button>
				<ba-button .label=${'Layer denies labels'} .type=${'primary'} @click=${add_FeatureLabelsDisabledByGeoLayer}></ba-button>
			</div>
		`;
	}

	static get tag() {
		return 'ba-vector-data-styling-test-panel';
	}
}
