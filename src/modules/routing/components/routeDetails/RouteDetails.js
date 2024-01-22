/**
 * @module modules/routing/components/routeDetails/RouteDetails
 */
import { html, nothing } from 'lit-html';
import { RoutingStatusCodes } from '../../../../domain/routing';
import { $injector } from '../../../../injection/index';
import { MvuElement } from '../../../MvuElement';
import css from './routeDetails.css';

const Update_Route_Stats = 'update_route_stats';
const Update_Status = 'update_status';

/**
 * Renders extended statistical routing data, such as road and surface types
 * as charts
 * @author thiloSchlemmer
 */
export class RouteDetails extends MvuElement {
	constructor() {
		super({ status: null, warnings: null, chartData: null });
		const { RoutingService, TranslationService } = $injector.inject('RoutingService', 'TranslationService');
		this._translationService = TranslationService;
		this._routingService = RoutingService;
	}

	onInitialize() {
		this.observe(
			(store) => store.routing.status,
			(status) => this.signal(Update_Status, status)
		),
			this.observe(
				(store) => store.routing.stats,
				(stats) => this.signal(Update_Route_Stats, stats)
			);
	}

	update(type, data, model) {
		const createChartData = (stats) => this._createChartData(stats);
		const createWarnings = (stats) => this._createWarnings(stats);
		switch (type) {
			case Update_Route_Stats:
				return { ...model, warnings: createWarnings(data), chartData: createChartData(data) };
			case Update_Status:
				return { ...model, status: data };
		}
	}

	createView(model) {
		const { status, warnings, chartData } = model;

		const translate = (key) => this._translationService.translate(key);
		const isVisible = status === RoutingStatusCodes.Ok;
		const asArray = (objectData) =>
			Object.entries(objectData).map(([k, v]) => {
				return { ...v, name: k };
			});
		return isVisible
			? html`<style>
						${css}
					</style>
					<div class="container">
						<div>
							<div>
								<ba-routing-warnings .items=${asArray(warnings)}></ba-routing-warnings>
							</div>
							<div>
								<ba-routing-chart .label=${translate('routing_details_surface')} .items=${asArray(chartData.surface)}></ba-routing-chart>
								<ba-routing-chart .label=${translate('routing_details_road_type')} .items=${asArray(chartData.roadTypes)}></ba-routing-chart>
							</div>
						</div>
					</div>`
			: nothing;
	}

	_createWarnings(statistics) {
		return statistics ? statistics.warnings : {};
	}

	_createChartData(routeStatistics) {
		const appendChartStyle = (typeData, styles) => {
			const appendStyle = (styleType, data) => {
				return styleType in styles ? { ...styles[styleType], data: data } : { ...styles.unknown, data: data };
			};
			return Object.keys(typeData).reduce((result, typeItem) => {
				result[typeItem] = appendStyle(typeItem, typeData[typeItem]);
				return result;
			}, {});
		};

		const getSurfaceChartItems = (surfaceTypes) => appendChartStyle(surfaceTypes, this._routingService.getSurfaceTypeStyles());
		const getRoadChartItems = (roadTypes) => appendChartStyle(roadTypes, this._routingService.getRoadTypeStyles());

		const createChartDataFrom = (statistics) => {
			const collectedRouteChartData = this._aggregateRouteChartData(statistics);
			return {
				surface: getSurfaceChartItems(collectedRouteChartData.surfaceTypes),
				roadTypes: getRoadChartItems(this._routingService.mapRoadTypesToCatalogId(collectedRouteChartData.roadTypes))
			};
		};

		return routeStatistics ? createChartDataFrom(routeStatistics) : { surface: {}, roadTypes: {} };
	}

	_aggregateRouteChartData(statistics) {
		const { surface: surfaceTypes, road_class: roadClasses } = statistics.details;

		const aggregate = (routeDetailTypeAttributes) =>
			Object.entries(routeDetailTypeAttributes).reduce((accumulator, current) => {
				const [attributeTypeName, attributeTypeProperties] = current;
				accumulator[attributeTypeName] = {
					absolute: attributeTypeProperties.distance,
					relative: this._percentageOfDistance(attributeTypeProperties.distance, statistics.dist),
					segments: attributeTypeProperties.segments
				};
				return accumulator;
			}, {});

		return {
			surfaceTypes: aggregate(surfaceTypes),
			roadTypes: aggregate(roadClasses)
		};
	}

	_percentageOfDistance(portion, total) {
		const hundred = 100;
		return (portion / total) * hundred;
	}

	static get tag() {
		return 'ba-routing-details';
	}
}
