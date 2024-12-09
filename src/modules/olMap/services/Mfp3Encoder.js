/**
 * @module modules/olMap/services/Mfp3Encoder
 */
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
import { Circle, LineString, MultiLineString, MultiPoint, MultiPolygon, Polygon } from 'ol/geom';
import LayerGroup from 'ol/layer/Group';
import { WMTS } from 'ol/source';
import { getPolygonFrom } from '../utils/olGeometryUtils';
import { getUniqueCopyrights } from '../../../utils/attributionUtils';
import { BaOverlay, OVERLAY_STYLE_CLASS } from '../components/BaOverlay';
import { findAllBySelector } from '../../../utils/markup';
import { setQueryParams } from '../../../utils/urlUtils';
import { QueryParameters } from '../../../domain/queryParameters';

const UnitsRatio = 39.37; //inches per meter
const PointsPerInch = 72; // PostScript points 1/72"
const PixelSizeInMeter = 0.00028; // based on https://www.adv-online.de/AdV-Produkte/Standards-und-Produktblaetter/AdV-Profile/binarywriterservlet?imgUid=36060b99-b8c4-0a41-ba3c-cdd1072e13d6&uBasVariant=11111111-1111-1111-1111-111111111111  and the calculations of a specific scaleDenominator (p.22)

/**
 * @readonly
 * @enum {String}
 */
export const MFP_ENCODING_ERROR_TYPE = Object.freeze({
	MISSING_GEORESOURCE: 'missing_georesource',
	NOT_EXPORTABLE: 'not_exportable'
});

/**
 * Encoder to create a MapFishPrint request-object from a OpenLayers map-instance
 * @author thiloSchlemmer
 * @interface Mfp3Encoder
 */

/**
 * A Container-Object for the results of a encoding operation 
 * @typedef {Object} EncodingError
 * @param {String} label the id or the geoResource label of the layer where encoding failed 
 * @param {String} type the error type
 * /

/**
 * A Container-Object for the results of a encoding operation 
 * @typedef {Object} EncodingResult
 * @param {Object} specs the encoded map as a mfp spec
 * @param {Array<EncodingError>} errors the collected errors of the encoding operation 
*/

/**
 * Encodes the content of a ol {@see Map} to a MapFishPrint3 job request.
 * @function
 * @async
 * @name Mfp3Encoder#encode
 * @param {ol.Map} olMap the ol map
 * @param {EncodingProperties} encodingProperties
 * @returns {EncodingResult} the result of the encoding operation
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
		const {
			MapService: mapService,
			GeoResourceService: geoResourceService,
			UrlService: urlService,
			ShareService: shareService,
			MfpService: mfpService
		} = $injector.inject('MapService', 'GeoResourceService', 'UrlService', 'ShareService', 'MfpService');
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
		this._mfpProjection = this._mfpProperties.targetSRID
			? `EPSG:${this._mfpProperties.targetSRID}`
			: `EPSG:${this._mapService.getLocalProjectedSrid()}`;

		const validEncodingProperties = (properties) => {
			return properties.layoutId != null && properties.scale != null && properties.scale !== 0 && properties.dpi != null;
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

		const mfpCenter =
			this._mfpProperties.pageCenter && this._mfpProperties.pageCenter instanceof Point
				? this._mfpProperties.pageCenter.clone().transform(this._mapProjection, this._mfpProjection)
				: getDefaultMapCenter().clone().transform(this._mapProjection, this._mfpProjection);

		this._pageExtent = this._mfpProperties.pageExtent ? this._mfpProperties.pageExtent : getDefaultMapExtent();
		const byZIndex = (a, b) => a.getZIndex() - b.getZIndex();
		const encodableLayers = olMap
			.getLayers()
			.getArray()
			.sort(byZIndex)
			.filter((layer) => {
				const layerExtent = layer.getExtent();
				return layerExtent ? extentIntersects(layer.getExtent(), this._pageExtent) && layer.getVisible() : layer.getVisible();
			});

		const errors = [];
		const collectErrors = (label, errorType) => {
			errors.push({ label: label, type: errorType });
		};

		const encodedLayers = encodableLayers.flatMap((l) => this._encode(l, collectErrors));
		const copyRights = this._getCopyrights(olMap, encodableLayers);
		const encodedOverlays = this._encodeOverlays(olMap.getOverlays().getArray());
		const encodedGridLayer = this._mfpProperties.showGrid ? this._encodeGridLayer(this._mfpProperties.scale) : {};
		const shortLinkUrl = await this._generateShortUrl();
		const qrCodeUrl = this._generateQrCode(shortLinkUrl);
		const layers = [encodedGridLayer, encodedOverlays, ...encodedLayers.reverse()].filter((spec) => Object.hasOwn(spec, 'type'));

		return {
			specs: {
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
					dataOwner: Array.from(new Set(copyRights.map((c) => c.label))).join(','),
					shortLink: shortLinkUrl,
					qrcodeurl: qrCodeUrl
				}
			},
			errors: errors
		};
	}

	_initStyleId() {
		this._encodingStyleId = 0;
	}

	_getCopyrights(map, encodableLayers) {
		const resolveGroupLayers = (layers) => layers.flatMap((layer) => (layer instanceof LayerGroup ? layer.getLayers().getArray() : layer));
		const useSubstitutionOptional = (geoResource) => {
			if (!geoResource) {
				return geoResource;
			}
			const { grSubstitutions } = this._mfpService.getCapabilities();
			return Object.hasOwn(grSubstitutions, geoResource.id) ? this._geoResourceService.byId(grSubstitutions[geoResource.id]) : geoResource;
		};

		const getZoomLevel = (map) => {
			// HINT: The zoom level depending attributions for the bvv specific substitution geoResources(UTM) are already mapped to the
			// corresponding smerc zoom level. We just have to request the zoom level from the olMap.
			// There is no need to lookup in the AdvWmtsTileGrid resolutions.
			const pageResolution = this._mfpProperties.scale / UnitsRatio / PointsPerInch;

			return map.getView().getZoomForResolution(pageResolution);
		};

		const geoResources = resolveGroupLayers(encodableLayers).flatMap((l) =>
			useSubstitutionOptional(this._geoResourceService.byId(l.get('geoResourceId')))
		);

		return getUniqueCopyrights(geoResources, getZoomLevel(map));
	}

	_getSubstitutionLayerOptional(layer) {
		const { LayerService: layerService } = $injector.inject('LayerService');
		const { grSubstitutions } = this._mfpService.getCapabilities();
		const geoResource = this._geoResourceService.byId(layer.get('geoResourceId'));
		const createSubstitutionLayer = (substitutionGeoResource, originLayer) => {
			const substitutionLayerId = originLayer.id ?? substitutionGeoResource.id;
			const substitutionLayer = layerService.toOlLayer(`${substitutionLayerId}_substitution`, substitutionGeoResource, null);
			substitutionLayer?.setOpacity(originLayer.getOpacity());
			return substitutionLayer;
		};
		if (geoResource) {
			const substitutionGeoResource = Object.hasOwn(grSubstitutions, geoResource.id)
				? this._geoResourceService.byId(grSubstitutions[geoResource.id])
				: null;
			return substitutionGeoResource ? createSubstitutionLayer(substitutionGeoResource, layer) : layer;
		}

		return layer;
	}

	_encode(layer, encodingErrorCallback, groupOpacity = 1) {
		if (layer instanceof LayerGroup) {
			return this._encodeGroup(layer, encodingErrorCallback);
		}

		/** Some layers must be replaced by a substitution for technical reasons of the related geoResource type:
		 * - VectorTiles are currently not supported by MFP but can be replaced by a WMTS substitution
		 * - WMTS/XYZ layers are defined for a specific projection. If the application projection and the print projection differs, the layer must be replaced.
		 */
		const encodableLayer = this._getSubstitutionLayerOptional(layer);
		const geoResource = this._geoResourceService.byId(encodableLayer.get('geoResourceId'));

		if (!geoResource) {
			encodingErrorCallback(`[${layer.get('id')}]`, MFP_ENCODING_ERROR_TYPE.MISSING_GEORESOURCE);
			return false;
		}

		if (!geoResource.exportable) {
			encodingErrorCallback(geoResource.label, MFP_ENCODING_ERROR_TYPE.NOT_EXPORTABLE);
			return false;
		}

		switch (geoResource.getType()) {
			case GeoResourceTypes.VECTOR:
				return this._encodeVector(encodableLayer, groupOpacity);
			case GeoResourceTypes.XYZ:
				return this._encodeWMTS(encodableLayer, groupOpacity);
			case GeoResourceTypes.WMS:
				return this._encodeWMS(encodableLayer, geoResource, groupOpacity);
			case GeoResourceTypes.VT:
				console.warn(`VectorTiles are currently not supported by MFP. Missing substitution for GeoResource '${geoResource.id}'.`);
				return [];
			default:
				return false;
		}
	}

	_encodeGroup(groupLayer, encodingErrorCallback) {
		const subLayers = groupLayer.getLayers().getArray();
		const groupOpacity = groupLayer.getOpacity();
		return subLayers.map((l) => this._encode(l, encodingErrorCallback, groupOpacity));
	}

	_encodeWMTS(olLayer, groupOpacity) {
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
				opacity: groupOpacity !== 1 ? groupOpacity : wmtsLayer.getOpacity(),
				type: 'wmts',
				baseURL: baseURL,
				layer: layer,
				requestEncoding: requestEncoding,
				matrices: BvvMfp3Encoder.buildMatrixSets(tileGrid),
				matrixSet: tileMatrixSet
			};
		};

		return createWmtsSpecs(olLayer);
	}

	_encodeWMS(olLayer, wmsGeoResource, groupOpacity) {
		// no handling for target srid, it is assumed that the wmsGeoResource also supports the target srid
		const source = olLayer.getSource();
		const params = source.getParams();
		const layers = params.LAYERS?.split(',') || [];
		const styles = params.STYLES != null ? params.STYLES.split(',') : new Array(layers.length).join(',').split(',');

		const url = source.getUrl && source.getUrl();
		const defaultCustomParams = { transparent: true }; // similar to OpenLayers TRANSPARENT-Parameter is set by default
		return {
			type: 'wms',
			baseURL: url,
			imageFormat: wmsGeoResource.format,
			layers: layers,
			name: wmsGeoResource.id,
			opacity: groupOpacity !== 1 ? groupOpacity : olLayer.getOpacity(),
			styles: styles,
			customParams: defaultCustomParams
		};
	}

	_encodeVector(olVectorLayer, groupOpacity) {
		// todo: refactor to utils
		// adopted/adapted from {@link https://dmitripavlutin.com/javascript-array-group/#:~:text=must%20be%20inserted.-,array.,provided%20by%20core%2Djs%20library. | Array Grouping in JavaScript}
		const groupBy = (elementsToGroup, groupByFunction) =>
			elementsToGroup.reduce((group, element) => {
				const groupName = groupByFunction(element);
				group[groupName] = group[groupName] ?? [];
				group[groupName].push(element);
				return group;
			}, {});

		const defaultGroups = {
			MultiPolygon: [],
			Polygon: [],
			Circle: [],
			GeometryCollection: [],
			LineString: [],
			MultiLineString: [],
			MultiPoint: [],
			Point: []
		};
		const groupByGeometryType = (features) => groupBy(features, (feature) => feature.getGeometry().getType());
		const groupedByGeometryType = { ...defaultGroups, ...groupByGeometryType(olVectorLayer.getSource().getFeatures()) };

		const featuresSortedByGeometryType = [
			...groupedByGeometryType['MultiPolygon'],
			...groupedByGeometryType['Polygon'],
			...groupedByGeometryType['Circle'],
			...groupedByGeometryType['GeometryCollection'],
			...groupedByGeometryType['LineString'],
			...groupedByGeometryType['MultiLineString'],
			...groupedByGeometryType['MultiPoint'],
			...groupedByGeometryType['Point']
		];

		const transformForMfp = (olFeature) => {
			const mfpFeature = olFeature.clone();
			mfpFeature.getGeometry().transform(this._mapProjection, this._mfpProjection);
			return mfpFeature;
		};

		const startResult = { features: [] };
		// todo: find a better implementation then this mix of feature aggregation (reducer) and style aggregation (cache)
		const aggregateResults = (encoded, feature) => {
			const result = this._encodeFeature(feature, olVectorLayer, styleCache, groupOpacity);
			return result
				? {
						features: [...encoded.features, ...result.features]
					}
				: encoded;
		};

		// we provide a cache for ol styles which are applied to multiple features, to reduce the
		// amount of created style-specs
		const styleCache = new Map();
		const mfpPageExtent = getPolygonFrom(this._pageExtent).transform(this._mapProjection, this._mfpProjection).getExtent();
		const encodingResults = featuresSortedByGeometryType
			.map((f) => transformForMfp(f))
			.filter((f) => f.getGeometry().intersectsExtent(mfpPageExtent))
			.reduce(aggregateResults, startResult);

		const styleObjectFrom = (styles) => {
			const styleObjectV2 = {
				version: '2'
			};

			const asV2 = (styles) => {
				styles.forEach((style) => {
					const { id, symbolizers } = style;
					styleObjectV2[`[_gx_style = ${id}]`] = {
						symbolizers: symbolizers
					};
				});
				return styleObjectV2;
			};
			return asV2(styles);
		};

		return encodingResults.features.length === 0
			? false
			: {
					type: 'geojson',
					geoJson: { features: encodingResults.features, type: 'FeatureCollection' },
					name: olVectorLayer.get('id'),
					style: styleObjectFrom(Array.from(styleCache.values())),
					opacity: olVectorLayer.getOpacity()
				};
	}

	_encodeFeature(olFeature, olLayer, styleCache, groupOpacity, presetStyles = []) {
		const defaultResult = { features: [] };
		const resolution = this._mfpProperties.scale / UnitsRatio / PointsPerInch;

		const getOlStyles = (feature, layer, resolution) => {
			const featureStyles = feature.getStyle();
			if (featureStyles != null && typeof featureStyles === 'function') {
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
				return allStyles.find((s) => !(s.getGeometry && typeof s.getGeometry() === 'function')) ?? null;
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
					const angle = Math.PI * (1 / sides - 1 / 2);
					const points = [];
					for (let i = 0; i < sides; ++i) {
						const rotatedAngle = angle + (i * 2 * Math.PI) / sides;
						const x = origin[0] + radius * Math.cos(rotatedAngle);
						const y = origin[1] + radius * Math.sin(rotatedAngle);
						points.push([x, y]);
					}
					points.push(points[0]); // Close the polygon
					return new Feature(new Polygon([points]));
				}
			};

			const isEncodable = () => {
				const geometry = olFeature.getGeometry();
				return (
					geometry instanceof Polygon ||
					geometry instanceof MultiPolygon ||
					geometry instanceof LineString ||
					geometry instanceof MultiLineString ||
					geometry instanceof Point ||
					geometry instanceof MultiPoint
				);
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
		if (!olFeatureToEncode) {
			console.warn('feature not encodable', olFeature);
			return null;
		}

		const layerOpacity = groupOpacity !== 1 ? groupOpacity : olLayer.getOpacity();
		const addOrUpdateEncodedStyle = (olStyle) => {
			const addEncodedStyle = () => {
				const encodedStyle = {
					...initEncodedStyle(),
					symbolizers: this._encodeStyle(olStyleToEncode, olFeatureToEncode.getGeometry(), this._mfpProperties.dpi)
				};
				encodedStyle.symbolizers.forEach((symbolizer) => {
					if (symbolizer.fillOpacity) {
						symbolizer.fillOpacity *= layerOpacity;
					}

					if (symbolizer.strokeOpacity) {
						symbolizer.strokeOpacity *= layerOpacity;
					}

					if (symbolizer.graphicOpacity) {
						symbolizer.graphicOpacity *= layerOpacity;
					}
				});

				styleCache.set(olStyle, encodedStyle);
				return encodedStyle.id;
			};
			const updateEncodedStyle = () => {
				const { id, symbolizers } = styleCache.get(olStyle);
				const encodedGeometryType = this._encodeGeometryType(olFeatureToEncode.getGeometry().getType());
				if (symbolizers.every((s) => s.type !== encodedGeometryType)) {
					const encodedStyle = {
						id: id,
						symbolizers: [...symbolizers, ...this._encodeStyle(olStyleToEncode, olFeatureToEncode.getGeometry(), this._mfpProperties.dpi)]
					};
					styleCache.set(olStyle, encodedStyle);
				}

				return id;
			};

			return styleCache.has(olStyle) ? updateEncodedStyle() : addEncodedStyle();
		};

		const encodedStyleId = addOrUpdateEncodedStyle(olStyleToEncode);

		// handle advanced styles
		const advancedStyleFeatures = Array.isArray(olStyles)
			? olStyles.reduce((styleFeatures, style) => {
					const isGeometryFunction = style.getGeometry && typeof style.getGeometry() === 'function';

					if (isGeometryFunction) {
						const geometry = style.getGeometry()(olFeatureToEncode);
						if (geometry) {
							const result = this._encodeFeature(new Feature(geometry), olLayer, styleCache, groupOpacity, [style]);
							return result ? { features: [...styleFeatures.features, ...result.features] } : defaultResult;
						}
					}
					return styleFeatures;
				}, defaultResult)
			: { features: [] };

		const encodedFeature = this._geometryEncodingFormat.writeFeatureObject(olFeatureToEncode);
		encodedFeature.properties = { _gx_style: encodedStyleId };
		return {
			features: [encodedFeature, ...advancedStyleFeatures.features]
		};
	}

	_encodeGeometryType(olGeometryType) {
		const defaultEncoding = (geometryType) => geometryType.toLowerCase();
		const specialEncodings = { MultiPoint: () => 'point', LineString: () => 'line', MultiPolygon: () => 'polygon', MultiLineString: () => 'line' };

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
			encoded.rotation = ((imageStyle.getRotation() ?? 0) * 180.0) / Math.PI;
			const getPropertiesFromIconStyle = (iconStyle) => {
				const iconSrc = iconStyle.getSrc();
				const { IconService: iconService } = $injector.inject('IconService');
				const iconResult = iconService.getIconResult(iconSrc);
				const color = iconService.decodeColor(iconSrc);
				return {
					size: iconStyle.getSize(),
					anchor: iconStyle.getAnchor(),
					imageSrc: iconResult ? iconResult.getUrl(color) : iconStyle.getSrc().replace(/\.svg/, '.png')
				};
			};
			const getPropertiesFromShapeStyle = (shapeStyle) => {
				const stroke = shapeStyle.getStroke();
				const radius = shapeStyle.getRadius();
				const width = stroke
					? BvvMfp3Encoder.adjustDistance(2 * radius, dpi) + BvvMfp3Encoder.adjustDistance(stroke.getWidth() + 1, dpi)
					: BvvMfp3Encoder.adjustDistance(2 * radius, dpi);
				return {
					fill: shapeStyle.getFill(),
					stroke: stroke,
					radius: radius,
					size: [width, width]
				};
			};

			const styleProperties = imageStyle instanceof IconStyle ? getPropertiesFromIconStyle(imageStyle) : getPropertiesFromShapeStyle(imageStyle);
			if (styleProperties.size) {
				encoded.graphicWidth = BvvMfp3Encoder.adjustDistance(styleProperties.size[0] * scale || 0.1, dpi);
				encoded.graphicHeight = BvvMfp3Encoder.adjustDistance(styleProperties.size[1] * scale || 0.1, dpi);
				const hexColor = styleProperties.fill?.getColor();
				if (hexColor) {
					const color = ColorAsArray(hexColor);
					encoded.fillColor = rgbToHex(color.slice(0, 3));
					encoded.fillOpacity = color[3] ?? 1;
				}
			}

			if (styleProperties.anchor) {
				// The graphic[X/Y]Offset property is not documented in MFP.
				// It seems to calculate the final position of the symbol in relation
				// to the width and height of the original graphic resource and the defined
				// graphicWidth/graphicHeight property.
				// Example:
				// RasterImage with size of 48x48 Pixel and defined
				// properties of graphicWidth:30 and graphicHeight:30
				//
				// To translate the normalized anchor-value of [24,48] (-> center, bottom)
				// the offset should be relate to the image center (width/2,height/2)
				encoded.graphicXOffset = (styleProperties.size[0] / 2 - styleProperties.anchor[0]) * scale;
				encoded.graphicYOffset = (styleProperties.size[1] / 2 - styleProperties.anchor[1]) * scale;
			}

			if (styleProperties.imageSrc) {
				encoded.externalGraphic = styleProperties.imageSrc;
				encoded.graphicOpacity = 1;
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
			// additional X-Offset is ommitted, text is currently center aligned. Only Y-Offset will be translate to a
			// encoded.labelXOffset = textStyle.getOffsetX();
			encoded.labelYOffset = textStyle.getOffsetY() ? BvvMfp3Encoder.adjustDistance(textStyle.getOffsetY() * -1, dpi) : 0;
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
				const [weight, size, ...fontFamilyValues] = fontValues;
				// hint: the fontFamily value relates to all installed font on the server.
				// If the application use any custom fonts over css-styles which are used
				// for labels on the map, these fonts must be available as TrueTypeFonts
				// on the MapFishPrint server
				encoded.fontFamily = fontFamilyValues.join(' ');
				encoded.fontSize = BvvMfp3Encoder.adjustDistance(parseInt(size), dpi);
				encoded.fontWeight = weight;
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
			const anchorPoint = isValid
				? { x: AnchorPointPositions[verticalAndHorizontalAlignment[1]], y: AnchorPointPositions[verticalAndHorizontalAlignment[0]] }
				: defaultAnchorPoint;
			return anchorPoint;
		};

		const toFeatureWithOverlayProperties = (overlay) => {
			const element = overlay.getElement();

			if (element.tagName.toLowerCase() !== BaOverlay.tag) {
				console.warn('cannot encode overlay element: No rule defined', element);
				return null;
			}
			const selector = `.${OVERLAY_STYLE_CLASS}`;
			const labelElements = findAllBySelector(element, selector);
			const label = labelElements.length > 0 ? labelElements[0].innerText : '';

			const center = overlay.getPosition();
			const mfpCenter = new Point(center).transform(this._mapProjection, this._mfpProjection).getCoordinates();

			const offsetX = Math.round(element.placement.offset[0]);
			const offsetY = -Math.round(element.placement.offset[1]);
			const labelAnchorPoint = anchorPointFromPositioning(element.placement.positioning);

			return {
				type: 'Feature',
				properties: {
					type: element.type,
					label: label,
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
		const overlayFeatures = overlays.map((o) => toFeatureWithOverlayProperties(o)).filter((f) => f !== null);

		return overlayFeatures.length === 0
			? []
			: {
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
						"[type='distance']": {
							symbolizers: [
								{
									type: 'point',
									fillColor: '#ff0000',
									fillOpacity: 1,
									strokeOpacity: 0,
									graphicName: 'circle',
									graphicOpacity: 0.4,
									pointRadius: 3
								},
								{
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
								}
							]
						},
						"[type='distance-partition']": {
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
								},
								{
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
								}
							]
						},
						"[type='area']": {
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
								}
							]
						}
					}
				};
	}

	_encodeGridLayer(scale) {
		const defaultSpacing = 1000;
		const spacings = new Map([
			[2000000, 100000],
			[1000000, 100000],
			[500000, 50000],
			[200000, 10000],
			[100000, 5000],
			[50000, 1000],
			[25000, 1000],
			[10000, 1000],
			[5000, 500],
			[2500, 200],
			[1250, 100],
			[1000, 100],
			[500, 50]
		]);

		const spacing = spacings.has(scale) ? spacings.get(scale) : defaultSpacing;
		return {
			type: 'grid',
			gridType: 'lines',
			origin: [600000, 4800000],
			spacing: [spacing, spacing],
			renderAsSvg: true,
			haloColor: '#f5f5f5',
			labelColor: 'black',
			valueFormat: '##,#####.#',
			formatGroupingSeparator: ' ',
			indent: 10,
			haloRadius: 2,
			font: {
				name: ['Liberation Sans', 'Helvetica', 'Nimbus Sans L', 'Liberation Sans', 'FreeSans', 'Sans-serif'],
				size: 8,
				style: 'BOLD'
			}
		};
	}

	static adjustDistance(distance, dpi) {
		return distance != null ? (distance * 70) / dpi : null;
	}

	/**
	 *@private
	 */
	async _generateShortUrl() {
		const url = setQueryParams(this._shareService.encodeState(), { [QueryParameters.TOOL_ID]: '' });
		try {
			return await this._urlService.shorten(url);
		} catch (e) {
			console.warn('Could not shorten url: ' + e);
			return url;
		}
	}

	_generateQrCode(linkUrl) {
		try {
			return this._urlService.qrCode(linkUrl);
		} catch (e) {
			console.warn('Could not generate qr-code url: ' + e);
		}
		return null;
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
