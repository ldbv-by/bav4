/**
 * @module modules/info/components/geometryInfo/GeometryInfo
 */
import { html, nothing } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { $injector } from '../../../../injection';
import css from './geometryInfo.css';
import { MvuElement } from '../../../MvuElement';
import { GeometryType } from '../../../../domain/geometryTypes';
import clipboardIcon from '../../../../assets/icons/clipboard.svg';
import { emitNotification, LevelTypes } from '../../../../store/notifications/notifications.action';

const Update_Statistic = 'update_statistic';

export const EMPTY_GEOMETRY_STATISTIC = { geometryType: null, coordinate: null, azimuth: null, length: null, area: null };
/**
 * Component to display geometry-informations
 * @class
 * @author thiloSchlemmer
 */
export class GeometryInfo extends MvuElement {
	#shareService;
	constructor() {
		super({ statistic: EMPTY_GEOMETRY_STATISTIC });

		const {
			CoordinateService,
			UnitsService,
			TranslationService,
			ShareService: shareService
		} = $injector.inject('CoordinateService', 'UnitsService', 'TranslationService', 'ShareService');
		this._translationService = TranslationService;
		this._coordinateService = CoordinateService;
		this._unitsService = UnitsService;
		this.#shareService = shareService;
	}

	/**
	 * @override
	 */
	update(type, data, model) {
		switch (type) {
			case Update_Statistic:
				return { ...model, statistic: data };
		}
	}

	createView(model) {
		const getContent = (geometryStatistic) => {
			switch (geometryStatistic.geometryType) {
				case GeometryType.POINT:
					return this._getPointContent(geometryStatistic);
				case GeometryType.LINE:
					return this._getLineContent(geometryStatistic);
				case GeometryType.POLYGON:
					return this._getPolygonContent(geometryStatistic);
				default:
					return null;
			}
		};

		const content = getContent(model.statistic);

		return content
			? html` <style>
						${css}
					</style>
					<div>
						<div class="stats-container">
							${content}
							<div></div>
						</div>
					</div>`
			: nothing;
	}

	async _copyValueToClipboard(stringifiedCoord) {
		try {
			await this.#shareService.copyToClipboard(stringifiedCoord);
			emitNotification(`"${stringifiedCoord}" ${this._translationService.translate('info_coordinateInfo_clipboard_success')}`, LevelTypes.INFO);
		} catch {
			const message = this._translationService.translate('info_coordinateInfo_clipboard_error');
			emitNotification(message, LevelTypes.WARN);
			console.warn('Clipboard API not available');
		}
	}

	_getPointContent(pointStatistic) {
		// TODO: future implementations should render the coordinate in the current srid of the view, which is defined globally by the user
		// As long as there is no possibility to specify this in user-settings etc., the coordinate will not be displayed.
		const { coordinate } = pointStatistic;
		const translate = (key) => this._translationService.translate(key);
		const title = translate('info_geometryInfo_title_coordinate');
		return html`<div class="stats-point stats-content" title=${title}>
			<ba-coordinate-info .coordinate=${coordinate} .displaySingleRow=${true}></ba-coordinate-info>
		</div>`;
	}

	_getLineContent(lineStatistic) {
		const translate = (key) => this._translationService.translate(key);

		const formattedDistance = this._unitsService.formatDistance(lineStatistic.length, 2);
		const formattedAzimuth = this._unitsService.formatAngle(lineStatistic.azimuth, 2);
		const onCopyAzimuth = () => {
			this._copyValueToClipboard(formattedAzimuth.localizedValue);
		};

		const onCopyLength = () => {
			this._copyValueToClipboard(formattedDistance.localizedValue);
		};

		if (lineStatistic.azimuth === null) {
			const title = translate('info_geometryInfo_title_line_length');
			return html`<div class="stats-line-length stats-content" title=${title}>
				<span class="label">${title} (${formattedDistance.unit}):</span><span class="value">${formattedDistance.localizedValue}</span>
				<span class="icon">
					<ba-icon
						class="close"
						.icon=${clipboardIcon}
						.title=${translate('info_geometryInfo_copy_icon')}
						.size=${1.5}
						@click=${onCopyLength}
					></ba-icon>
				</span>
			</div>`;
		}
		const titleAzimuth = translate('info_geometryInfo_title_azimuth');
		const titleLength = translate('info_geometryInfo_title_line_length');
		return html`<div class="stats-line-azimuth stats-content" title=${titleAzimuth}>
				<span class="label">${titleAzimuth} (${formattedAzimuth.unit}):</span><span class="value">${formattedAzimuth.localizedValue}</span>
				<span class="icon">
					<ba-icon
						class="close"
						.icon=${clipboardIcon}
						.title=${translate('info_geometryInfo_copy_icon')}
						.size=${1.5}
						@click=${onCopyAzimuth}
					></ba-icon>
				</span>
			</div>
			<div class="stats-line-length stats-content" title=${titleLength}>
				<span class="label">${titleLength} (${formattedDistance.unit}):</span><span class="value">${formattedDistance.localizedValue}</span>
				<span class="icon">
					<ba-icon
						class="close"
						.icon=${clipboardIcon}
						.title=${translate('info_geometryInfo_copy_icon')}
						.size=${1.5}
						@click=${onCopyLength}
					></ba-icon>
				</span>
			</div>`;
	}

	_getPolygonContent(polygonStatistic) {
		const translate = (key) => this._translationService.translate(key);
		const titleArea = translate('info_geometryInfo_title_polygon_area');
		const titleLength = translate('info_geometryInfo_title_line_length');

		const formattedDistance = this._unitsService.formatDistance(polygonStatistic.length, 2);
		const formattedArea = this._unitsService.formatArea(polygonStatistic.area, 2);

		const onCopyLength = () => {
			this._copyValueToClipboard(formattedDistance.localizedValue);
		};

		const onCopyArea = () => {
			this._copyValueToClipboard(formattedArea.localizedValue);
		};

		return html`<div class="stats-polygon-length stats-content" title=${titleLength}>
				<span class="label">${titleLength} (${formattedDistance.unit}):</span><span class="value">${formattedDistance.localizedValue}</span>
				<span class="icon">
					<ba-icon
						class="close"
						.icon=${clipboardIcon}
						.title=${translate('info_geometryInfo_copy_icon')}
						.size=${1.3}
						@click=${onCopyLength}
					></ba-icon>
				</span>
			</div>
			<div class="stats-polygon-area stats-content" title=${titleArea}>
				<span class="label">${titleArea} (${unsafeHTML(formattedArea.unit)}):</span><span class="value">${formattedArea.localizedValue}</span>
				<span class="icon">
					<ba-icon
						class="close"
						.icon=${clipboardIcon}
						.title=${translate('info_geometryInfo_copy_icon')}
						.size=${1.3}
						@click=${onCopyArea}
					></ba-icon>
				</span>
			</div>`;
	}

	static get tag() {
		return 'ba-geometry-info';
	}

	set statistic(value) {
		this.signal(Update_Statistic, value);
	}
}
