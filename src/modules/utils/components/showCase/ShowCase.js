import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import { $injector } from '../../../../injection';
import { closeModal } from '../../../modal/store/modal.action';
import { changeZoomAndCenter } from '../../../../store/position/position.action';
import arrowUpSvg from './assets/arrow-up.svg';
import { activate as activateMeasurement, deactivate as deactivateMeasurement } from '../../../map/store/measurement.action';
import { VectorGeoResource, VectorSourceType } from '../../../../services/domain/geoResources';
import { addLayer } from '../../../../store/layers/layers.action';
import { FileStorageServiceDataTypes } from '../../../../services/FileStorageService';

/**
 * Displays a showcase of common and reusable components or 
 * functional behaviors, which are not finally in place
 * @class
 * @author thiloSchlemmer
 */
export class ShowCase extends BaElement {

	constructor() {
		super();

		const { CoordinateService, EnvironmentService, ShareService, UrlService, GeoResourceService, FileStorageService }
			= $injector.inject('CoordinateService', 'EnvironmentService', 'ShareService', 'UrlService', 'GeoResourceService', 'FileStorageService');
		this._coordinateService = CoordinateService;
		this._environmentService = EnvironmentService;
		this._geoResourceService = GeoResourceService;
		this._urlService = UrlService;
		this._shareService = ShareService;
		this._url = '';
		this._shortUrl = '';
		this._fileStorageService = FileStorageService;
	}

	/**
	 * @override
	 */
	createView() {

		const onClick0 = async () => {
			// changeZoomAndCenter({
			// 	zoom: 13,
			// 	center: this._coordinateService.fromLonLat([11.57245, 48.14021])
			// });

			//Example for persisting vector data and displaying a layer based on a vector georesource
			const label = 'Created internally';
			const data = '<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd"><Document><name>Zeichnung</name><Placemark id="line_1617969798001"><ExtendedData><Data name="type"><value>line</value></Data></ExtendedData><description></description><Style><LineStyle><color>ff0000ff</color><width>3</width></LineStyle><PolyStyle><color>660000ff</color></PolyStyle></Style><LineString><tessellate>1</tessellate><altitudeMode>clampToGround</altitudeMode><coordinates>10.968330802417738,49.3941869069271 10.69854759276084,49.193499720494586 10.9540963604254,49.0671870322957 11.576172631724711,49.24609082578446 11.300121343937633,49.37365261732256 11.136210305450561,49.473824574763526</coordinates></LineString></Placemark></Document></kml>';
			try {
				//persist the data, so we can load it later by a fileId
				const { fileId } = await this._fileStorageService.save(null, data, FileStorageServiceDataTypes.KML);
				//create a georesource and set the data as source
				const vgr = new VectorGeoResource(fileId, label, VectorSourceType.KML).setSource(data, 4326);
				//register georesource
				this._geoResourceService.addOrReplace(vgr);
				//add a layer that displays the georesource in the map
				addLayer(fileId, { label: label });
			}
			catch (ex) {
				console.error(ex);
			}
		};

		const onClick1 = () => {
			changeZoomAndCenter({
				zoom: 11,
				center: this._coordinateService.fromLonLat([11.081, 49.449])
			});
		};
		const onToggle = (event) => {
			// eslint-disable-next-line no-console
			console.log('toggled ' + event.detail.checked);
		};

		const activateMeasrementTool = () => {
			activateMeasurement();
			closeModal();
		};

		const deactivateMeasrementTool = () => {
			deactivateMeasurement();
			closeModal();
		};

		const onGenerateUrlButtonClick = async () => {
			const url = this._shareService.encodeState();
			const shortUrl = await this._urlService.shorten(url);
			await this._shareService.copyToClipboard(url);
			this._url = url;
			this._shortUrl = shortUrl;
			this.render();
		};

		return html`<div>
			<p>Here we present components in random order that:</p>
			<ul>
			<li>are <i>common and reusable</i> components or <i>functional behaviors</i>, who can be added to or extend other components</li>
			<li><i>feature</i> components, which have already been implemented, but have not yet been given the most suitable place...</li>
			</ul>
			<hr>
			<h3>Specific components</h3>
			<p>Theme-Toggle</p>
			<div class='theme-toggle' style="display: flex;justify-content: flex-start;"><ba-theme-toggle></ba-theme-toggle></div>				
			<p>Measure Distance</p>
			<ba-button id='buttonActivateMeasureDistance' label='Measure Distance' type="primary" @click=${activateMeasrementTool}></ba-button>	
			<ba-button id='buttonDeactivateMeasureDistance' label='Deactivate Measure Distance' type="secondary" @click=${deactivateMeasrementTool}></ba-button>	
			
			<p>BaseLayer Switcher</p>
			<div><ba-base-layer-switcher></ba-base-layer-switcher></div>

			<p>Url of State</p>
			<ba-button id='buttonActivateMeasureDistance' label='Copy Url' type="primary" @click=${onGenerateUrlButtonClick}></ba-button>	
			<input readonly='readonly' value=${this._url}></input>	
			<input readonly='readonly' value=${this._shortUrl}></input>	

			<h3>Layer Manager</h3>
			<div>
			<ba-layer-manager></ba-layer-manager>
			</div>
			<h3>Common components or functional behaviors</h3>
			<p>ba-icons</p>
			<div class='icons'>		
						<ba-icon icon='${arrowUpSvg}' @click=${onClick0}></ba-icon>
						<ba-icon icon='${arrowUpSvg}' disabled=true @click=${onClick0}></ba-icon>
						<ba-icon icon='${arrowUpSvg}' size=1 @click=${onClick0}></ba-icon>
						<ba-icon icon='${arrowUpSvg}' size=2.5 @click=${onClick0}></ba-icon>
						
			</div>
			<p>ba-buttons</p>
			<div class='buttons'>		
						<ba-button id='button0' label='primary style' type="primary" @click=${onClick0}></ba-button>
						<ba-button id='button1' label='secondary style' @click=${onClick1}></ba-button>
						<ba-button id='button2' label='disabled' type='primary' disabled=true ></ba-button>
						<ba-button id='button3' label='disabled' disabled=true></ba-button>
			</div>
			<p>Toggle-Button</p>
			<div class='toggle' style="display: flex;justify-content: flex-start;"><ba-toggle id='toggle' title="Toggle" @toggle=${onToggle}><span>Toggle me!</span></ba-toggle></div>
			<p>Checkbox</p>
			<div><ba-checkbox  title="checkbox tible" @toggle=${onToggle}><span>checkbox</span></ba-checkbox></div>
			<div><ba-checkbox  checked=true title="checkbox tible" @toggle=${onToggle}><span>checkbox checked</span></ba-checkbox></div>
			<div><ba-checkbox  disabled=true title="checkbox tible" @toggle=${onToggle}><span>checkbox disabled</span></ba-checkbox></div>
			<div><ba-checkbox  checked=true disabled=true title="checkbox tible" @toggle=${onToggle}><span>checkbox checked disabled</span></ba-checkbox></div>
			<hr>
		</div>`;
	}

	static get tag() {
		return 'ba-showcase';
	}
}