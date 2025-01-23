/**
 * @module modules/commons/components/coordinateInfo/CoordinateInfo
 */
import { html, nothing } from 'lit-html';
import css from './coordinateinfo.css';
import { $injector } from '../../../../injection/index';
import { emitNotification, LevelTypes } from '../../../../store/notifications/notifications.action';
import { MvuElement } from '../../../MvuElement';
import clipboardIcon from './assets/clipboard.svg';

const Update_Coordinate = 'update_coordinate';

export class CoordinateInfo extends MvuElement {
	constructor() {
		super({
			coordinate: null
		});

		const {
			MapService: mapService,
			CoordinateService: coordinateService,
			TranslationService: translationService,
			ShareService: shareService
		} = $injector.inject('MapService', 'CoordinateService', 'TranslationService', 'ShareService');

		this._mapService = mapService;
		this._coordinateService = coordinateService;
		this._translationService = translationService;
		this._shareService = shareService;
	}

	update(type, data, model) {
		switch (type) {
			case Update_Coordinate:
				return { ...model, coordinate: data };
		}
	}

	/**
	 * @override
	 * @protected
	 */
	createView(model) {
		const translate = (key) => this._translationService.translate(key);
		const translateSilently = (key) => this._translationService.translate(key, [], true);
		const { coordinate } = model;

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
							.title=${translate('commons_coordinateInfo_copy_icon')}
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
						${stringifiedCoords.map((strCoord) => html`<li class="r_coordinate">${strCoord}</li>`)}
					</ul>
				</div>
			`;
		}
		return nothing;
	}

	async _copyCoordinateToClipboard(stringifiedCoord) {
		try {
			await this._shareService.copyToClipboard(stringifiedCoord);
			emitNotification(`"${stringifiedCoord}" ${this._translationService.translate('commons_coordinateInfo_clipboard_success')}`, LevelTypes.INFO);
		} catch {
			const message = this._translationService.translate('commons_coordinateInfo_clipboard_error');
			emitNotification(message, LevelTypes.WARN);
			console.warn('Clipboard API not available');
		}
	}

	static get tag() {
		return 'ba-coordinate-info';
	}

	/**
	 * @property {module:domain/coordinateTypeDef~Coordinate} coordinate - the coordinate to display
	 */
	set coordinate(value) {
		this.signal(Update_Coordinate, value);
	}

	get coordinate() {
		return this.getModel().coordinate;
	}
}
