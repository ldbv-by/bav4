
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
import { Circle, LineString, Polygon } from 'ol/geom';

const UnitsRatio = 39.37; //inches per meter
const PointsPerInch = 72; // PostScript points 1/72"
/**
 * A Container-Object for properties related to a mfp encoding
 * @typedef {Object} EncodingProperties
 * @param {string} layoutId the id of a configured mfp template
 * @param {Number} scale the scale of the current map for the current job request
 * @param {Number} dpi the dpi for the current job request, must be contained in the capabilities of the mfp template
 * @param {Number} [rotation] the rotation for the current job request
 * @param {Point} [pageCenter] the center of the map to export; Defaults to the center of map.getView()
 * @param {Extent} [pageExtent] the extent of the map to export; Defaults to the calculated extent of map.getView()
 * @param {Number} [targetSRID] the srid of the map to export; Defaults to the default geodetic srid
 * @param {Number} [styleVersion]
*/

/***
 * Encoder to create a MapFishPrint request-object from a OpenLayers map-instance
 *
 * @class
 * @author thiloSchlemmer
 */
export class Mfp3Encoder {
	/*
	TODO:
	- should have a strategy to receive or transform WmtsGeoResources (XYZSource) for target srid
	- should unproxify URL to external Resources (e.g. a image in a icon style)
	- should support Mapfish JSON Style Version 2
	- check whether filter for resolution is needed or not
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
	 * Encodes the content of a OpenLayers {@see Map} to a MapFishPrint3 job request.
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


		const encodedLayers = olMap.getLayers().getArray()
			.filter(layer => {
				const layerExtent = layer.getExtent();

				return layerExtent ? extentIntersects(layer.getExtent(), this._pageExtent) : true;
			})
			.flatMap(l => this._encode(l))
			.reduce((layerSpecs, encodedLayer) => {
				// todo: extract to method
				const { attribution, thirdPartyAttribution, ...restSpec } = encodedLayer;
				if (attribution || thirdPartyAttribution) {
					const getLabels = (attribution) => Array.isArray(attribution?.copyright) ? attribution?.copyright.map(c => c.label) : [attribution?.copyright.label];

					return {
						specs: [...layerSpecs.specs, restSpec],
						dataOwners: attribution ? [...layerSpecs.dataOwners, ...getLabels(attribution)] : [...layerSpecs.dataOwners],
						thirdPartyDataOwners: thirdPartyAttribution ? [...layerSpecs.thirdPartyDataOwners, getLabels(thirdPartyAttribution)] : [...layerSpecs.thirdPartyDataOwners]
					};
				}
				return { specs: [], dataOwners: [], thirdPartyDataOwners: [] };

			}, { specs: [], dataOwners: [], thirdPartyDataOwners: [] });

		const encodedOverlays = olMap.getOverlays().getArray().map(overlay => this._encodeOverlay(overlay));
		return {
			layout: this._mfpProperties.layoutId,
			attributes: {
				map: {
					center: mfpCenter,
					scale: this._mfpProperties.scale,
					projection: this._mfpProjection,
					dpi: this._mfpProperties.dpi,
					rotation: this._mfpProperties.rotation,
					layers: [...encodedLayers.specs, ...encodedOverlays],
					dataOwner: encodedLayers.dataOwners.length !== 0 ? encodedLayers.dataOwners.join(',') : null,
					thirdPartyDataOwner: encodedLayers.thirdPartyDataOwners.length !== 0 ? encodedLayers.thirdPartyDataOwners.join(',') : null
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
			return [];
		}
		switch (geoResource.getType()) {
			case GeoResourceTypes.AGGREGATE:
				return this._encodeGroup(layer);
			case GeoResourceTypes.VECTOR:
				return this._encodeVector(layer, geoResource);
			case GeoResourceTypes.WMTS:
				return this._encodeWMTS(layer, geoResource);
			case GeoResourceTypes.WMS:
				return this._encodeWMS(layer, geoResource);
			default:
				return [];
		}
	}

	_encodeGroup(groupLayer) {
		const subLayers = groupLayer.getLayers().getArray();
		return subLayers.map(l => this._encode(l));
	}

	_encodeWMTS(olLayer, geoResource) {
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
			tileSize: [tileGrid.getTileSize(0), tileGrid.getTileSize(0)],
			attribution: geoResource.importedByUser ? null : geoResource.attribution,
			thirdPartyAttribution: geoResource.importedByUser ? geoResource.attribution : null
		};
	}

	_encodeWMS(olLayer, wmsGeoResource) {
		// no handling for target srid, it is assumed that the wmsGeoResource also supports the target srid
		const source = olLayer.getSource();
		const params = source.getParams();
		const layers = params.LAYERS?.split(',') || [];
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
			styles: styles,
			attribution: wmsGeoResource.importedByUser ? null : wmsGeoResource.attribution,
			thirdPartyAttribution: wmsGeoResource.importedByUser ? wmsGeoResource.attribution : null
		};
	}

	_encodeVector(olVectorLayer, geoResource) {
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

		const transformForMfp = (olFeature) => {
			const mfpFeature = olFeature.clone();
			mfpFeature.getGeometry().transform(this._mapProjection, this._mfpProjection);
			return mfpFeature;
		};

		const encodingResults = featuresSortedByGeometryType.map(f => transformForMfp(f)).reduce((encoded, feature) => {
			const result = this._encodeFeature(feature, olVectorLayer);
			return result ? {
				features: [...encoded.features, ...result.features],
				styles: [...encoded.styles, ...result.styles]
			} : encoded;
		}, { features: [], styles: [] });

		const styleObjectFrom = (styles) => {
			const styleObjectV2 = {
				version: '2'
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
			return asV2(styles);
		};
		const styleVersion = this._mfpProperties.styleVersion ? this._mfpProperties.styleVersion : 1;
		return {
			type: 'geojson',
			geoJson: { features: encodingResults.features, type: 'FeatureCollection' },
			name: olVectorLayer.get('id'),
			style: styleObjectFrom(encodingResults.styles, styleVersion),
			opacity: olVectorLayer.getOpacity(),
			attribution: geoResource.importedByUser ? null : geoResource.attribution,
			thirdPartyAttribution: geoResource.importedByUser ? geoResource.attribution : null
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

		const getEncodableOlFeature = (olFeature) => {
			const toEncodableFeature = () => {
				const geometry = olFeature.getGeometry();
				if (geometry instanceof Circle) {
					// https://github.com/openlayers/openlayers/blob/master/lib/OpenLayers/Geometry/Polygon.js#L240
					const origin = geometry.getCenter();
					const radius = geometry.getRadius();
					const sides = 40;
					const angle = Math.PI * ((1 / sides) - (1 / 2));
					const points = [];
					for (let i = 0; i < sides; ++i) {
						const rotatedAngle = angle + (i * 2 * Math.PI / sides);
						const x = origin[0] + (radius * Math.cos(rotatedAngle));
						const y = origin[1] + (radius * Math.sin(rotatedAngle));
						points.push([x, y]);
					}
					points.push(points[0]);// Close the polygon
					return new Feature(new Polygon([points]));
				}
			};

			const isEncodable = () => {
				const geometry = olFeature.getGeometry();
				return geometry instanceof Polygon || geometry instanceof LineString || geometry instanceof Point;
			};
			return isEncodable() ? olFeature : toEncodableFeature();
		};



		const initEncodedStyle = () => {
			return { id: this._encodingStyleId++ };
		};

		const olStyles = presetStyles.length > 0 ? presetStyles : getOlStyles(olFeature, olLayer, resolution);
		const olStyleToEncode = getEncodableOlStyle(olStyles);

		if (!olStyleToEncode || !(olStyleToEncode instanceof Style)) {
			return null;
		}

		const olFeatureToEncode = getEncodableOlFeature(olFeature);

		const encodedStyle = { ...initEncodedStyle(), ...this._encodeStyle(olStyleToEncode, olFeatureToEncode.getGeometry(), this._mfpProperties.dpi) };
		if (encodedStyle.fillOpacity) {
			encodedStyle.fillOpacity *= olLayer.getOpacity();
		}

		if (encodedStyle.strokeOpacity) {
			encodedStyle.strokeOpacity *= olLayer.getOpacity();
		}


		// handle advanced styles
		const advancedStyleFeatures = olStyles.reduce((styleFeatures, style) => {
			const isGeometryFunction = style.getGeometry && typeof (style.getGeometry()) === 'function';
			const isRenderFunction = style.getRenderer && typeof (style.getRenderer()) === 'function';
			if (isGeometryFunction) {
				const geometry = style.getGeometry()(olFeatureToEncode);
				if (geometry) {
					const result = this._encodeFeature(new Feature(geometry), olLayer, [style]);
					return result ? { features: [...styleFeatures.features, ...result.features], styles: [...styleFeatures.styles, ...result.styles] } : defaultResult;
				}
				return styleFeatures;
			}
			if (isRenderFunction) {
				const renderResult = defaultResult;
				const state = {
					geometry: olFeature.getGeometry(),
					resolution: resolution,
					pixelRatio: 1,
					customContextRenderFunction: (geometry, fill, stroke) => {
						const style = new Style({ fill: fill, stroke: stroke });
						const result = this._encodeFeature(new Feature(geometry), olLayer, [style]);
						renderResult.features = [...renderResult.features, ...result.features];
						renderResult.styles = [...renderResult.styles, ...result.styles];
					}
				};
				const renderFunction = style.getRenderer();
				try {
					renderFunction(olFeature.getGeometry().getCoordinates(), state);
				}
				catch (error) {
					console.warn('Style renderFunction needs full canvas context');
				}
				return { features: [...styleFeatures.features, ...renderResult.features], styles: [...styleFeatures.styles, ...renderResult.styles] };
			}
			return styleFeatures;
		}, defaultResult);

		const encodedFeature = this._geometryEncodingFormat.writeFeatureObject(olFeatureToEncode);
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
			encoded.labelAlign = fromOlTextAlign(textStyle.getTextAlign()) + fromOlTextBaseline(textStyle.getTextBaseline());

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
		const mfpCenter = new Point(center).transform(this._mapProjection, this._mfpProjection).getCoordinates();

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
						coordinates: [...mfpCenter, 0]
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
