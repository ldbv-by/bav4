import { html, nothing } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { $injector } from '../../../injection';
import css from './geometryInfo.css';
import { MvuElement } from '../../MvuElement';

const Update_Statistics = 'update_statistics';

export const EMPTY_GEOMETRY_STATISTICS = { coordinate: null, azimuth: null, length: null, area: null } ;

export class GeometryInfo extends MvuElement {
	constructor() {
		super({ statistics: EMPTY_GEOMETRY_STATISTICS });

		const { CoordinateService, UnitsService } = $injector.inject('CoordinateService', 'UnitsService');

		this._coordinateService = CoordinateService;
		this._unitsService = UnitsService;
	}

	/**
	 * @override
	 */
	update(type, data, model) {
		const sanitizeStatistic = candidate => {
			return {
				coordinate: candidate.coordinate ? candidate.coordinate : null,
				azimuth: candidate.azimuth ? candidate.azimuth : null,
				length: candidate.length ? candidate.length : null,
				area: candidate.area ? candidate.area : null
			};
		};
		switch (type) {
			case Update_Statistics:
				return { ...model, statistics: sanitizeStatistic(data) };
		}
	}


	createView(model) {
		const getContent = statistics => {
			if (statistics.coordinate) {
				const formattedCoordinate = this._coordinateService.stringify(
					this._coordinateService.toLonLat(statistics.coordinate), 4326, { digits: 5 });
				return html`<div class='stats-point stats-content'>${formattedCoordinate}</div>`;
			}
			if (statistics.length && statistics.azimuth) {
				return html`<div class='stats-line-azimuth stats-content'>${statistics.azimuth.toFixed(2)}°</div>
					<div class='stats-line-length stats-content'>${this._unitsService.formatDistance(statistics.length, 2)}</div>`;
			}

			if (statistics.length && statistics.area) {
				return html`<div class='stats-polygon-length stats-content'>${this._unitsService.formatDistance(statistics.length, 2)}</div>
					<div class='stats-polygon-area stats-content'>${unsafeHTML(this._unitsService.formatArea(statistics.area, 2))}</div>`;
			}
			if (statistics.length) {
				return html`<div class='stats-line-length stats-content'>${this._unitsService.formatDistance(statistics.length, 2)}</div>`;
			}
			return null;
		};

		const content = getContent(model.statistics);

		return content ? html`
        <style>${css}</style>
		<div>
			<div class="stats-container">
			${content}
			<div>
		</div>` : nothing;
	}

	static get tag() {
		return 'ba-geometry-info';
	}

	set statistics(value) {
		this.signal(Update_Statistics, value);
	}
}
