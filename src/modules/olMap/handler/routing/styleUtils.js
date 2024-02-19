/**
 * @module modules/olMap/handler/routing/styleUtils
 */
import { Style, Icon, Stroke, Text as TextStyle, Circle, Fill } from 'ol/style';
import { ROUTING_CATEGORY, ROUTING_FEATURE_TYPE, RoutingFeatureTypes, ROUTING_FEATURE_INDEX } from './OlRoutingHandler';
import { $injector } from '../../../../injection/index';

export const getRoutingStyleFunction = () => {
	const { IconService: iconService } = $injector.inject('IconService');
	return (feature) => {
		switch (feature.get(ROUTING_FEATURE_TYPE)) {
			case RoutingFeatureTypes.START:
				return [
					new Style({
						image: new Icon({
							anchor: [0.5, 1],
							anchorXUnits: 'fraction',
							anchorYUnits: 'fraction',
							src: iconService.getIconResult('rt_start').base64
						})
					})
				];
			case RoutingFeatureTypes.DESTINATION:
				return [
					new Style({
						image: new Icon({
							anchor: [0.5, 1],
							anchorXUnits: 'fraction',
							anchorYUnits: 'fraction',
							src: iconService.getIconResult('rt_destination').base64
						})
					})
				];
			case RoutingFeatureTypes.INTERMEDIATE: {
				const text = feature.get(ROUTING_FEATURE_INDEX) ? feature.get(ROUTING_FEATURE_INDEX).toString() : '';

				const textStyle = new TextStyle({
					text: text,
					offsetY: 2,
					font: 'bold 14px Open Sans',
					// fill: fill,
					stroke: new Stroke({
						color: [255, 255, 255, 1],
						width: 3
					})
				});

				return [
					new Style({
						image: new Icon({
							anchor: [0.5, 0.5],
							anchorXUnits: 'fraction',
							anchorYUnits: 'fraction',
							src: iconService.getIconResult('rt_intermediate').base64
						}),
						text: textStyle
					})
				];
			}
			case RoutingFeatureTypes.ROUTE:
				return [
					new Style({
						stroke: new Stroke({
							color: feature.get(ROUTING_CATEGORY).style.routeBorderColor,
							width: 8
						})
					})
				];
			case RoutingFeatureTypes.ROUTE_ALTERNATIVE:
				return [
					new Style({
						zIndex: feature.get(ROUTING_CATEGORY).style.routeZindex || 0,
						stroke: new Stroke({
							color: 'white',
							width: 5,
							lineDash: [10]
						})
					}),
					new Style({
						zIndex: feature.get(ROUTING_CATEGORY).style.routeZindex + 1 || 1,
						stroke: new Stroke({
							color: feature.get(ROUTING_CATEGORY).style.routeColor,
							width: 3,
							lineDash: [5]
						})
					})
				];
			case RoutingFeatureTypes.ROUTE_SEGMENT:
				return [
					new Style({
						stroke: new Stroke({
							color: feature.get(ROUTING_CATEGORY).style.routeColor,
							width: 5
						})
					})
				];
			case RoutingFeatureTypes.ROUTE_HIGHLIGHT:
				return [
					new Style({
						stroke: new Stroke({
							color: '#ffc107',
							width: 3
						})
					})
				];
			default:
				return null;
		}
	};
};
export const getModifyInteractionStyle = () => {
	return [
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
};
