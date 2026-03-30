/**
 * @module modules/routing/components/routeInfo/RouteInfo
 */
import { html, nothing } from 'lit-html';
import { RoutingStatusCodes } from '../../../../domain/routing';
import { $injector } from '../../../../injection/index';
import { MvuElement } from '../../../MvuElement';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg.js';
import css from './routeInfo.css?inline';

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
		);
		this.observe(
			(store) => store.routing.stats,
			(stats) => this.signal(Update_Route_Stats, stats)
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
			if (!stats) {
				return { localizedValue: '-:-', unit: 'h:min' };
			}
			const estimate = stats.time;
			const seconds = estimate / 1000;
			if (seconds < Minute_In_Seconds) {
				return { localizedValue: '< 1', unit: 'min' };
			}

			return { localizedValue: this._formatDuration(seconds), unit: 'h:min' };
		};
		const durationRepresentation = getDuration();

		const getDistance = () => {
			if (stats?.dist) {
				return this._unitsService.formatDistance(stats.dist);
			}
			return { localizedValue: '-', unit: 'm' };
		};
		const distanceRepresentation = getDistance();

		const getUphill = () => {
			if (stats) {
				return this._unitsService.formatDistance(stats.twoDiff[0]);
			}
			return { localizedValue: '-', unit: 'm' };
		};
		const uphillRepresentation = getUphill();

		const getDownhill = () => {
			if (stats) {
				return this._unitsService.formatDistance(stats.twoDiff[1]);
			}
			return { localizedValue: '-', unit: 'm' };
		};
		const downhillRepresentation = getDownhill();
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
								<div class="routing-info-duration-text">${translate('routing_info_duration')} (${durationRepresentation.unit})</div>
								<span class="routing-info-duration" title=${translate('routing_info_duration')}> ${durationRepresentation.localizedValue} </span>
								<div>${category.label}</div>
							</div>
						</div>
						<div class="detail">
							<div class="row">
								<div class="item">
									<div class="item-header">${translate('routing_info_distance')} (${distanceRepresentation.unit})</div>
									<div class="item-content">
										<div class="col" title=${translate('routing_info_distance')}>
											<div class="routing-info-icon distance"></div>
										</div>
										<div class="routing-info-text">${distanceRepresentation.localizedValue}</div>
									</div>
								</div>

								<div class="item">
									<div class="item-header">${translate('routing_info_uphill')} (${uphillRepresentation.unit})</div>
									<div class="item-content">
										<div class="col" title=${translate('routing_info_uphill')}>
											<div class="routing-info-icon uphill"></div>
										</div>
										<div class="routing-info-text">
											<span>${uphillRepresentation.localizedValue}</span>
										</div>
									</div>
								</div>
								<div class="item">
									<div class="item-header">${translate('routing_info_downhill')} (${downhillRepresentation.unit})</div>
									<div class="item-content">
										<div class="col" title=${translate('routing_info_downhill')}>
											<div class="routing-info-icon downhill"></div>
										</div>
										<div class="routing-info-text">
											<span>${downhillRepresentation.localizedValue}</span>
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
