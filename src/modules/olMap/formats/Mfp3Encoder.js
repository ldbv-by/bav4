
import Point from 'ol/geom/Point';
import { intersects as extentIntersects } from 'ol/extent';
import { GeoJSON as GeoJSONFormat } from 'ol/format';
import { $injector } from '../../../injection';
import { rgbToHex } from '../../../utils/colors';
import { asArray as ColorAsArray } from 'ol/color';
import { GeoResourceTypes } from '../../../domain/geoResources';
import Style from 'ol/style/Style';

import { Icon as IconStyle } from 'ol/style';
import { Feature } from 'ol';
import { MeasurementOverlay } from '../components/MeasurementOverlay';

const UnitsRatio = 39.37; //inches per meter
const PointsPerInch = 72; // PostScript points 1/72"
/**
 * A Container-Object for properties related to a mfp encoding
 * @typedef {Object} EncodingProperties
 * @param {string} layoutId
 * @param {Number} scale
 * @param {Number} dpi
 * @param {Number} [rotation]
 * @param {Point} [pageCenter]
 * @param {Extent} [pageExtent]
 * @param {Number} [targetSRID]
 * @param {Number} [styleVersion]
*/

/***
 * @class
 * @author thiloSchlemmer
 */
export class Mfp3Encoder {
	/*
	TODO:
	- should encode to a target srid (or DefaultGeodeticSRID)
	- should filter layer without support of target srid
		-> WmsGeoResource (should have a list of supported srids)
	- should translate baseURL of WmtsGeoResource (XYZSource) to a valid baseURL for target srid
	- should unproxify URL to external Resources (e.g. a image in a icon style)
	- should support Mapfish JSON Style Version 1 AND Version 2
	- check whether filter for resolution is needed or not
	- check whether specific fonts are managed by the print server or not
	- check whether features to be encoded have special geometry (Circle, Point with ImageStyle of RegularShape) or not
	- attributions: to get 'dataOwner' and 'thirdPartyDataOwner'
	*/

	constructor(encodingProperties) {
		const { MapService: mapService, GeoResourceService: geoResourceService } = $injector.inject('MapService', 'GeoResourceService');
		this._mapService = mapService;
		this._geoResourceService = geoResourceService;
		this._mfpProperties = encodingProperties;
		this._mapProjection = `EPSG:${this._mapService.getSrid()}`;
		this._mfpProjection = this._mfpProperties.targetSRID ? `EPSG:${this._mfpProperties.targetSRID}` : `EPSG:${this._mapService.getDefaultGeodeticSrid()}`;
		this._pageExtent = null;
		this._geometryEncodingFormat = new GeoJSONFormat();
		this._encodingStyleId = 0;

		const validEncodingProperties = (properties) => {
			return properties.layoutId != null &&
				(properties.scale != null && properties.scale !== 0) &&
				properties.dpi != null;
		};

		if (!validEncodingProperties(this._mfpProperties)) {
			throw Error('Invalid or missing EncodingProperties');
		}

	}

	/**
	 *
	 * @param {ol.Map} olMap the map with the content to encode for MapFishPrint3
	 * @returns {Object} the encoded mfp specs
	 */
	encode(olMap) {

		const getDefaultMapCenter = () => {
			return new Point(olMap.getView().getCenter());
		};
		const getDefaultMapExtent = () => {
			return olMap.getView().calculateExtent(olMap.getSize());
		};

		const mfpCenter = this._mfpProperties.mapCenter && typeof this._mfpProperties.mapCenter === Point
			? this._mfpProperties.mapCenter.clone().transform(this._mapProjection, this._mfpProjection)
			: getDefaultMapCenter().clone().transform(this._mapProjection, this._mfpProjection);

		this._pageExtent = this._mfpProperties.pageExtent
			? this._mfpProperties.pageExtent
			: getDefaultMapExtent();

		const resolution = olMap.getView().getResolution();

		const encodedLayers = olMap.getLayers().getArray()
			.filter(layer => {
				const layerExtent = layer.getExtent();

				return layerExtent ? extentIntersects(layer.getExtent(), this._pageExtent) : true;
			})
			.map(l => this._encode(l));

		const encodedOverlays = olMap.getOverlays().getArray().map(overlay => this._encodeOverlay(overlay, resolution));

		return {
			layout: this._mfpProperties.layoutId,
			attributes: {
				map: {
					center: mfpCenter,
					scale: this._mfpProperties.scale,
					projection: this._mfpProjection,
					dpi: this._mfpProperties.dpi,
					rotation: this._mfpProperties.rotation,
					layers: [...encodedLayers, ...encodedOverlays]
				}
			}
		};
	}

	_geoResourceFrom(layer) {
		const layerId = layer.get('id');
		const geoResourceId = layer.get('geoResourceId');
		const geoResource = geoResourceId ? this._geoResourceService.byId(geoResourceId) : this._geoResourceService.byId(layerId);
		if (!geoResource) {
			const idSegments = layerId.split('_');
			const geoResourceIdCandidate = idSegments[0];
			return this._geoResourceService.byId(geoResourceIdCandidate);
		}

		return geoResource;
	}

	_encode(layer) {
		const geoResource = this._geoResourceFrom(layer);
		if (!geoResource) {
			console.warn('No geoResource found for Layer', layer);
			return null;
		}
		switch (geoResource.getType()) {
			case GeoResourceTypes.AGGREGATE:
				return this._encodeGroup(layer);
			case GeoResourceTypes.VECTOR:
				return this._encodeVector(layer);
			case GeoResourceTypes.WMTS:
				return this._encodeWMTS(layer);
			case GeoResourceTypes.WMS:
				return this._encodeWMS(layer, geoResource);
			default:
				return null;
		}
	}

	_encodeGroup(groupLayer) {
		const subLayers = groupLayer.getLayers().getArray();
		return subLayers.map(l => this._encode(l));
	}

	_encodeWMTS(olLayer) {
		// all WMTS-Layers rely on {@see XYZSource}, this must be translated to spec type 'osm' in MapFishPrint V3
		// the only required parameter is: baseURL
		const source = olLayer.getSource();
		const tileGrid = source.getTileGrid();
		const url = source.getUrls()[0];
		const baseUrl = url;

		return {
			opacity: olLayer.getOpacity(),
			type: 'osm',
			baseURL: baseUrl,
			tileSize: [tileGrid.getTileSize(0), tileGrid.getTileSize(0)]
		};
	}

	_encodeWMS(olLayer, wmsGeoResource) {
		const source = olLayer.getSource();
		const params = source.getParams();
		const layers = params.LAYERS.split(',') || [];
		const styles = (params.STYLES != null) ?
			params.STYLES.split(',') :
			new Array(layers.length).join(',').split(',');

		const url = (source.getUrls && source.getUrls()[0]) ||
			(source.getUrl && source.getUrl());

		return {
			type: 'wms',
			baseURL: url,
			imageFormat: wmsGeoResource.format,
			layers: layers,
			name: wmsGeoResource.id,
			opacity: olLayer.getOpacity(),
			styles: styles
		};
	}

	_encodeVector(olVectorLayer) {
		// todo: refactor to utils
		// adopted/adapted from {@link https://dmitripavlutin.com/javascript-array-group/#:~:text=must%20be%20inserted.-,array.,provided%20by%20core%2Djs%20library. | Array Grouping in JavaScript}
		const groupBy = (elementsToGroup, groupByFunction) => elementsToGroup.reduce((group, element) => {
			const groupName = groupByFunction(element);
			group[groupName] = group[groupName] ?? [];
			group[groupName].push(element);
			return group;
		}, {});

		const defaultGroups = { MultiPolygon: [], Polygon: [], Circle: [], GeometryCollection: [], LineString: [], MultiLineString: [], Point: [] };
		const groupByGeometryType = (features) => groupBy(features, feature => feature.getGeometry().getType());
		const groupedByGeometryType = { ...defaultGroups, ...groupByGeometryType(olVectorLayer.getSource().getFeatures()) };

		const featuresSortedByGeometryType = [
			...groupedByGeometryType['MultiPolygon'],
			...groupedByGeometryType['Polygon'],
			...groupedByGeometryType['Circle'],
			...groupedByGeometryType['GeometryCollection'],
			...groupedByGeometryType['LineString'],
			...groupedByGeometryType['MultiLineString'],
			...groupedByGeometryType['Point']];

		const encodingResults = featuresSortedByGeometryType.reduce((encoded, feature) => {
			const result = this._encodeFeature(feature, olVectorLayer);
			return result ? {
				features: [...encoded.features, ...result.features],
				styles: [...encoded.styles, ...result.styles]
			} : encoded;
		}, { features: [], styles: [] });

		const styleObjectFrom = (styles, version = 1) => {
			const styleObjectV1 = {
				version: '1',
				styleProperty: '_gx_style'
			};
			const styleObjectV2 = {
				version: '2'
			};

			const asV1 = (styles) => {
				styles.forEach(style => {
					// type-property is not needed for version 1
					// removing this property by object destructuring
					// eslint-disable-next-line no-unused-vars
					const { id, type, ...pureStyleProperties } = style;
					styleObjectV1[id] = pureStyleProperties;
				});
				return styleObjectV1;
			};

			const asV2 = (styles) => {
				styles.forEach(style => {
					const { id, ...pureStyleProperties } = style;
					styleObjectV2[`[_gx_style = ${id}]`] = {
						symbolizers: [pureStyleProperties]
					};
				});
				return styleObjectV2;
			};
			return version === 1 ? asV1(styles) : asV2(styles);
		};
		const styleVersion = this._mfpProperties.styleVersion ? this._mfpProperties.styleVersion : 1;
		return {
			type: 'geojson',
			geoJson: { features: encodingResults.features, type: 'FeatureCollection' },
			name: olVectorLayer.get('id'),
			style: styleObjectFrom(encodingResults.styles, styleVersion),
			opacity: olVectorLayer.getOpacity()
		};
	}

	_encodeFeature(olFeature, olLayer, presetStyles = []) {
		const defaultResult = { features: [], styles: [] };
		const resolution = this._mfpProperties.scale / UnitsRatio / PointsPerInch;

		const getOlStyles = (feature, layer, resolution) => {
			const featureStyles = feature.getStyle();
			if (featureStyles != null && typeof (featureStyles) === 'function') {
				return featureStyles(feature, resolution);
			}

			if (featureStyles != null && featureStyles.length > 0) {
				return featureStyles;
			}

			const layerStyleFunction = layer.getStyleFunction();
			if (layerStyleFunction) {
				return layer.getStyleFunction()(feature, resolution);
			}
			return [];
		};

		const getEncodableOlStyle = (styles) => {
			return styles && styles.length > 0 ? styles[0] : null;
		};

		const initEncodedStyle = () => {
			return { id: this._encodingStyleId++ };
		};

		const olStyles = presetStyles.length > 0 ? presetStyles : getOlStyles(olFeature, olLayer, resolution);
		const olStyleToEncode = getEncodableOlStyle(olStyles);

		if (!olStyleToEncode || !(olStyleToEncode instanceof Style)) {
			return null;
		}


		const encodedStyle = { ...initEncodedStyle(), ...this._encodeStyle(olStyleToEncode, olFeature.getGeometry(), this._mfpProperties.dpi) };
		if (encodedStyle.fillOpacity) {
			encodedStyle.fillOpacity *= olLayer.getOpacity();
		}

		if (encodedStyle.strokeOpacity) {
			encodedStyle.strokeOpacity *= olLayer.getOpacity();
		}


		// handle advanced styles
		const advancedStyleFeatures = olStyles.reduce((styleFeatures, style) => {
			const isGeometryFunction = style.getGeometry && typeof (style.getGeometry()) === 'function';
			// todo: isRenderFunction & encoding should be implemented for measurement features
			if (isGeometryFunction) {
				const geometry = style.getGeometry()(olFeature);
				if (geometry) {
					const result = this._encodeFeature(new Feature(geometry), olLayer, [style]);
					return result ? { features: [...styleFeatures.features, ...result.features], styles: [...styleFeatures.styles, ...result.styles] } : defaultResult;
				}
				return defaultResult;
			}
			return defaultResult;
		}, defaultResult);

		const encodedFeature = this._geometryEncodingFormat.writeFeatureObject(olFeature);
		encodedFeature.properties = { _gx_style: encodedStyle.id };


		return {
			features: [encodedFeature, ...advancedStyleFeatures.features],
			styles: [encodedStyle, ...advancedStyleFeatures.styles]
		};
	}

	_encodeStyle(olStyle, olGeometry, dpi) {
		const fillStyle = olStyle.getFill();
		const strokeStyle = olStyle.getStroke();
		const textStyle = olStyle.getText();
		const imageStyle = olStyle.getImage();
		const geometryType = olGeometry.getType().toLowerCase();
		const encoded = { type: geometryType, zIndex: olStyle.getZIndex() ? olStyle.getZIndex() : 0 };


		// Encode imageStyle only for Point-geometries;
		// LineString- and Polygon-geometries have a
		// ImageStyle only by default (import as kml -> createFeatureStyleFunction)
		if (imageStyle && encoded.type === 'point') {
			const scale = imageStyle.getScale();
			encoded.rotation = (imageStyle.getRotation() ?? 0) * 180.0 / Math.PI;
			const getPropertiesFromIconStyle = (iconStyle) => {
				return {
					size: iconStyle.getSize(),
					anchor: iconStyle.getAnchor(),
					imageSrc: iconStyle.getSrc().replace(/\.svg/, '.png')
				};
			};
			const getPropertiesFromShapeStyle = (shapeStyle) => {
				const stroke = shapeStyle.getStroke();
				const radius = shapeStyle.getRadius();
				const width = stroke ? Mfp3Encoder.adjustDistance(2 * radius, dpi) + Mfp3Encoder.adjustDistance(stroke.getWidth() + 1, dpi) : Mfp3Encoder.adjustDistance(2 * radius, dpi);
				return {
					fill: shapeStyle.getFill(),
					stroke: stroke,
					radius: radius,
					size: [width, width]
				};
			};

			const styleProperties = imageStyle instanceof IconStyle ? getPropertiesFromIconStyle(imageStyle) : getPropertiesFromShapeStyle(imageStyle);

			if (styleProperties.size) {
				encoded.graphicWidth = Mfp3Encoder.adjustDistance((styleProperties.size[0] * scale || 0.1), dpi);
				encoded.graphicHeight = Mfp3Encoder.adjustDistance((styleProperties.size[1] * scale || 0.1), dpi);
			}

			if (styleProperties.anchor) {
				encoded.graphicXOffset = Mfp3Encoder.adjustDistance(-styleProperties.anchor[0] * scale, dpi);
				encoded.graphicHeight = Mfp3Encoder.adjustDistance(-styleProperties.anchor[1] * scale, dpi);
			}

			if (styleProperties.imageSrc) {
				// todo: unproxify URL of imageSrc
				encoded.externalGraphic = styleProperties.imageSrc;
				encoded.fillOpacity = 1;
			}

			if (styleProperties.radius) {
				encoded.pointRadius = styleProperties.radius;
			}
		}

		if (fillStyle) {
			const color = ColorAsArray(fillStyle.getColor());
			encoded.fillColor = rgbToHex(color.slice(0, 3));
			encoded.fillOpacity = color[3];
		}

		if (strokeStyle) {
			const color = ColorAsArray(strokeStyle.getColor());
			encoded.strokeWidth = Mfp3Encoder.adjustDistance(strokeStyle.getWidth(), dpi);
			encoded.strokeColor = rgbToHex(color.slice(0, 3));
			encoded.strokeOpacity = color[3];
			encoded.strokeLinecap = strokeStyle.getLineCap() ?? 'round';
			encoded.strokeLineJoin = strokeStyle.getLineJoin() ?? 'round';

			if (strokeStyle.getLineDash()) {
				encoded.strokeDashstyle = 'dash';
			}
		}

		encoded.fillOpacity = encoded.fillOpacity ?? 0;
		encoded.strokeOpacity = encoded.strokeOpacity ?? 0;


		if (textStyle && textStyle.getText()) {
			encoded.label = encodeURIComponent(textStyle.getText());
			encoded.labelXOffset = textStyle.getOffsetX();
			encoded.labelYOffset = textStyle.getOffsetY();

			const fromOlTextAlign = (olTextAlign) => {
				switch (olTextAlign) {
					case 'left':
					case 'right':
						return olTextAlign[0];
					default:
						return 'c'; // center
				}
			};

			const fromOlTextBaseline = (olTextBaseline) => {
				switch (olTextBaseline) {
					case 'bottom':
					case 'top':
						return olTextBaseline[0];
					default:
						return 'm'; // middle
				}
			};
			encoded.labelAlign = fromOlTextAlign(textStyle.getTextAlign) + fromOlTextBaseline(textStyle.getTextBaseline);

			if (textStyle.getFill()) {
				const fillColor = ColorAsArray(textStyle.getFill().getColor());
				encoded.fontColor = rgbToHex(fillColor);
			}

			if (textStyle.getFont()) {
				const fontValues = textStyle.getFont().split(' ');
				encoded.fontFamily = fontValues[2].toUpperCase();
				encoded.fontSize = parseInt(fontValues[1]);
				encoded.fontWeight = fontValues[0];
			}
		}
		return encoded;
	}

	_encodeOverlay(overlay) {
		const element = overlay.getElement();
		const center = overlay.getPosition();

		const fromPositioning = (positioning) => {
			const defaultAlignment = 'cm';
			const verticalAndHorizontalAlignment = positioning.split('-');
			const isValid = verticalAndHorizontalAlignment && verticalAndHorizontalAlignment.length === 2;

			return isValid ? `${verticalAndHorizontalAlignment[1][0]}${verticalAndHorizontalAlignment[0][0]}` : defaultAlignment;
		};

		if (element.tagName.toLowerCase() !== MeasurementOverlay.tag) {
			console.warn('cannot encode overlay element: No rule defined', element);
			return null;
		}
		return {
			type: 'geojson',
			name: 'overlay',
			opacity: 1,
			geoJson: {
				type: 'FeatureCollection',
				features: [{
					type: 'Feature',
					properties: {},
					geometry: {
						type: 'Point',
						coordinates: [...center, 0]
					}
				}]
			},
			style: {
				version: 2,
				'*': {
					symbolizers: [{
						type: 'text',
						label: element.innerText,
						labelXOffset: element.placement.offset[0],
						labelYOffset: element.placement.offset[1],
						labelAlign: fromPositioning(element.placement.positioning),
						fontColor: '#ffffff',
						fontSize: 10,
						fontWeight: 'normal',
						fillColor: '#ff0000',
						strokeColor: '#ff0000'
					}]
				}
			}
		};

	}

	static adjustDistance(distance, dpi) {
		return distance ? distance * 90 / dpi : null;
	}
}
