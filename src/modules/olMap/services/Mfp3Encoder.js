
import Point from 'ol/geom/Point';
import { getBottomRight, getTopLeft, intersects as extentIntersects } from 'ol/extent';
import { GeoJSON as GeoJSONFormat } from 'ol/format';
import { $injector } from '../../../injection';
import { rgbToHex } from '../../../utils/colors';
import { asArray as ColorAsArray } from 'ol/color';
import { GeoResourceTypes } from '../../../domain/geoResources';
import Style from 'ol/style/Style';

import { Icon as IconStyle } from 'ol/style';
import { Feature } from 'ol';
import { MeasurementOverlay } from '../components/MeasurementOverlay';
import { Circle, LineString, MultiPolygon, Polygon } from 'ol/geom';
import LayerGroup from 'ol/layer/Group';
import { WMTS } from 'ol/source';
import { getPolygonFrom } from '../utils/olGeometryUtils';

const UnitsRatio = 39.37; //inches per meter
const PointsPerInch = 72; // PostScript points 1/72"
const PixelSizeInMeter = 0.00028; // based on https://www.adv-online.de/AdV-Produkte/Standards-und-Produktblaetter/AdV-Profile/binarywriterservlet?imgUid=36060b99-b8c4-0a41-ba3c-cdd1072e13d6&uBasVariant=11111111-1111-1111-1111-111111111111  and the calculations of a specific scaleDenominator (p.22)

/**
 * Encoder to create a MapFishPrint request-object from a OpenLayers map-instance
 * @author thiloSchlemmer
 * @interface Mfp3Encoder
 */

/**
 * Encodes the content of a ol {@see Map} to a MapFishPrint3 job request.
 * @function
 * @async
 * @name Mfp3Encoder#encode
 * @param {ol.Map} olMap the ol map
 * @param {EncodingProperties} encodingProperties
 * @returns {Object} the encoded mfp specs
 * /

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
*/

/**
 * BVV-encoder to create a MapFishPrint request-object from a OpenLayers map-instance
 * @class
 * @author thiloSchlemmer
 * @implements {Mfp3Encoder}
 */
export class BvvMfp3Encoder {

	constructor() {
		const { MapService: mapService, GeoResourceService: geoResourceService, UrlService: urlService, ShareService: shareService, MfpService: mfpService } = $injector.inject('MapService', 'GeoResourceService', 'UrlService', 'ShareService', 'MfpService');
		this._mapService = mapService;
		this._geoResourceService = geoResourceService;
		this._urlService = urlService;
		this._shareService = shareService;
		this._mfpService = mfpService;
		this._pageExtent = null;
		this._geometryEncodingFormat = new GeoJSONFormat();
		this._mapProjection = `EPSG:${this._mapService.getSrid()}`;
		this._encodingStyleId = 0;
	}

	/**
	 * Encodes the content of a OpenLayers {@see Map} to a MapFishPrint3 job request.
	 * @param {ol.Map} olMap the map with the content to encode for MapFishPrint3
	 * @param {EncodingProperties} encodingProperties the properties for this specific mfp-spec request
	 * @returns {Object} the encoded mfp specs
	 */
	async encode(olMap, encodingProperties) {
		this._initStyleId();
		this._mfpProperties = encodingProperties;
		this._mfpProjection = this._mfpProperties.targetSRID ? `EPSG:${this._mfpProperties.targetSRID}` : `EPSG:${this._mapService.getDefaultGeodeticSrid()}`;

		const validEncodingProperties = (properties) => {
			return properties.layoutId != null &&
				(properties.scale != null && properties.scale !== 0) &&
				properties.dpi != null;
		};

		if (!validEncodingProperties(this._mfpProperties)) {
			throw Error('Invalid or missing EncodingProperties');
		}

		const getDefaultMapCenter = () => {
			return new Point(olMap.getView().getCenter());
		};
		const getDefaultMapExtent = () => {
			return olMap.getView().calculateExtent(olMap.getSize());
		};

		const mfpCenter = this._mfpProperties.pageCenter && this._mfpProperties.pageCenter instanceof Point
			? this._mfpProperties.pageCenter.clone().transform(this._mapProjection, this._mfpProjection)
			: getDefaultMapCenter().clone().transform(this._mapProjection, this._mfpProjection);

		this._pageExtent = this._mfpProperties.pageExtent
			? this._mfpProperties.pageExtent
			: getDefaultMapExtent();

		const encodedLayers = olMap.getLayers().getArray()
			.filter(layer => {
				const layerExtent = layer.getExtent();
				return layerExtent ? extentIntersects(layer.getExtent(), this._pageExtent) && layer.getVisible() : layer.getVisible();
			})
			.flatMap(l => this._encode(l))
			.reduce((layerSpecs, encodedLayer) => {
				// todo: extract to method
				const { attribution, thirdPartyAttribution, ...restSpec } = encodedLayer;
				const getLabels = (attribution) => Array.isArray(attribution) ? attribution?.map(a => a.copyright.label) : [attribution?.copyright?.label];

				return {
					specs: [...layerSpecs.specs, restSpec],
					dataOwners: attribution ? [...layerSpecs.dataOwners, ...getLabels(attribution)] : [...layerSpecs.dataOwners],
					thirdPartyDataOwners: thirdPartyAttribution ? [...layerSpecs.thirdPartyDataOwners, getLabels(thirdPartyAttribution)] : [...layerSpecs.thirdPartyDataOwners]
				};
			}, { specs: [], dataOwners: [], thirdPartyDataOwners: [] });

		const encodedOverlays = this._encodeOverlays(olMap.getOverlays().getArray());
		const shortLinkUrl = await this._generateShortUrl();
		const qrCodeUrl = this._urlService.qrCode(shortLinkUrl);
		const layers = [encodedOverlays, ...encodedLayers.specs.reverse()].filter(spec => Object.hasOwn(spec, 'type'));
		return {
			layout: this._mfpProperties.layoutId,
			attributes: {
				map: {
					center: mfpCenter.getCoordinates(),
					scale: this._mfpProperties.scale,
					projection: this._mfpProjection,
					dpi: this._mfpProperties.dpi,
					rotation: this._mfpProperties.rotation,
					layers: layers
				},
				dataOwner: encodedLayers.dataOwners.length !== 0 ? Array.from(new Set(encodedLayers.dataOwners)).join(',') : '',
				thirdPartyDataOwner: encodedLayers.thirdPartyDataOwners.length !== 0 ? Array.from(new Set(encodedLayers.thirdPartyDataOwners)).join(',') : '',
				shortLink: shortLinkUrl,
				qrcodeurl: qrCodeUrl
			}
		};
	}

	_initStyleId() {
		this._encodingStyleId = 0;
	}

	_encode(layer) {

		if (layer instanceof LayerGroup) {
			return this._encodeGroup(layer);
		}

		const geoResource = this._geoResourceService.byId(layer.get('geoResourceId'));
		if (!geoResource) {
			return false;
		}
		switch (geoResource.getType()) {
			case GeoResourceTypes.VECTOR:
				return this._encodeVector(layer, geoResource);
			case GeoResourceTypes.XYZ:
			case GeoResourceTypes.WMTS:
				return this._encodeWMTS(layer, geoResource);
			case GeoResourceTypes.WMS:
				return this._encodeWMS(layer, geoResource);
			default:
				return false;
		}
	}

	_encodeGroup(groupLayer) {
		const subLayers = groupLayer.getLayers().getArray();
		return subLayers.map(l => this._encode(l));
	}

	_encodeWMTS(olLayer, wmtsGeoResource) {

		const getSubstitutionLayer = (layer, geoResource) => {
			const { LayerService: layerService } = $injector.inject('LayerService');
			const { grSubstitutions } = this._mfpService.getCapabilities();

			const substitutionGeoResource = Object.hasOwn(grSubstitutions, geoResource.id) ? this._geoResourceService.byId(grSubstitutions[geoResource.id]) : null;

			if (substitutionGeoResource) {
				const substitutionLayerId = layer.id ?? substitutionGeoResource.id;
				const substitutionLayer = layerService.toOlLayer(`${substitutionLayerId}_substitution`, substitutionGeoResource, null);
				substitutionLayer?.setOpacity(layer.getOpacity());
				return substitutionLayer;
			}

			return null;
		};

		const fromWmtsSource = (wmtsSource) => {
			return {
				tileGrid: wmtsSource.getTileGrid(),
				layer: wmtsSource.getLayer(),
				baseURL: wmtsSource.getUrls()[0],
				requestEncoding: wmtsSource.getRequestEncoding()
			};
		};

		const fromXyzSource = (xyzSource, layer) => {
			const xyzToWmtsVariables = (url) => {
				return url.replace('{z}', '{TileMatrix}').replace('{x}', '{TileCol}').replace('{y}', '{TileRow}');
			};
			return {
				tileGrid: xyzSource.getTileGrid(),
				layer: layer.get('geoResourceId'),
				baseURL: xyzToWmtsVariables(xyzSource.getUrls()[0]),
				requestEncoding: 'REST'
			};
		};

		const createWmtsSpecs = (wmtsLayer) => {
			const tileMatrixSet = this._mfpProjection;
			const source = wmtsLayer.getSource();
			const { tileGrid, layer, baseURL, requestEncoding } = source instanceof WMTS ? fromWmtsSource(source) : fromXyzSource(source, wmtsLayer);
			return {
				opacity: wmtsLayer.getOpacity(),
				type: 'wmts',
				baseURL: baseURL,
				layer: layer,
				requestEncoding: requestEncoding,
				matrices: BvvMfp3Encoder.buildMatrixSets(tileGrid),
				matrixSet: tileMatrixSet,
				attribution: wmtsGeoResource.importedByUser ? null : wmtsGeoResource.attribution,
				thirdPartyAttribution: wmtsGeoResource.importedByUser ? wmtsGeoResource.attribution : null
			};
		};

		const createEmptySpecsAndWarn = () => {
			console.warn(`Missing substitution for GeoResource '${wmtsGeoResource.id}'.`);
			return [];
		};

		const substitutionLayer = getSubstitutionLayer(olLayer, wmtsGeoResource);
		return substitutionLayer ? createWmtsSpecs(substitutionLayer) : createEmptySpecsAndWarn();

	}

	_encodeWMS(olLayer, wmsGeoResource) {
		// no handling for target srid, it is assumed that the wmsGeoResource also supports the target srid
		const source = olLayer.getSource();
		const params = source.getParams();
		const layers = params.LAYERS?.split(',') || [];
		const styles = (params.STYLES != null) ?
			params.STYLES.split(',') :
			new Array(layers.length).join(',').split(',');

		const url = source.getUrl && source.getUrl();
		const defaultCustomParams = { transparent: true }; // similar to OpenLayers TRANSPARENT-Parameter is set by default
		return {
			type: 'wms',
			baseURL: url,
			imageFormat: wmsGeoResource.format,
			layers: layers,
			name: wmsGeoResource.id,
			opacity: olLayer.getOpacity(),
			styles: styles,
			customParams: defaultCustomParams,
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

		const startResult = { features: [] };
		// todo: find a better implementation then this mix of feature aggregation (reducer) and style aggregation (cache)
		const aggregateResults = (encoded, feature) => {
			const result = this._encodeFeature(feature, olVectorLayer, styleCache);
			return result ? {
				features: [...encoded.features, ...result.features]
			} : encoded;
		};

		// we provide a cache for ol styles which are applied to multiple features, to reduce the
		// amount of created style-specs
		const styleCache = new Map();
		const mfpPageExtent = getPolygonFrom(this._pageExtent).transform(this._mapProjection, this._mfpProjection).getExtent();

		const encodingResults = featuresSortedByGeometryType
			.map(f => transformForMfp(f))
			.filter(f => f.getGeometry().intersectsExtent(mfpPageExtent))
			.reduce(aggregateResults, startResult);

		const styleObjectFrom = (styles) => {
			const styleObjectV2 = {
				version: '2'
			};

			const asV2 = (styles) => {
				styles.forEach(style => {
					const { id, symbolizers } = style;
					styleObjectV2[`[_gx_style = ${id}]`] = {
						symbolizers: symbolizers
					};
				});
				return styleObjectV2;
			};
			return asV2(styles);
		};

		return encodingResults.features.length === 0 ? false : {
			type: 'geojson',
			geoJson: { features: encodingResults.features, type: 'FeatureCollection' },
			name: olVectorLayer.get('id'),
			style: styleObjectFrom(Array.from(styleCache.values())),
			opacity: olVectorLayer.getOpacity(),
			attribution: geoResource.importedByUser ? null : geoResource.attribution,
			thirdPartyAttribution: geoResource.importedByUser ? geoResource.attribution : null
		};
	}

	_encodeFeature(olFeature, olLayer, styleCache, presetStyles = []) {
		const defaultResult = { features: [] };
		const resolution = this._mfpProperties.scale / UnitsRatio / PointsPerInch;

		const getOlStyles = (feature, layer, resolution) => {
			const featureStyles = feature.getStyle();
			if (featureStyles != null && typeof (featureStyles) === 'function') {
				// todo: currently only the fallback-style for measurement-features is encodable
				// and the fallbackStyle is forced by calling the styleFunction with resolution = null
				const getExplicitFallbackStyleForMeasurement = (f) => featureStyles(f, null);
				const isMeasurementFeature = feature.get('measurement') != null;
				return isMeasurementFeature ? getExplicitFallbackStyleForMeasurement(feature) : featureStyles(feature, resolution);
			}

			if (featureStyles != null && featureStyles.length > 0) {
				return featureStyles;
			}

			const layerStyleFunction = layer.getStyleFunction();
			return layerStyleFunction ? layerStyleFunction(feature, resolution) : [];
		};

		const getEncodableOlStyle = (styles, isPreset) => {
			const getFirstNonAdvancedStyle = (allStyles) => {
				return allStyles.find(s => !(s.getGeometry && typeof (s.getGeometry()) === 'function')) ?? null;
			};

			if (styles && styles.length > 0) {
				return isPreset ? styles[0] : getFirstNonAdvancedStyle(styles);
			}
			return null;
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
				return geometry instanceof Polygon || geometry instanceof MultiPolygon || geometry instanceof LineString || geometry instanceof Point;
			};
			return isEncodable() ? olFeature : toEncodableFeature();
		};

		const initEncodedStyle = () => {
			return { id: this._encodingStyleId++ };
		};

		const olStyles = presetStyles.length > 0 ? presetStyles : getOlStyles(olFeature, olLayer, resolution);

		// if multiple styles available, we look for the first non-advanced style
		const olStyleToEncode = Array.isArray(olStyles) ? getEncodableOlStyle(olStyles, presetStyles.length > 0) : olStyles;

		if (!olStyleToEncode || !(olStyleToEncode instanceof Style)) {
			console.warn('cannot style feature', olFeature);
			return null;
		}

		const olFeatureToEncode = getEncodableOlFeature(olFeature);
		const addOrUpdateEncodedStyle = (olStyle) => {
			const addEncodedStyle = () => {
				const encodedStyle = { ...initEncodedStyle(), symbolizers: this._encodeStyle(olStyleToEncode, olFeatureToEncode.getGeometry(), this._mfpProperties.dpi) };
				encodedStyle.symbolizers.forEach(symbolizer => {
					if (symbolizer.fillOpacity) {
						symbolizer.fillOpacity *= olLayer.getOpacity();
					}

					if (symbolizer.strokeOpacity) {
						symbolizer.strokeOpacity *= olLayer.getOpacity();
					}
				});

				styleCache.set(olStyle, encodedStyle);
				return encodedStyle.id;
			};
			const updateEncodedStyle = () => {
				const { id, symbolizers } = styleCache.get(olStyle);
				const encodedGeometryType = this._encodeGeometryType(olFeatureToEncode.getGeometry().getType());
				if (symbolizers.every(s => s.type !== encodedGeometryType)) {
					const encodedStyle = { id: id, symbolizers: [...symbolizers, ...this._encodeStyle(olStyleToEncode, olFeatureToEncode.getGeometry(), this._mfpProperties.dpi)] };
					styleCache.set(olStyle, encodedStyle);
				}

				return id;
			};

			return styleCache.has(olStyle) ? updateEncodedStyle() : addEncodedStyle();
		};

		const encodedStyleId = addOrUpdateEncodedStyle(olStyleToEncode);

		// handle advanced styles
		const advancedStyleFeatures = Array.isArray(olStyles) ? olStyles.reduce((styleFeatures, style) => {
			const isGeometryFunction = style.getGeometry && typeof (style.getGeometry()) === 'function';

			if (isGeometryFunction) {
				const geometry = style.getGeometry()(olFeatureToEncode);
				if (geometry) {
					const result = this._encodeFeature(new Feature(geometry), olLayer, styleCache, [style]);
					return result ? { features: [...styleFeatures.features, ...result.features] } : defaultResult;
				}
			}
			return styleFeatures;
		}, defaultResult) : { features: [] };

		const encodedFeature = this._geometryEncodingFormat.writeFeatureObject(olFeatureToEncode);
		encodedFeature.properties = { _gx_style: encodedStyleId };
		return {
			features: [encodedFeature, ...advancedStyleFeatures.features]
		};
	}

	_encodeGeometryType(olGeometryType) {
		const defaultEncoding = (geometryType) => geometryType.toLowerCase();
		const specialEncodings = { LineString: () => 'line', MultiPolygon: () => 'polygon' };

		return Object.hasOwn(specialEncodings, olGeometryType) ? specialEncodings[olGeometryType]() : defaultEncoding(olGeometryType);
	}

	_encodeStyle(olStyle, olGeometry, dpi) {
		const fillStyle = olStyle.getFill();
		const strokeStyle = olStyle.getStroke();
		const textStyle = olStyle.getText();
		const imageStyle = olStyle.getImage();
		const geometryType = olGeometry.getType();
		const encoded = { type: this._encodeGeometryType(geometryType), zIndex: olStyle.getZIndex() ? olStyle.getZIndex() : 0 };


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
				const width = stroke ? BvvMfp3Encoder.adjustDistance(2 * radius, dpi) + BvvMfp3Encoder.adjustDistance(stroke.getWidth() + 1, dpi) : BvvMfp3Encoder.adjustDistance(2 * radius, dpi);
				return {
					fill: shapeStyle.getFill(),
					stroke: stroke,
					radius: radius,
					size: [width, width]
				};
			};

			const styleProperties = imageStyle instanceof IconStyle ? getPropertiesFromIconStyle(imageStyle) : getPropertiesFromShapeStyle(imageStyle);
			if (styleProperties.size) {
				encoded.graphicWidth = BvvMfp3Encoder.adjustDistance((styleProperties.size[0] * scale || 0.1), dpi);
				encoded.graphicHeight = BvvMfp3Encoder.adjustDistance((styleProperties.size[1] * scale || 0.1), dpi);
				const hexColor = styleProperties.fill?.getColor();
				if (hexColor) {
					const color = ColorAsArray(hexColor);
					encoded.fillColor = rgbToHex(color.slice(0, 3));
					encoded.fillOpacity = color[3] ?? 1;
				}
			}

			if (styleProperties.anchor) {
				encoded.graphicXOffset = BvvMfp3Encoder.adjustDistance(-styleProperties.anchor[0] * scale, dpi);
				encoded.graphicYOffset = BvvMfp3Encoder.adjustDistance(-styleProperties.anchor[1] * scale, dpi);
			}

			if (styleProperties.imageSrc) {
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
			encoded.fillOpacity = color[3] ?? 1;
		}

		if (strokeStyle) {
			const color = ColorAsArray(strokeStyle.getColor());
			encoded.strokeWidth = BvvMfp3Encoder.adjustDistance(strokeStyle.getWidth(), dpi);
			encoded.strokeColor = rgbToHex(color.slice(0, 3));
			encoded.strokeOpacity = color[3] ?? 1;
			encoded.strokeLinecap = strokeStyle.getLineCap() ?? 'round';
			encoded.strokeLineJoin = strokeStyle.getLineJoin() ?? 'round';

			if (strokeStyle.getLineDash()) {
				encoded.strokeDashstyle = 'dash';
			}
		}

		encoded.fillOpacity = encoded.fillOpacity ?? 0;
		encoded.strokeOpacity = encoded.strokeOpacity ?? 0;


		if (textStyle && textStyle.getText()) {
			encoded.label = textStyle.getText();
			// additional X- or Y-Offset is ommitted, text is currently center aligned.
			// An Y-offset of -5 is only needed to display the text in ol map vertical centered.
			// encoded.labelXOffset = textStyle.getOffsetX();
			// encoded.labelYOffset = textStyle.getOffsetY();
			encoded.type = 'text';

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

			if (this._mfpProperties.rotation) {
				encoded.labelRotation = (360 - this._mfpProperties.rotation) % 360;
			}
		}

		const addPointSymbolizer = (labelSymbolizer) => {
			// eslint-disable-next-line no-unused-vars
			const { label, labelXOffset, labelYOffset, labelAlign, fontFamily, fontSize, fontWeight, ...rest } = labelSymbolizer;
			const pointSymbolizer = { ...rest, type: 'point' };

			return [pointSymbolizer, labelSymbolizer];
		};

		return encoded.type === 'text' && encoded.externalGraphic ? addPointSymbolizer(encoded) : [encoded];
	}

	_encodeOverlays(overlays) {
		const anchorPointFromPositioning = (positioning) => {
			const AnchorPointPositions = { top: 0, middle: 0.5, bottom: 1, left: 0, center: 0.5, right: 1 };
			const defaultAnchorPoint = { x: 0.5, y: 0.5 };
			const verticalAndHorizontalAlignment = positioning.split('-');
			const isValid = verticalAndHorizontalAlignment && verticalAndHorizontalAlignment.length === 2;
			const anchorPoint = isValid ? { x: AnchorPointPositions[verticalAndHorizontalAlignment[1]], y: AnchorPointPositions[verticalAndHorizontalAlignment[0]] } : defaultAnchorPoint;
			return anchorPoint;
		};

		const toFeatureWithOverlayProperties = (overlay) => {
			const element = overlay.getElement();

			if (element.tagName.toLowerCase() !== MeasurementOverlay.tag) {
				console.warn('cannot encode overlay element: No rule defined', element);
				return null;
			}

			const center = overlay.getPosition();
			const mfpCenter = new Point(center).transform(this._mapProjection, this._mfpProjection).getCoordinates();

			const offsetX = Math.round(element.placement.offset[0]);
			const offsetY = -Math.round(element.placement.offset[1]);
			const labelAnchorPoint = anchorPointFromPositioning(element.placement.positioning);
			return {
				type: 'Feature',
				properties: {
					type: element.type,
					label: element.innerText,
					labelXOffset: offsetX,
					labelYOffset: offsetY,
					labelAnchorPointX: labelAnchorPoint.x,
					labelAnchorPointY: labelAnchorPoint.y
				},
				geometry: {
					type: 'Point',
					coordinates: [...mfpCenter, 0]
				}
			};
		};
		const overlayFeatures = overlays.map(o => toFeatureWithOverlayProperties(o)).filter(f => f !== null);

		return overlayFeatures.length === 0 ? [] : {
			type: 'geojson',
			name: 'overlay',
			opacity: 1,
			geoJson: {
				type: 'FeatureCollection',
				features: overlayFeatures
			},
			style: {
				version: 2,
				conflictResolution: false,
				'[type=\'distance\']': {
					symbolizers: [
						{
							type: 'point',
							fillColor: '#ff0000',
							fillOpacity: 1,
							strokeOpacity: 0,
							graphicName: 'circle',
							graphicOpacity: 0.4,
							pointRadius: 3
						}, {
							type: 'text',
							label: '[label]',
							labelXOffset: '[labelXOffset]',
							labelYOffset: '[labelYOffset]',
							labelAnchorPointX: '[labelAnchorPointX]',
							labelAnchorPointY: '[labelAnchorPointY]',
							fontColor: '#ffffff',
							fontSize: 10,
							fontFamily: 'sans-serif',
							fontWeight: 'bold',
							haloColor: '#ff0000',
							haloOpacity: 1,
							haloRadius: 1,
							strokeColor: '#ff0000'
						}]
				},
				'[type=\'distance-partition\']': {
					symbolizers: [
						{
							type: 'point',
							fillColor: '#ff0000',
							fillOpacity: 1,
							strokeOpacity: 1,
							strokeWidth: 1.5,
							strokeColor: '#ffffff',
							graphicName: 'circle',
							graphicOpacity: 0.4,
							pointRadius: 2
						}, {
							type: 'text',
							label: '[label]',
							labelXOffset: '[labelXOffset]',
							labelYOffset: '[labelYOffset]',
							labelAnchorPointX: '[labelAnchorPointX]',
							labelAnchorPointY: '[labelAnchorPointY]',
							fontColor: '#000000',
							fontSize: 8,
							fontFamily: 'sans-serif',
							fontWeight: 'normal',
							haloColor: '#ffffff',
							haloOpacity: 1,
							haloRadius: 2,
							strokeColor: '#ff0000'
						}]
				},
				'[type=\'area\']': {
					symbolizers: [
						{
							type: 'text',
							label: '[label]',
							labelAlign: 'cm',
							fontColor: '#ffffff',
							fontSize: 10,
							fontFamily: 'sans-serif',
							fontWeight: 'bold',
							haloColor: '#ff0000',
							haloOpacity: 1,
							haloRadius: 1,
							strokeColor: '#ff0000'
						}]
				}
			}
		};
	}

	static adjustDistance(distance, dpi) {
		return distance != null ? distance * 90 / dpi : null;
	}

	/**
	 *@private
	 */
	async _generateShortUrl() {
		const url = this._shareService.encodeState();
		try {
			return await this._urlService.shorten(url);
		}
		catch (e) {
			console.warn('Could not shorten url: ' + e);
			return url;
		}
	}

	static buildMatrixSets(tileGrid) {
		const resolutions = tileGrid.getResolutions();

		const resolutionToScaleDenominator = (resolution) => {
			return resolution / PixelSizeInMeter;
		};

		const getMatrixSize = (tileGrid, z) => {
			const topLeftTile = tileGrid.getTileCoordForCoordAndZ(getTopLeft(tileGrid.getExtent()), z);
			const bottomRightTile = tileGrid.getTileCoordForCoordAndZ(getBottomRight(tileGrid.getExtent()), z);

			const tileWidth = Math.abs(bottomRightTile[1] - topLeftTile[1]);
			const tileHeight = Math.abs(topLeftTile[2] - bottomRightTile[2]);
			return [tileWidth, tileHeight];
		};

		return resolutions.map((resolution, index) => {
			const z = tileGrid.getZForResolution(resolution);
			const tileSize = tileGrid.getTileSize(z);

			return {
				identifier: index.toString(),
				scaleDenominator: resolutionToScaleDenominator(resolution),
				topLeftCorner: tileGrid.getOrigin(z),
				tileSize: [tileSize, tileSize],
				matrixSize: getMatrixSize(tileGrid, z)
			};
		});
	}
}
