import { html, nothing } from 'lit';
import { BaElement } from '../../../BaElement';
import css from './mapContextMenuContent.css';
import { $injector } from '../../../../injection';
import clipboardIcon from './assets/clipboard.svg';


export class MapContextMenuContent extends BaElement {

	constructor() {
		super();
		const {
			MapService: mapService,
			CoordinateService: coordinateService,
			TranslationService: translationService,
			ShareService: shareService,
			AltitudeService: altitudeService,
			AdministrationService: administrationService
		} = $injector.inject('MapService', 'CoordinateService', 'TranslationService', 'ShareService', 'AltitudeService', 'AdministrationService');

		this._mapService = mapService;
		this._coordinateService = coordinateService;
		this._translationService = translationService;
		this._shareService = shareService;
		this._altitudeService = altitudeService;
		this._administrationService = administrationService;

		this._altitude = null;
		this._community = null;
		this._district = null;
	}

	set coordinate(coordinateInMapSrid) {
		this._coordinate = coordinateInMapSrid;
		this._getAltitude();
		this._getAdministration();
	}

	/**
	 * @private
	 */
	async _getAltitude() {
		try {
			this._altitude = await this._altitudeService.getAltitude(this._coordinate) + ' (m)';
		}
		catch (e) {
			this._altitude = '-';
			console.warn(e.message);
		}
		this.render();
	}

	/**
	 * @private
	 */
	async _getAdministration() {
		try {
			const administration = await this._administrationService.getAdministration(this._coordinate);
			this._community = administration.community;
			this._district = administration.district;
		}
		catch (e) {
			this._community = '-';
			this._district = '-';
			console.warn(e.message);
		}
		this.render();
	}


	createView() {
		const translate = (key) => this._translationService.translate(key);


		if (this._coordinate) {
			const sridDefinitions = this._mapService.getSridDefinitionsForView(this._coordinate);
			const stringifiedCoords = sridDefinitions.map(definition => {
				const { label, code } = definition;
				const transformedCoordinate = this._coordinateService.transform(this._coordinate, this._mapService.getSrid(), code);

				const copyCoordinate = () => {
					this._shareService.copyToClipboard(transformedCoordinate.join(', ')).then(() => {}, () => {
						console.warn('Clipboard API not available');
					});
				};

				const stringifiedCoord = this._coordinateService.stringify(transformedCoordinate, code, { digits: definition.digits });
				return html`<span class='label'>${label}</span><span class='coordinate'>${stringifiedCoord}</span>
				<span class='icon'><ba-icon class='close' icon='${clipboardIcon}' title=${translate('map_contextMenuContent_copy_icon')} size=1.5} @click=${copyCoordinate}></ba-icon></span>`;
			});


			return html`
			<style>${css}</style>

			<div class="container">
  				<ul class="content">
				  	<li><span class='label'>${translate('map_contextMenuContent_community_label')}</span><span class='coordinate'>${this._community}</span></li>
					<li><span class='label'>${translate('map_contextMenuContent_district_label')}</span><span class='coordinate'>${this._district}</span></li>
					${stringifiedCoords.map((strCoord) => html`<li>${strCoord}</li>`)}
					<li><span class='label'>${translate('map_contextMenuContent_altitude_label')}</span><span class='coordinate'>${this._altitude}</span></li>
  				</ul>
			</div>
			`;

		}
		return nothing;
	}

	static get tag() {
		return 'ba-map-context-menu-content';
	}

}
