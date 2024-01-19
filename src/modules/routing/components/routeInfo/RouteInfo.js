/**
 * @module modules/routing/components/routeInfo/RouteInfo
 */
import { html, nothing } from 'lit-html';
import { RoutingStatusCodes } from '../../../../domain/routing';
import { $injector } from '../../../../injection/index';
import { MvuElement } from '../../../MvuElement';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg.js';
import css from './routeInfo.css';

const Update_Status = 'update_status';
const Update_Route_Stats = 'update_route_stats';
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
	}

	onInitialize() {
		this.observe(
			(store) => store.routing.status,
			(status) => this.signal(Update_Status, status)
		),
			this.observe(
				(store) => store.routing.stats,
				(stats) => this.signal(Update_Route_Stats, stats)
			),
			this.observe(
				(state) => state.routing.categoryId,
				(categoryId) => this.signal(Update_Category, categoryId)
			);
	}

	update(type, data, model) {
		switch (type) {
			case Update_Status:
				return { ...model, status: data };
			case Update_Route_Stats:
				return { ...model, stats: data };
			case Update_Category:
				return { ...model, categoryId: data };
		}
	}

	createView(model) {
		const { status, stats, categoryId } = model;
		const translate = (key) => this._translationService.translate(key);
		const isVisible = status === RoutingStatusCodes.Ok;
		const parent = this._routingService.getCategoryById(this._routingService.getParent(categoryId));
		const category = this._routingService.getCategoryById(categoryId);
		const color = category?.style.color ?? parent?.style.color;
		const iconSource = category?.style.icon ?? parent?.style.icon;

		const getDuration = () => {
			const estimate = stats.time;
			const seconds = estimate / 1000;
			if (seconds < Minute_In_Seconds) {
				return '< 1 min.';
			}

			return this._formatDuration(seconds);
		};

		const getDistance = () => {
			return stats?.dist ? this._unitsService.formatDistance(stats.dist) : '-';
		};

		const getUphill = () => {
			return stats ? this._unitsService.formatDistance(stats.twoDiff[0]) : '-';
		};

		const getDownhill = () => {
			return stats ? this._unitsService.formatDistance(stats.twoDiff[1]) : '-';
		};
		const getColor = () => {
			return html`*{--primary-color: ${color}`;
		};

		const renderCategoryIcon = (iconSource) => {
			if (iconSource) {
				return html`
					<svg class="category-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">${unsafeSVG(iconSource)}</svg>
				`;
			}
			return nothing;
		};

		return isVisible
			? html`<style>
						${css}

						${getColor()};
					</style>
					<div class="container">
						<div class="header">
							<div class="header-icon-background">
								<span class=${`header-icon icon-${categoryId}`}> ${renderCategoryIcon(iconSource)} </span>
							</div>
							<div class="header-text">
								<div class="routing-info-duration-text">${translate('routing_info_duration')}</div>
								<span class="routing-info-duration" title=${translate('routing_info_duration')}> ${stats ? getDuration() : '-:-'} </span>
								<div>${category.label}</div>
							</div>
						</div>
						<div class="detail">
							<div class="row">
								<div class="item">
									<div class="item-header">${translate('routing_info_distance')}</div>
									<div class="item-content">
										<div class="col" title=${translate('routing_info_distance')}>
											<div class="routing-info-icon distance"></div>
										</div>
										<div class="routing-info-text">${getDistance()}</div>
									</div>
								</div>

								<div class="item">
									<div class="item-header">${translate('routing_info_uphill')}</div>
									<div class="item-content">
										<div class="col" title=${translate('routing_info_uphill')}>
											<div class="routing-info-icon uphill"></div>
										</div>
										<div class="routing-info-text">
											<span>${getUphill()}</span>
										</div>
									</div>
								</div>
								<div class="item">
									<div class="item-header">${translate('routing_info_downhill')}</div>
									<div class="item-content">
										<div class="col" title=${translate('routing_info_downhill')}>
											<div class="routing-info-icon downhill"></div>
										</div>
										<div class="routing-info-text">
											<span>${getDownhill()}</span>
										</div>
									</div>
								</div>
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

	static get tag() {
		return 'ba-routing-info';
	}
}
