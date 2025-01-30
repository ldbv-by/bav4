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

const emptyAdministration = {
	community: null,
	district: null,
	parcel: null
};

/**
 * @class
 * @author taulinger
 * @author thiloSchlemmer
 * @author alsturm
 * @author bakir_en
 */
export class MapContextMenuContent extends MvuElement {
	constructor(model) {
		super(
			model ?? {
				coordinate: null,
				elevation: null,
				administration: { ...emptyAdministration }
			}
		);

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
				return { ...model, coordinate: data, administration: { ...emptyAdministration }, elevation: null };
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

	async _getElevation(coordinate) {
		try {
			const elevation = await this._elevationService.getElevation(coordinate);
			this.signal(Update_Elevation, elevation);
		} catch (e) {
			this.signal(Update_Elevation, null);
			throw e;
		}
	}

	async _getAdministration(coordinate) {
		try {
			const administration = await this._administrationService.getAdministration(coordinate);
			this.signal(Update_Administration, administration ?? emitNotification);
		} catch (e) {
			this.signal(Update_Administration, { ...emptyAdministration });
			throw e;
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
			administration: { community, district, parcel }
		} = model;
		const translate = (key) => this._translationService.translate(key);
		const translateSilently = (key) => this._translationService.translate(key, [], true);

		if (coordinate) {
			const coordinateRepresentations = this._mapService.getCoordinateRepresentations(coordinate);
			const stringifiedCoords = coordinateRepresentations.map((cr) => {
				const { label } = cr;
				const stringifiedCoord = this._coordinateService.stringify(coordinate, cr);
				const onClick = () => {
					this._copyCoordinateToClipboard(stringifiedCoord);
				};
				return html`
					<span class="label">${translateSilently(label)}</span><span class="coordinate">${stringifiedCoord}</span>
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
					<ul class="content selectable">
						${community && district
							? html`<li class="r_community">
										<span class="label">${translate('map_contextMenuContent_community_label')}</span><span class="coordinate">${community}</span>
									</li>
									<li class="r_district">
										<span class="label">${translate('map_contextMenuContent_district_label')}</span><span class="coordinate">${district}</span>
									</li>
									${parcel
										? html`<li class="r_parcel">
												<span class="label"
													>${translate('map_contextMenuContent_parcel_label')}
													<ba-badge
														.color=${'var(--text3)'}
														.background=${'var(--roles-color)'}
														.label=${translate('map_contextMenuContent_parcel_badge')}
														.size=${'0.6'}
													></ba-badge> </span
												><span class="coordinate">${parcel}</span>
											</li>`
										: nothing}`
							: nothing}
						${stringifiedCoords.map((strCoord) => html`<li class="r_coordinate">${strCoord}</li>`)}
						<li><ba-coordinate-info .coordinate=${coordinate}></ba-coordinate-info></li>
						${elevation
							? html`<li class="r_elevation">
									<span class="label">${translate('map_contextMenuContent_elevation_label')}</span><span class="coordinate">${elevation}</span>
								</li>`
							: nothing}
					</ul>
					<div class="chips">
						<ba-share-chip .center=${coordinate}></ba-share-chip>
						<ba-map-feedback-chip .center=${coordinate}></ba-map-feedback-chip>
						<ba-routing-chip .coordinate=${coordinate}></ba-routing-chip>
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
