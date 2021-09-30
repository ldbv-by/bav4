import { html, nothing } from 'lit-html';
import css from './mapContextMenuContent.css';
import { $injector } from '../../../../injection';
import clipboardIcon from './assets/clipboard.svg';
import checkedIcon from './assets/checked.svg';
import { MvuElement } from '../../../MvuElement';
import { emitNotification } from '../../../../store/notifications/notifications.action';
import { LevelTypes } from '../../../../store/notifications/notifications.reducer';
import { Icon } from '../../../commons/components/icon/Icon';

const Update_Coordinate = 'update_coordinate';
const Update_Altitude = 'update_altitude';
const Update_Administration = 'update_administration';



/**
 * @class
 * @author taulinger
 * @author thiloSchlemmer
 * @author alsturm
 * @author bakir_en
 */
export class MapContextMenuContent extends MvuElement {

	constructor() {
		super({
			coordinate: null,
			altitude: null,
			administration: {
				community: null,
				district: null
			}
		});

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
	}

	update(type, data, model) {
		switch (type) {
			case Update_Coordinate:
				return { ...model, coordinate: data };
			case Update_Altitude:
				return { ...model, altitude: data };
			case Update_Administration:
				return { ...model, administration: data };
		}
	}

	set coordinate(coordinateInMapSrid) {
		this.signal(Update_Coordinate, coordinateInMapSrid);
		this._getAltitude(coordinateInMapSrid);
		this._getAdministration(coordinateInMapSrid);
	}

	/**
	 * @private
	 */
	async _getAltitude(coordinate) {
		try {
			const altitude = await this._altitudeService.getAltitude(coordinate) + ' (m)';
			this.signal(Update_Altitude, altitude);
		}
		catch (e) {
			console.warn(e.message);
			this.signal(Update_Altitude, null);
		}
	}

	/**
	 * @private
	 */
	async _getAdministration(coordinate) {
		try {
			const administration = await this._administrationService.getAdministration(coordinate);
			this.signal(Update_Administration, administration);
		}
		catch (e) {
			console.warn(e.message);
			this.signal(Update_Administration, {
				community: null,
				district: null
			});
		}
	}

	_copyCoordinateToClipboard(transformedCoordinate, iconId) {
		const baIcon = this.getRenderTarget().querySelector(`#${iconId}`);
		const color = baIcon.color;
		const color_hover = baIcon.color_hover;
		const onClickCallback = baIcon.onClick;
		const successColor = 'var(--sucess-color)';

		this._shareService.copyToClipboard(transformedCoordinate.join(', ')).then(() => {
			//change the icon
			baIcon.color = successColor;
			baIcon.color_hover = null;
			baIcon.icon = checkedIcon;
			baIcon.onClick = () => { };

			setTimeout(() => {
				//reset the icon
				baIcon.icon = clipboardIcon;
				baIcon.color = color;
				baIcon.color_hover = color_hover;
				baIcon.onClick = onClickCallback;
			}, 1000);
		}, () => {
			const message = this._translationService.translate('map_contextMenuContent_clipboard_error');
			emitNotification(message, LevelTypes.WARN);
			console.warn('Clipboard API not available');

			//disable all buttons
			this.getRenderTarget().querySelectorAll(Icon.tag).forEach(baIcon => {
				baIcon.icon = clipboardIcon;
				baIcon.color = color;
				baIcon.color_hover = color_hover;
				baIcon.disabled = true;
				baIcon.title = message;
			});
		});
	}

	createView(model) {

		const { coordinate, altitude, administration: { community, district } } = model;
		const translate = (key) => this._translationService.translate(key);

		if (coordinate) {
			const sridDefinitions = this._mapService.getSridDefinitionsForView(coordinate);
			const stringifiedCoords = sridDefinitions.map(definition => {
				const { label, code } = definition;
				const iconId = `icon${code}`;
				const transformedCoordinate = this._coordinateService.transform(coordinate, this._mapService.getSrid(), code);
				const onClick = () => {
					this._copyCoordinateToClipboard(transformedCoordinate, iconId);
				};
				const stringifiedCoord = this._coordinateService.stringify(transformedCoordinate, code, { digits: definition.digits });
				return html`
				<span class='label'>${label}</span><span class='coordinate'>${stringifiedCoord}</span>
				<span class='icon'>
					<ba-icon id=${iconId} class='close' .icon='${clipboardIcon}' .title=${translate('map_contextMenuContent_copy_icon')} .size=${1.5} @click=${onClick}></ba-icon>
				</span>
				`;
			});

			return html`
			<style>${css}</style>

			<div class="container">
  				<ul class="content">
				  	<li><span class='label'>${translate('map_contextMenuContent_community_label')}</span><span class='coordinate'>${community || '-'}</span></li>
					<li><span class='label'>${translate('map_contextMenuContent_district_label')}</span><span class='coordinate'>${district || '-'}</span></li>
					${stringifiedCoords.map((strCoord) => html`<li>${strCoord}</li>`)}
					<li><span class='label'>${translate('map_contextMenuContent_altitude_label')}</span><span class='coordinate'>${altitude || '-'}</span></li>
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
