/**
 * @module modules/routing/components/routeInfo/RouteInfo
 */
import { html, nothing } from 'lit-html';
import { RoutingStatusCodes } from '../../../../domain/routing';
import { $injector } from '../../../../injection/index';
import { MvuElement } from '../../../MvuElement';
import css from './routeInfo.css';

const Update_Status = 'update_status';
const Update_Route = 'update_route';
const Update_Category = 'update_category';

const Minute_In_Seconds = 60;

/**
 * Renders basic statistical information about a route like
 * distance, ETA (Estimated Time Arrived),cumulated climbs and descents
 *
 * @author thiloSchlemmer
 */
export class RouteInfo extends MvuElement {
	constructor() {
		super({ status: null, stats: null, categoryId: null });
		const { TranslationService, RoutingService, UnitsService } = $injector.inject('TranslationService', 'RoutingService', 'UnitsService');
		this._translationService = TranslationService;
		this._routingService = RoutingService;
		this._unitsService = UnitsService;

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
		const getCategory = (categoryId) => {
			const parentId = this._routingService.getParent(categoryId);
			return this._routingService.getCategoryById(parentId);
		};

		const getDuration = () => {
			const estimate = this._estimateTimeFor(categoryId, stats) ?? stats.time;
			const seconds = estimate / 1000;
			if (seconds < Minute_In_Seconds) {
				return '< 1 min.';
			}

			return this._formatDuration(seconds);
		};

		const getDistance = () => {
			return stats?.dist ? this._unitsService.formatDistance(stats.dist) : '0';
		};

		const getUphill = () => {
			return stats ? this._unitsService.formatDistance(stats.twoDiff[0]) : '0';
		};

		const getDownhill = () => {
			return stats ? this._unitsService.formatDistance(stats.twoDiff[1]) : '0';
		};

		return isVisible
			? html`<style>
						${css}
					</style>
					<div class="header">
						<span class="routing-info-duration" title=${translate('routing_info_duration')}>${stats ? getDuration() : '-:-'}</span>
						<div class="badge routing-info-type" style=${`background:${getCategory(categoryId).color};`}>
							<span class=${`icon icon-${categoryId}`}></span>
							<span class="text">${getCategory(categoryId).label}<span>
						</div>
					</div>
					<div class="container">
						<div class="row">
							<div class="col" title=${translate('routing_info_distance')}>
								<div class="routing-info-icon distance"></div>
							</div>
							<div class="routing-info-text">
								<span>${getDistance()}</span>
							</div>
							<div class="col" title=${translate('routing_info_uphill')}>
								<div class="routing-info-icon uphill"></div>
							</div>
							<div class="routing-info-text">
								<span>${getUphill()}</span>
							</div>
							<div class="col" title=${translate('routing_info_downhill')}>
								<div class="routing-info-icon downhill"></div>
							</div>
							<div class="routing-info-text">
								<span>${getDownhill()}</span>
							</div>
						</div>
					</div>`
			: nothing;
	}

	_formatDuration(seconds) {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);

		const toTwoDigits = (timePart) => {
			return timePart < 10 ? `0${timePart}` : timePart;
		};

		return `${toTwoDigits(hours)}:${toTwoDigits(minutes)}`;
	}

	_estimateTimeFor(categoryId, stats) {
		const unknownCategoryAction = (categoryId) => {
			console.warn(`Unknown category, no estimate available for '${categoryId}'`);
			return null;
		};

		const estimatedTime = this._routingService.getETAFor(categoryId, stats.dist, stats.twoDiff[0], stats.twoDiff[1]);
		return estimatedTime ?? unknownCategoryAction(categoryId);
	}

	static get tag() {
		return 'ba-routing-info';
	}
}
