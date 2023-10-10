/**
 * @module modules/routing/components/routingInfo/RoutingInfo
 */
import { html, nothing } from '../../../../../node_modules/lit-html/lit-html';
import { RoutingStatusCodes } from '../../../../domain/routing';
import { $injector } from '../../../../injection/index';
import { MvuElement } from '../../../MvuElement';
import css from './routingInfo.css';

const Update_Status = 'update_status';
const Update_Stats = 'update_stats';
const Update_Category = 'update_category';

const Category_Badge_Color_Default = 'cadetblue';

export class RoutingInfo extends MvuElement {
	constructor() {
		super({ status: null, stats: null, categoryId: null });
		const { TranslationService, ETACalculatorService, RoutingService } = $injector.inject(
			'TranslationService',
			'ETACalculatorService',
			'RoutingService'
		);
		this._translationService = TranslationService;
		this._etaCalculatorService = ETACalculatorService;
		this._routingService = RoutingService;

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
			const vehicleType = this._getVehicleType(categoryId);
			const estimate = this._estimateTimeFor(vehicleType, stats) ?? stats.time;
			const seconds = estimate / 1000;
			if (seconds < 60) {
				return '< 1 min.';
			}

			return this._formatDuration(seconds);
		};
		const getCategoryColor = (categoryId) => {
			const parentId = this._routingService.getParent(categoryId);
			const category = this._routingService.getCategoryById(parentId);

			return category?.color ?? Category_Badge_Color_Default;
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
					<div class="header">
						<span class="routing-info-duration" title=${translate('routing_info_duration')}>${stats ? getDuration() : '-:-'}</span>
						<div class="badge routing-info-type" style=${`background:${getCategoryColor(categoryId)};`}>
							<span class=${`icon icon-${categoryId}`} ></span>
							<span class="text">
								${translate(`routing_category_label_${categoryId.replace('-', '_')}`)}
							<span>
						</div>
					</div>
					<div class="container">
						<div class="row">
							<div class="col" title=${translate('routing_info_distance')}>
								<div class="routing-info-icon distance"></div>
							</div>
							<div class="routing-info-text">
								<span>${getDistance()} <b>km</b></span>
							</div>
							<div class="col" title=${translate('routing_info_uphill')}>
								<div class="routing-info-icon uphill"></div>
							</div>
							<div class="routing-info-text">
								<span>${getUphill()} <b>m</b></span>
							</div>
							<div class="col" title=${translate('routing_info_downhill')}>
								<div class="routing-info-icon downhill"></div>
							</div>
							<div class="routing-info-text">
								<span>${getDownhill()} <b>m</b></span>
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
			return timePart < 10 ? `0${timePart}` : timePart;
		};

		return `${toTwoDigits(hours)}:${toTwoDigits(minutes)}`;
	}

	_estimateTimeFor(vehicleType, stats) {
		// walking duration estimate based on DAV-Normative:
		// - https://discuss.graphhopper.com/t/walking-duration-estimate-elevation-ignored/4621/4
		// - https://www.alpenverein.de/chameleon/public/908f5f80-1a20-3930-1692-41be014372d2/Formel-Gehzeitberechnung_19001.pdf
		if (!this._hasValidStats(stats)) {
			return null;
		}
		const calculatorMissingAction = (vehicleType) => {
			console.warn('Unknown vehicle, no estimate available for ' + vehicleType);
			return null;
		};

		const calculator = this._etaCalculatorService.getETACalculatorFor(vehicleType);
		return calculator ? calculator.getETAfor(stats.dist, stats.twoDiff[0], stats.twoDiff[1]) : calculatorMissingAction(vehicleType);
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
