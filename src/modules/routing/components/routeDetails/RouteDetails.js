/**
 * @module modules/routing/components/routeDetails/RouteDetails
 */
import { html, nothing } from 'lit-html';
import { RoutingStatusCodes } from '../../../../domain/routing';
import { $injector } from '../../../../injection/index';
import { isNumber } from '../../../../utils/checks';
import { MvuElement } from '../../../MvuElement';
import css from './routeDetails.css';

const Update_Route = 'update_route';
const Update_Status = 'update_status';

export class RouteDetails extends MvuElement {
	constructor() {
		super({ status: null, route: null, chartData: null });
		const { RoutingService, TranslationService } = $injector.inject('RoutingService', 'TranslationService');
		this._translationService = TranslationService;
		this._routingService = RoutingService;
		this.observe(
			(store) => store.routing.status,
			(status) => this.signal(Update_Status, status)
		);

		this.observe(
			(store) => store.routing.stats?.details,
			(stats) => this.signal(Update_Route, stats)
		);
	}

	update(type, data, model) {
		const createChartData = (routeData) => this._createChartData(routeData);
		switch (type) {
			case Update_Route:
				return { ...model, route: data, chartData: createChartData(data) };
			case Update_Status:
				return { ...model, status: data };
		}
	}

	createView(model) {
		const { status, route, chartData } = model;
		const translate = (key) => this._translationService.translate(key);
		const warnings = route?.warnings ?? [];
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
						<div class="overflow-container">
							<div class="warnings">
								<ba-routing-warnings .items=${asArray(warnings)}></ba-routing-warnings>
							</div>
							<div class="charts">
								<ba-routing-chart .label=${translate('routing_details_surface')} .items=${asArray(chartData.surface)}></ba-routing-chart>
								<ba-routing-chart .label=${translate('routing_details_road_type')} .items=${asArray(chartData.roadTypes)}></ba-routing-chart>
							</div>
						</div>
					</div>`
			: nothing;
	}

	_createChartData(routeData) {
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

		const createChartDataFrom = (routeData) => {
			const collectedRouteData = this._aggregateRouteData(routeData);
			return {
				surface: getSurfaceChartItems(collectedRouteData.surfaceTypes),
				roadTypes: getRoadChartItems(this._routingService.mapOsmRoadTypes(collectedRouteData.roadTypes))
			};
		};

		return routeData ? createChartDataFrom(routeData) : { surface: {}, roadTypes: {} };
	}

	_aggregateRouteData(routeData) {
		const data = {
			surfaceTypes: {},
			roadTypes: {}
		};

		if (routeData) {
			const { surface, road_class } = routeData;
			const surfaceTypes = surface ?? {};
			const roadClasses = road_class ?? {};

			const surfaceTypeDist = this._calcDistance(surfaceTypes);
			const roadClassDist = this._calcDistance(road_class ?? {});

			for (const surfaceType in surfaceTypes) {
				data.surfaceTypes[surfaceType] = {
					absolute: this._sanitizeDistance(surfaceTypes[surfaceType]),
					relative: this._percentageOfDistance(this._sanitizeDistance(surfaceTypes[surfaceType]), surfaceTypeDist),
					segments: this._sanitizeSegments(surfaceTypes[surfaceType])
				};
			}

			for (const roadClass in roadClasses) {
				data.roadTypes[roadClass] = {
					absolute: this._sanitizeDistance(roadClasses[roadClass]),
					relative: this._percentageOfDistance(this._sanitizeDistance(roadClasses[roadClass]), roadClassDist),
					segments: this._sanitizeSegments(roadClasses[roadClass])
				};
			}
		}

		return data;
	}

	_percentageOfDistance(portion, total) {
		const HUNDRED = 100;
		return (portion / total) * HUNDRED;
	}

	_calcDistance(segments) {
		let distance = 0;
		for (const segment in segments) {
			distance += this._sanitizeDistance(segments[segment]);
		}
		return distance;
	}

	_sanitizeDistance = (candidate) => {
		return isNumber(candidate) ? candidate : candidate.distance;
	};

	_sanitizeSegments = (candidate) => {
		return candidate.segments ?? [];
	};

	static get tag() {
		return 'ba-routing-details';
	}
}
