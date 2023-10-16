/**
 * @module modules/routing/components/routingInfo/RoutingInfo
 */
import { html, nothing } from '../../../../../node_modules/lit-html/lit-html';
import { RoutingStatusCodes } from '../../../../domain/routing';
import { $injector } from '../../../../injection/index';
import { MvuElement } from '../../../MvuElement';
import css from './routingInfo.css';

const Update_Status = 'update_status';
const Update_Route = 'update_route';
const Update_Category = 'update_category';

const Category_Badge_Color_Default = 'cadetblue';
const Minute_In_Seconds = 60;

/**
 * Renders basic statistical information of route like
 * distance, ETA (Estimated Time Arrived),cumulated climbs and descents
 *
 * @author thiloSchlemmer
 */
export class RoutingInfo extends MvuElement {
	constructor() {
		super({ status: null, stats: null, categoryId: null });
		const { TranslationService, RoutingService } = $injector.inject('TranslationService', 'RoutingService');
		this._translationService = TranslationService;
		this._routingService = RoutingService;

		this.observe(
			(store) => store.routing.status,
			(status) => this.signal(Update_Status, status)
		);

		this.observe(
			(store) => store.routing.route,
			(route) => this.signal(Update_Route, route)
		);
		this.observe(
			(state) => state.routing.categoryId,
			(categoryId) => this.signal(Update_Category, categoryId)
		);
	}

	update(type, data, model) {
		const createStatistics = (route) => this._routingService.calculateRouteStats(route);
		switch (type) {
			case Update_Status:
				return { ...model, status: data };
			case Update_Route:
				return { ...model, stats: createStatistics(data) };
			case Update_Category:
				return { ...model, categoryId: data };
		}
	}

	createView(model) {
		const { status, stats, categoryId } = model;
		const translate = (key) => this._translationService.translate(key);
		const isVisible = status === RoutingStatusCodes.Ok;

		const getDuration = () => {
			const estimate = this._estimateTimeFor(categoryId, stats) ?? stats.time;
			const seconds = estimate / 1000;
			if (seconds < Minute_In_Seconds) {
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
			// todo: using UnitsService
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

	//  todo: obsolete, due to interface-specs
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
	 * // todo using UnitsService optionally
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

	_estimateTimeFor(categoryId, stats) {
		if (!this._hasValidStats(stats)) {
			return null;
		}
		const calculatorMissingAction = (categoryId) => {
			console.warn(`Unknown category, no estimate available for '${categoryId}'`);
			return null;
		};

		const calculator = this._routingService.getETACalculatorFor(categoryId); // refactor to categoryId (parent)
		return calculator ? calculator.getETAfor(stats.dist, stats.twoDiff[0], stats.twoDiff[1]) : calculatorMissingAction(categoryId);
	}

	static get tag() {
		return 'ba-routing-info';
	}
}
