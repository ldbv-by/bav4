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
				let estimate = this._estimateTimeFor(vehicleType);
				if (estimate === 0) {
					estimate = stats.time;
				}

				// 1- Convert to seconds:
				let seconds = estimate / 1000;
				// 2- Extract hours:
				const hours = seconds / 3600; // 3,600 seconds in 1 hour
				seconds = seconds % 3600; // seconds remaining after extracting hours
				// 3- Extract minutes:
				const minutes = seconds / 60; // 60 seconds in 1 minute
				// 4- Keep only seconds not extracted to minutes:
				// seconds = seconds % 60;
				const size = 2;
				let hoursFormatted = hours + '';
				while (hoursFormatted.length < size) hoursFormatted = '0' + hoursFormatted;
				let minutesFormatted = minutes + '';
				while (minutesFormatted.length < size) minutesFormatted = '0' + minutesFormatted;
				return hoursFormatted + ':' + minutesFormatted;
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
								<div class="ga-truncate-text">${getDuration()}</div>
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
		if ('twoDiff' in stats === false) {
			return false;
		}

		if (stats.twoDiff.length !== 2) {
			return false;
		}
		if ('dist' in stats === false) {
			return false;
		}

		return true;
	}

	_estimateTimeFor(vehicleType, stats) {
		// walking duration estimate based on DAV-Normative:
		// - https://discuss.graphhopper.com/t/walking-duration-estimate-elevation-ignored/4621/4
		// - https://www.alpenverein.de/chameleon/public/908f5f80-1a20-3930-1692-41be014372d2/Formel-Gehzeitberechnung_19001.pdf
		if (this._hasValidStats(stats)) {
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
