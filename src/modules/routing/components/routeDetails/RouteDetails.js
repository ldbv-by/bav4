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

const Mocked_Route_Statistics = {
	surface: {
		asphalt: {
			distance: 18,
			segments: [
				[0, 1],
				[3, 4]
			]
		},
		other: {
			distance: 57,
			segments: [
				[0, 1],
				[3, 4]
			]
		}
	},
	road_class: {
		residential: 10
	}
};

const Mocked_Route_Warnings = {
	hike_path_grade4_ground: {
		message: 'Alpine Erfahrung, Trittsicherheit erforderlich.',
		criticality: 'Warning',
		segments: [[0, 1]]
	},
	hike_path_grade5_ground: {
		message: 'Spezielle Ausrüstung erforderlich.',
		criticality: 'Warning',
		segments: [[0, 1]]
	}
};

export class RouteDetails extends MvuElement {
	constructor() {
		super({ status: null, warnings: null, chartData: null });
		const { RoutingService, TranslationService } = $injector.inject('RoutingService', 'TranslationService');
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
	}

	update(type, data, model) {
		const createChartData = (route) => this._createChartData(this._createStatistics(route));
		const createWarnings = (route) => this._createWarnings(route);
		switch (type) {
			case Update_Route:
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

	_createStatistics(route) {
		if (route) {
			console.warn('Creating of route statistics is not implemented. Returning mocked data instead');
		}
		return Mocked_Route_Statistics;
	}

	_createWarnings(route) {
		if (route) {
			console.warn('Creating of warnings is not implemented. Returning mocked data instead');
		}
		return Mocked_Route_Warnings;
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

		const createChartDataFrom = (routeData) => {
			const collectedRouteData = this._aggregateRouteStatistics(routeData);
			return {
				surface: getSurfaceChartItems(collectedRouteData.surfaceTypes),
				roadTypes: getRoadChartItems(this._routingService.mapOsmRoadTypes(collectedRouteData.roadTypes))
			};
		};

		return routeStatistics ? createChartDataFrom(routeStatistics) : { surface: {}, roadTypes: {} };
	}

	_aggregateRouteStatistics(statistics) {
		const data = {
			surfaceTypes: {},
			roadTypes: {}
		};

		if (statistics) {
			const { surface, road_class } = statistics;
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
