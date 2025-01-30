/**
 * @module modules/featureInfo/components/geometryInfo/GeometryInfo
 */
import { html, nothing } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { $injector } from '../../../../injection';
import css from './geometryInfo.css';
import { MvuElement } from '../../../MvuElement';
import { GeometryType } from '../../../../domain/geometryTypes';

const Update_Statistic = 'update_statistic';

export const EMPTY_GEOMETRY_STATISTIC = { geometryType: null, coordinate: null, azimuth: null, length: null, area: null };
/**
 * Component to display geometry-informations
 * @class
 * @author thiloSchlemmer
 */
export class GeometryInfo extends MvuElement {
	constructor() {
		super({ statistic: EMPTY_GEOMETRY_STATISTIC });

		const { CoordinateService, UnitsService, TranslationService } = $injector.inject('CoordinateService', 'UnitsService', 'TranslationService');
		this._translationService = TranslationService;
		this._coordinateService = CoordinateService;
		this._unitsService = UnitsService;
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

	// eslint-disable-next-line no-unused-vars
	_getPointContent(pointStatistic) {
		// TODO: future implementations should render the coordinate in the current srid of the view, which is defined globally by the user
		// As long as there is no possibility to specify this in user-settings etc., the coordinate will not be displayed.
		const translate = (key) => this._translationService.translate(key);
		const title = translate('geometryInfo_title_coordinate');
		return html`<div class="stats-point stats-content" title=${title}></div>`;
	}

	_getLineContent(lineStatistic) {
		const translate = (key) => this._translationService.translate(key);

		if (lineStatistic.azimuth === null) {
			const title = translate('geometryInfo_title_line_length');
			return html`<div class="stats-line-length stats-content" title=${title}>
				<span>${title}:</span>${this._unitsService.formatDistance(lineStatistic.length, 2)}
			</div>`;
		}
		const titleAzimuth = translate('geometryInfo_title_azimuth');
		const titleLength = translate('geometryInfo_title_line_length');
		return html`<div class="stats-line-azimuth stats-content" title=${titleAzimuth}>
				<span>${titleAzimuth}:</span>${lineStatistic.azimuth.toFixed(2)}°
			</div>
			<div class="stats-line-length stats-content" title=${titleLength}>
				<span>${titleLength}:</span>${this._unitsService.formatDistance(lineStatistic.length, 2)}
			</div>`;
	}

	_getPolygonContent(polygonStatistic) {
		const translate = (key) => this._translationService.translate(key);
		const titleArea = translate('geometryInfo_title_polygon_area');
		const titleLength = translate('geometryInfo_title_line_length');
		return html`<div class="stats-polygon-length stats-content" title=${titleLength}>
				<span>${titleLength}:</span>${this._unitsService.formatDistance(polygonStatistic.length, 2)}
			</div>
			<div class="stats-polygon-area stats-content" title=${titleArea}>
				<span>${titleArea}:</span>${unsafeHTML(this._unitsService.formatArea(polygonStatistic.area, 2))}
			</div>`;
	}

	static get tag() {
		return 'ba-geometry-info';
	}

	set statistic(value) {
		this.signal(Update_Statistic, value);
	}
}
