import { html, nothing } from '../../../../../node_modules/lit-html/lit-html';
import { RoutingStatusCodes } from '../../../../domain/routing';
import { $injector } from '../../../../injection/index';
import { MvuElement } from '../../../MvuElement';
import css from './routingInfo.css';

const Update_Status = 'update_status';
const Update_Stats = 'update_stats';
const Update_Category = 'update_category';

export class RoutingInfo extends MvuElement {
	constructor() {
		super({ status: null, stats: null, categoryId: null });
		const { TranslationService, ETACalculatorService } = $injector.inject('TranslationService', 'ETACalculatorService');
		this._translationService = TranslationService;
		this._etaCalculatorService = ETACalculatorService;

		this.observe(
			(store) => store.routing.status,
			(status) => this.signal(Update_Status, status)
		);

		this.observe(
			(store) => store.routing.stats,
			(stats) => this.signal(Update_Stats, stats)
		);
		this.observe(
			(state) => state.routing.categoryId,
			(categoryId) => this.signal(Update_Category, categoryId)
		);
	}

	update(type, data, model) {
		switch (type) {
			case Update_Status:
				return { ...model, status: data };
			case Update_Stats:
				return { ...model, stats: data };
			case Update_Category:
				return { ...model, categoryId: data };
		}
	}

	createView(model) {
		const { status, stats, categoryId } = model;

		const translate = (key) => this._translationService.translate(key);
		const isVisible = status === RoutingStatusCodes.Ok;

		const getDuration = () => {
			if (stats) {
				const vehicleType = this._getVehicleType(categoryId);
				let estimate = this._estimateTimeFor(vehicleType, stats);
				if (estimate === 0) {
					estimate = stats.time;
				}
				const seconds = estimate / 1000;

				if (seconds < 60) {
					return '< 1 min.';
				}

				return this._formatDuration(seconds);
			}
			return '-:-';
		};

		const getDistance = () => {
			const formattedInKilometer = (distanceInMeter) => {
				const km = distanceInMeter / 1000;
				return km.toFixed(2);
			};
			return stats?.dist ? formattedInKilometer(stats.dist) : '0';
		};

		const getUphill = () => {
			return stats?.twoDiff && stats.twoDiff.length === 2 ? stats.twoDiff[0].toFixed(0) : '0';
		};

		const getDownhill = () => {
			return stats?.twoDiff && stats.twoDiff.length === 2 ? stats.twoDiff[1].toFixed(0) : '0';
		};

		return isVisible
			? html`<style>
						${css}
					</style>
					<div class="container">
						<hr />
						<div class="row">
							<div class="routing-info duration col" title=${translate('routing_info_duration')}>
								<span>${getDuration()}</span>
							</div>
							<div class="routing-info distance col" title=${translate('routing_info_distance')}>
								<span>
									${getDistance()}
									<b>km</b>
								</span>
							</div>
							<div class="routing-info uphill col" title=${translate('routing_info_uphill')}>
								<span>
									${getUphill()}
									<b>m</b>
								</span>
							</div>
							<div class="routing-info downhill col" title=${translate('routing_info_downhill')}>
								<span>
									${getDownhill()}
									<b>m</b>
								</span>
							</div>
						</div>
					</div>`
			: nothing;
	}

	_hasValidStats(stats) {
		if (!Object.hasOwn(stats, 'twoDiff')) {
			return false;
		}

		if (stats.twoDiff.length !== 2) {
			return false;
		}
		if (!Object.hasOwn(stats, 'dist')) {
			return false;
		}

		return true;
	}

	/**
	 *
	 * @param {number} duration the duration in seconds
	 * @returns {string} the formatted duration in the style of HH:mm
	 */
	_formatDuration(duration) {
		const hours = Math.floor(duration / 3600);
		const minutes = Math.floor((duration % 3600) / 60);

		const toTwoDigits = (timePart) => {
			return timePart < 10 ? '0' + timePart : timePart + '';
		};

		return `${toTwoDigits(hours)}:${toTwoDigits(minutes)}`;
	}

	_estimateTimeFor(vehicleType, stats) {
		// walking duration estimate based on DAV-Normative:
		// - https://discuss.graphhopper.com/t/walking-duration-estimate-elevation-ignored/4621/4
		// - https://www.alpenverein.de/chameleon/public/908f5f80-1a20-3930-1692-41be014372d2/Formel-Gehzeitberechnung_19001.pdf
		if (!this._hasValidStats(stats)) {
			return 0;
		}
		const calculator = this._etaCalculatorService.getETACalculatorFor(vehicleType);
		if (calculator) {
			return calculator.getETAfor(stats.dist, stats.twoDiff[0], stats.twoDiff[1]);
		} else {
			console.warn('Unknown vehicle, no estimate available for ' + vehicleType);
			return 0;
		}
	}

	/**
	 * todo: move to routingService
	 * @param {string} categoryId
	 */
	_getVehicleType(categoryId) {
		switch (categoryId) {
			case 'racingbike':
				return 'racingbike';
			case 'bvv-mtb':
			case 'mtb':
				return 'mtb';
			case 'bayernnetz-bike':
			case 'bvv-bike':
			case 'bike':
				return 'bike';
			case 'bvv-hike':
			case 'hike':
				return 'hike';
			default:
				return 'unknown (' + categoryId + ')';
		}
	}

	static get tag() {
		return 'ba-routing-info';
	}
}
