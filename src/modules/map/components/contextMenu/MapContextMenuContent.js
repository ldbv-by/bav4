/**
 * @module modules/map/components/contextMenu/MapContextMenuContent
 */
import { html, nothing } from 'lit-html';
import css from './mapContextMenuContent.css';
import { $injector } from '../../../../injection';
import clipboardIcon from './assets/clipboard.svg';
import { MvuElement } from '../../../MvuElement';
import { emitNotification, LevelTypes } from '../../../../store/notifications/notifications.action';

const Update_Coordinate = 'update_coordinate';
const Update_Elevation = 'update_elevation';
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
			elevation: null,
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
			ElevationService: elevationService,
			AdministrationService: administrationService
		} = $injector.inject('MapService', 'CoordinateService', 'TranslationService', 'ShareService', 'ElevationService', 'AdministrationService');

		this._mapService = mapService;
		this._coordinateService = coordinateService;
		this._translationService = translationService;
		this._shareService = shareService;
		this._elevationService = elevationService;
		this._administrationService = administrationService;
	}

	update(type, data, model) {
		switch (type) {
			case Update_Coordinate:
				return { ...model, coordinate: data };
			case Update_Elevation:
				return { ...model, elevation: data };
			case Update_Administration:
				return { ...model, administration: data };
		}
	}

	set coordinate(coordinateInMapSrid) {
		this.signal(Update_Coordinate, coordinateInMapSrid);
		this._getElevation(coordinateInMapSrid);
		this._getAdministration(coordinateInMapSrid);
	}

	/**
	 * @private
	 */
	async _getElevation(coordinate) {
		try {
			const elevation = (await this._elevationService.getElevation(coordinate)) + ' (m)';
			this.signal(Update_Elevation, elevation);
		} catch (e) {
			console.error(e);
			this.signal(Update_Elevation, null);
		}
	}

	/**
	 * @private
	 */
	async _getAdministration(coordinate) {
		try {
			const administration = await this._administrationService.getAdministration(coordinate);
			this.signal(Update_Administration, administration);
		} catch (e) {
			console.error(e);
			this.signal(Update_Administration, {
				community: null,
				district: null
			});
		}
	}

	async _copyCoordinateToClipboard(stringifiedCoord) {
		try {
			await this._shareService.copyToClipboard(stringifiedCoord);
			emitNotification(`"${stringifiedCoord}" ${this._translationService.translate('map_contextMenuContent_clipboard_success')}`, LevelTypes.INFO);
		} catch {
			const message = this._translationService.translate('map_contextMenuContent_clipboard_error');
			emitNotification(message, LevelTypes.WARN);
			console.warn('Clipboard API not available');
		}
	}

	createView(model) {
		const {
			coordinate,
			elevation,
			administration: { community, district }
		} = model;
		const translate = (key) => this._translationService.translate(key);

		if (coordinate) {
			const coordinateRepresentations = this._mapService.getCoordinateRepresentations(coordinate);
			const stringifiedCoords = coordinateRepresentations.map((cr) => {
				const { label } = cr;
				const stringifiedCoord = this._coordinateService.stringify(coordinate, cr);
				const onClick = () => {
					this._copyCoordinateToClipboard(stringifiedCoord);
				};
				return html`
					<span class="label">${label}</span><span class="coordinate">${stringifiedCoord}</span>
					<span class="icon">
						<ba-icon
							class="close"
							.icon="${clipboardIcon}"
							.title=${translate('map_contextMenuContent_copy_icon')}
							.size=${1.5}
							@click=${onClick}
						></ba-icon>
					</span>
				`;
			});

			return html`
				<style>
					${css}
				</style>

				<div class="container">
					<ul class="content">
						<li>
							<span class="label">${translate('map_contextMenuContent_community_label')}</span><span class="coordinate">${community || '-'}</span>
						</li>
						<li>
							<span class="label">${translate('map_contextMenuContent_district_label')}</span><span class="coordinate">${district || '-'}</span>
						</li>
						${stringifiedCoords.map((strCoord) => html`<li>${strCoord}</li>`)}
						<li>
							<span class="label">${translate('map_contextMenuContent_elevation_label')}</span><span class="coordinate">${elevation || '-'}</span>
						</li>
					</ul>
					<div class="chips">
						<ba-share-position-chip .center=${coordinate}></ba-share-position-chip>
						<ba-map-feedback-chip .center=${coordinate}></ba-map-feedback-chip>
					</div>
				</div>
			`;
		}
		return nothing;
	}

	static get tag() {
		return 'ba-map-context-menu-content';
	}
}
