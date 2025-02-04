/**
 * @module modules/info/components/coordinateInfo/CoordinateInfo
 */
import { html, nothing } from 'lit-html';
import css from './coordinateinfo.css';
import { $injector } from '../../../../injection/index';
import { emitNotification, LevelTypes } from '../../../../store/notifications/notifications.action';
import { MvuElement } from '../../../MvuElement';
import clipboardIcon from './assets/clipboard.svg';

const Update_Coordinate = 'update_coordinate';
const Update_Elevation = 'update_elevation';

/**
 * Element to display representations of a coordinate and the related elevation.
 * @class
 * @property {module:domain/coordinateTypeDef~Coordinate} coordinate - the coordinate to display
 * @author taulinger
 * @author thiloSchlemmer
 * @author alsturm
 */
export class CoordinateInfo extends MvuElement {
	#mapService;
	#coordinateService;
	#translationService;
	#elevationService;
	#shareService;

	constructor() {
		super({
			coordinate: null,
			elevation: null
		});

		const {
			MapService: mapService,
			CoordinateService: coordinateService,
			TranslationService: translationService,
			ElevationService: elevationService,
			ShareService: shareService
		} = $injector.inject('MapService', 'CoordinateService', 'TranslationService', 'ElevationService', 'ShareService');

		this.#mapService = mapService;
		this.#coordinateService = coordinateService;
		this.#translationService = translationService;
		this.#elevationService = elevationService;
		this.#shareService = shareService;
	}

	update(type, data, model) {
		switch (type) {
			case Update_Coordinate:
				return { ...model, coordinate: data };
			case Update_Elevation:
				return { ...model, elevation: data };
		}
	}

	/**
	 * @override
	 * @protected
	 */
	createView(model) {
		const translate = (key) => this.#translationService.translate(key);
		const translateSilently = (key) => this.#translationService.translate(key, [], true);
		const { coordinate, elevation } = model;

		const onCopyElevation = () => {
			this._copyValueToClipboard(elevation);
		};

		if (coordinate) {
			const coordinateRepresentations = this.#mapService.getCoordinateRepresentations(coordinate);
			const stringifiedCoords = coordinateRepresentations.map((cr) => {
				const { label } = cr;
				const stringifiedCoord = this.#coordinateService.stringify(coordinate, cr);
				const onCopyCoordinate = () => {
					this._copyValueToClipboard(stringifiedCoord);
				};
				return html`
					<span class="label">${translateSilently(label)}</span><span class="coordinate">${stringifiedCoord}</span>
					<span class="icon">
						<ba-icon
							class="close"
							.icon="${clipboardIcon}"
							.title=${translate('info_coordinateInfo_copy_icon')}
							.size=${1.5}
							@click=${onCopyCoordinate}
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
						${stringifiedCoords.map((strCoord) => html`<li class="r_coordinate">${strCoord}</li>`)}
						${elevation
							? html`<li class="r_elevation">
									<span class="label">${translate('info_coordinateInfo_elevation_label')}</span><span class="coordinate">${elevation}</span>
									<span class="icon">
						<ba-icon
							class="close"
							.icon="${clipboardIcon}"
							.title=${translate('info_coordinateInfo_copy_icon')}
							.size=${1.5}
							@click=${onCopyElevation}
						></ba-icon>
								</li>`
							: nothing}
					</ul>
				</div>
			`;
		}
		return nothing;
	}

	async _copyValueToClipboard(stringifiedCoord) {
		try {
			await this.#shareService.copyToClipboard(stringifiedCoord);
			emitNotification(`"${stringifiedCoord}" ${this.#translationService.translate('info_coordinateInfo_clipboard_success')}`, LevelTypes.INFO);
		} catch {
			const message = this.#translationService.translate('info_coordinateInfo_clipboard_error');
			emitNotification(message, LevelTypes.WARN);
			console.warn('Clipboard API not available');
		}
	}

	async _getElevation(coordinate) {
		try {
			const elevation = await this.#elevationService.getElevation(coordinate);
			this.signal(Update_Elevation, elevation);
		} catch (e) {
			this.signal(Update_Elevation, null);
			throw e;
		}
	}

	static get tag() {
		return 'ba-coordinate-info';
	}

	set coordinate(coordinateInMapSrid) {
		this.signal(Update_Coordinate, coordinateInMapSrid);
		this._getElevation(coordinateInMapSrid);
	}

	get coordinate() {
		return this.getModel().coordinate;
	}
}
