import { getModifyInteractionStyle, getRoutingStyleFunction } from '../../../../../src/modules/olMap/handler/routing/styleUtils';
import {
	ROUTING_CATEGORY,
	ROUTING_FEATURE_INDEX,
	ROUTING_FEATURE_TYPE,
	RoutingFeatureTypes
} from '../../../../../src/modules/olMap/handler/routing/OlRoutingHandler';
import { Feature } from 'ol';
import { Circle, Fill, Icon, Stroke, Style, Text } from 'ol/style';
import { TestUtils } from '../../../../test-utils';
import { $injector } from '../../../../../src/injection';

const baRoutingIconMock = 'data:image/svg+xml;base64,foo';
const iconServiceMock = { getIconResult: () => {} };
beforeAll(() => {
	TestUtils.setupStoreAndDi();
	$injector.registerSingleton('IconService', iconServiceMock);
});

describe('styleUtils', () => {
	describe('routingStyleFunction', () => {
		it('returns a style function for feature type "START"', () => {
			const iconSpy = spyOn(iconServiceMock, 'getIconResult').withArgs('rt_start').and.returnValue({ base64: baRoutingIconMock });
			const feature = new Feature();
			feature.set(ROUTING_FEATURE_TYPE, RoutingFeatureTypes.START);
			const expected = [
				new Style({
					image: new Icon({
						anchor: [0.5, 1],
						anchorXUnits: 'fraction',
						anchorYUnits: 'fraction',
						src: baRoutingIconMock
					})
				})
			];

			const result = getRoutingStyleFunction()(feature);

			expect(result).toEqual(expected);
			expect(iconSpy).toHaveBeenCalled();
		});

		it('returns a style function for feature type "DESTINATION"', () => {
			const iconSpy = spyOn(iconServiceMock, 'getIconResult').withArgs('rt_destination').and.returnValue({ base64: baRoutingIconMock });
			const feature = new Feature();
			feature.set(ROUTING_FEATURE_TYPE, RoutingFeatureTypes.DESTINATION);
			const expected = [
				new Style({
					image: new Icon({
						anchor: [0.5, 1],
						anchorXUnits: 'fraction',
						anchorYUnits: 'fraction',
						src: baRoutingIconMock
					})
				})
			];

			const result = getRoutingStyleFunction()(feature);

			expect(result).toEqual(expected);
			expect(iconSpy).toHaveBeenCalled();
		});

		it('returns a style function for feature type "INTERMEDIATE"', () => {
			const iconSpy = spyOn(iconServiceMock, 'getIconResult').withArgs('rt_intermediate').and.returnValue({ base64: baRoutingIconMock });
			const feature0 = new Feature();
			feature0.set(ROUTING_FEATURE_TYPE, RoutingFeatureTypes.INTERMEDIATE);
			feature0.set(ROUTING_FEATURE_INDEX, 42);
			const feature1 = new Feature();
			feature1.set(ROUTING_FEATURE_TYPE, RoutingFeatureTypes.INTERMEDIATE);

			const expected = [
				new Style({
					image: new Icon({
						anchor: [0.5, 0.5],
						anchorXUnits: 'fraction',
						anchorYUnits: 'fraction',
						src: baRoutingIconMock
					}),
					text: new Text({
						text: '42',
						offsetY: 2,
						font: 'bold 14px Open Sans',
						// fill: fill,
						stroke: new Stroke({
							color: [255, 255, 255, 1],
							width: 3
						})
					})
				})
			];
			const expectedWithDefaultText = [
				new Style({
					image: new Icon({
						anchor: [0.5, 0.5],
						anchorXUnits: 'fraction',
						anchorYUnits: 'fraction',
						src: baRoutingIconMock
					}),
					text: new Text({
						text: '',
						offsetY: 2,
						font: 'bold 14px Open Sans',
						// fill: fill,
						stroke: new Stroke({
							color: [255, 255, 255, 1],
							width: 3
						})
					})
				})
			];

			const result0 = getRoutingStyleFunction()(feature0);
			const result1 = getRoutingStyleFunction()(feature1);

			expect(result0).toEqual(expected);
			expect(result1).toEqual(expectedWithDefaultText);
			expect(iconSpy).toHaveBeenCalledTimes(2);
		});

		it('returns a style function for feature type "ROUTE"', () => {
			const category = {
				id: 'bike',
				label: 'Fahrrad',
				style: {
					routeColor: 'gray',
					routeBorderColor: 'green'
				},
				subcategories: []
			};
			const feature = new Feature();
			feature.set(ROUTING_FEATURE_TYPE, RoutingFeatureTypes.ROUTE);
			feature.set(ROUTING_CATEGORY, category);
			const expected = [
				new Style({
					stroke: new Stroke({
						color: 'green',
						width: 8
					})
				})
			];

			const result = getRoutingStyleFunction()(feature);

			expect(result).toEqual(expected);
		});

		it('returns a style function for feature type "ROUTE_ALTERNATIVE"', () => {
			const categoryWithZIndex = {
				id: 'bike',
				label: 'Fahrrad',
				style: {
					routeColor: 'gray',
					routeBorderColor: 'green',
					routeZindex: 1
				},
				subcategories: []
			};
			const categoryWithOutZIndex = {
				id: 'mtb',
				label: 'Mountainbike',
				style: {
					routeColor: 'gray',
					routeBorderColor: 'SpringGreen'
				},
				subcategories: []
			};
			const feature0 = new Feature();
			feature0.set(ROUTING_FEATURE_TYPE, RoutingFeatureTypes.ROUTE_ALTERNATIVE);
			feature0.set(ROUTING_CATEGORY, categoryWithZIndex);
			const feature1 = new Feature();
			feature1.set(ROUTING_FEATURE_TYPE, RoutingFeatureTypes.ROUTE_ALTERNATIVE);
			feature1.set(ROUTING_CATEGORY, categoryWithOutZIndex);
			const expected0 = [
				new Style({
					zIndex: 1,
					stroke: new Stroke({
						color: 'white',
						width: 5,
						lineDash: [10]
					})
				}),
				new Style({
					zIndex: 2,
					stroke: new Stroke({
						color: feature0.get(ROUTING_CATEGORY).style.routeColor,
						width: 3,
						lineDash: [5]
					})
				})
			];
			const expected1 = [
				new Style({
					zIndex: 0,
					stroke: new Stroke({
						color: 'white',
						width: 5,
						lineDash: [10]
					})
				}),
				new Style({
					zIndex: 1,
					stroke: new Stroke({
						color: feature0.get(ROUTING_CATEGORY).style.routeColor,
						width: 3,
						lineDash: [5]
					})
				})
			];

			const result0 = getRoutingStyleFunction()(feature0);
			const result1 = getRoutingStyleFunction()(feature1);

			expect(result0).toEqual(expected0);
			expect(result1).toEqual(expected1);
		});

		it('returns a style function for feature type "ROUTE_SEGMENT"', () => {
			const category = {
				id: 'bike',
				label: 'Fahrrad',
				style: {
					routeColor: 'gray',
					routeBorderColor: 'green',
					routeZindex: 1
				},
				subcategories: []
			};
			const feature = new Feature();
			feature.set(ROUTING_FEATURE_TYPE, RoutingFeatureTypes.ROUTE_SEGMENT);
			feature.set(ROUTING_CATEGORY, category);
			const expected = [
				new Style({
					stroke: new Stroke({
						color: 'gray',
						width: 5
					})
				})
			];

			const result = getRoutingStyleFunction()(feature);

			expect(result).toEqual(expected);
		});

		it('returns a style function for feature type "ROUTE_HIGHLIGHT"', () => {
			const feature = new Feature();
			feature.set(ROUTING_FEATURE_TYPE, RoutingFeatureTypes.ROUTE_HIGHLIGHT);
			const expected = [
				new Style({
					stroke: new Stroke({
						color: '#ffc107',
						width: 3
					})
				})
			];

			const result = getRoutingStyleFunction()(feature);

			expect(result).toEqual(expected);
		});

		it('returns NULL when feature type not supported', () => {
			const feature = new Feature();
			feature.set(ROUTING_FEATURE_TYPE, 'unsupported');

			const result = getRoutingStyleFunction()(feature);

			expect(result).toBeNull();
		});
	});

	describe('getModifyInteractionStyle', () => {
		it('returns a style', () => {
			const feature = new Feature();
			feature.set(ROUTING_FEATURE_TYPE, RoutingFeatureTypes.START);
			const expected = [
				new Style({
					image: new Circle({
						radius: 8,
						fill: new Fill({
							color: '#099dda'
						})
					})
				}),
				new Style({
					image: new Circle({
						radius: 6,
						fill: new Fill({
							color: 'white'
						})
					})
				})
			];

			const result = getModifyInteractionStyle();

			expect(result).toEqual(expected);
		});
	});
});
