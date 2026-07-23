/**
 * @module modules/elevationProfile/components/panel/ElevationProfile
 */
import { html } from 'lit-html';
import css from './elevationProfile.css?inline';
import { MvuElement } from '@src/modules/MvuElement';
import Chart from 'chart.js/auto'; // Todo: Import single dependencies for tree shaking
import { $injector } from '@src/injection';

import { SurfaceType } from '@src/modules/elevationProfile/utils/elevationProfileAttributeTypes';
import { addHighlightFeatures, removeHighlightFeaturesById } from '@src/store/highlight/highlight.action';
import { toLocaleString } from '@src/utils/numberUtils';
import { isNumber } from '@src/utils/checks';
import { HighlightFeatureType } from '@src/domain/highlightFeature';

const Update_Color_Schema = 'update_color_schema';
const Update_Selected_Attribute = 'update_selected_attribute';
const Update_Profile_Data = 'update_profile_data';
const Update_Media = 'update_media';

const Chart_Duration = 600;
const Chart_Delay = 300;

/**
 * different types of slope
 * @readonly
 * @enum {String}
 */
export const SlopeType = Object.freeze({
	FLAT: 'flat',
	GENTLY_UNDULATING: 'gentlyUndulating',
	UNDULATING: 'undulating',
	ROLLING: 'rolling',
	MODERATELY_STEEP: 'moderatelySteep',
	STEEP: 'steep'
});

/**
 * slope classes based on https://esdac.jrc.ec.europa.eu/projects/SOTER/Soter_Model.html
 */
export const SoterSlopeClasses = Object.freeze([
	// todo: refactor to a slopeClass-provider; there are potentially more classifications thinkable, then the current one
	{ type: SlopeType.FLAT, min: 0, max: 2, color: '#1f8a70' },
	{ type: SlopeType.GENTLY_UNDULATING, min: 2, max: 5, color: '#bedb39' },
	{ type: SlopeType.UNDULATING, min: 5, max: 8, color: '#ffd10f' },
	{ type: SlopeType.ROLLING, min: 8, max: 15, color: '#fd7400' },
	{ type: SlopeType.MODERATELY_STEEP, min: 15, max: 30, color: '#d23600' },
	{ type: SlopeType.STEEP, min: 30, max: Infinity, color: '#691b00' }
]);
export const Default_Attribute_Id = 'alt';
export const Default_Attribute = { id: Default_Attribute_Id, unit: 'm' };

export const Empty_Profile_Data = Object.freeze({
	labels: [],
	chartData: [],
	elevations: [],
	attrs: [],
	distUnit: 'm',
	stats: {
		verticalHeight: 0,
		linearDistance: 0
	}
});

/**
 * Chart.js based elevation profile.
 * Note: This component and its dependencies are intended to be loaded dynamically and should therefore be wrapped within the {@link LazyLoadComponent}.
 * Its corresponding chunk name is `elevation-profile`.
 * @class
 * @fires chartJsAfterRender Called after the chart has been fully rendered (and animation completed)
 * @author nklein
 */
export class ElevationProfile extends MvuElement {
	constructor() {
		super({
			profile: Empty_Profile_Data,
			labels: null,
			data: null,
			selectedAttribute: Default_Attribute_Id,
			distUnit: null,
			portrait: false,
			minWidth: false,
			colorSchema: null
		});
		this._chart = null;
		this._chartColorOptions = {};
		this._elevationProfileAttributeTypes = [];

		const {
			ConfigService: configService,
			ElevationService: elevationService,
			TranslationService: translationService,
			UnitsService: unitsService
		} = $injector.inject('ConfigService', 'ElevationService', 'TranslationService', 'UnitsService');

		this._translationService = translationService;
		this._configService = configService;
		this._elevationService = elevationService;
		this._unitsService = unitsService;

		this._drawSelectedAreaBorder = false;
		this._mouseIsDown = false;
		this._firstLeft = 0;
		this._secondLeft = 0;
		this._top = 0;
		this._bottom = 0;
		this._noAnimationValue = false;

		this._initSurfaceTypes();
	}

	/**
	 * @override
	 */
	onInitialize() {
		this.style.width = '100%';

		this.observe(
			(state) => state.media.darkSchema,
			(darkSchema) => this.signal(Update_Color_Schema, `darkSchema:${darkSchema}`)
		);
		this.observe(
			(state) => state.media.highContrast,
			(highContrast) => this.signal(Update_Color_Schema, `highContrast:${highContrast}`)
		);
		this.observe(
			(state) => state.elevationProfile.id,
			(id) => this._getElevationProfile(id)
		);
		this.observe(
			(state) => state.media,
			(data) => this.signal(Update_Media, data),
			true
		);
	}

	/**
	 * @override
	 */
	update(type, data, model) {
		switch (type) {
			case Update_Profile_Data:
				return { ...model, profile: data, labels: data.labels, data: data.chartData, distUnit: data.distUnit };
			case Update_Color_Schema:
				return { ...model, colorSchema: data };
			case Update_Selected_Attribute:
				return { ...model, selectedAttribute: data };

			case Update_Media:
				return {
					...model,
					portrait: data.portrait,
					minWidth: data.minWidth
				};
		}
	}

	/**
	 * @override
	 */
	onAfterRender() {
		this._updateOrCreateChart();
	}

	/**
	 * @override
	 */
	onDisconnect() {
		this._destroyChart();
		removeHighlightFeaturesById(ElevationProfile.HIGHLIGHT_FEATURE_ID);
	}

	/**
	 * @override
	 */
	createView(model) {
		const {
			portrait,
			minWidth,
			profile: { attrs }
		} = model;

		const translate = (key) => this._translationService.translate(key);

		const sumUp = model.profile?.stats?.sumUp;
		const sumDown = model.profile?.stats?.sumDown;

		const verticalHeight = model.profile?.stats?.verticalHeight;
		const highestPoint = model.profile?.stats?.highestPoint;
		const lowestPoint = model.profile?.stats?.lowestPoint;
		const linearDistance = model.profile?.stats?.linearDistance;

		const onChange = (selectedAttribute) => {
			this._noAnimation = true;
			this.signal(Update_Selected_Attribute, selectedAttribute);
		};

		const getOrientationClass = () => (portrait ? 'is-portrait' : 'is-landscape');

		const getMinWidthClass = () => (minWidth ? 'is-desktop' : 'is-tablet');

		const getActiveClass = (attr) => (model.selectedAttribute === attr.id ? 'active' : '');

		const linearDistanceRepresentation = this._unitsService.formatDistance(linearDistance);
		return html`
			<style>
				${css}
			</style>
			<div class="header">
				<h3>
					<span class="icon"> </span>
					${translate('elevationProfile_header')}
				</h3>
				<div class="header__buttons">
					${attrs.map(
						(attr) => html`
							<ba-button
								id=${attr.id}
								@click=${() => onChange(attr.id)}
								.label=${translate('elevationProfile_' + attr.id)}
								class=${getActiveClass(attr)}
							></ba-button>
						`
					)}
				</div>
			</div>
			<div class="profile ${getOrientationClass()} ${getMinWidthClass()}">
				<div class="chart-container">
					<canvas class="elevationprofile" id="route-elevation-chart"></canvas>
				</div>
				<div class="profile__data" id="route-elevation-chart-footer">
					<div class="profile__box">
						<div class="profile__header">${translate('elevationProfile_sumUp')} (m)</div>
						<div class="profile__content">
							<div class="profile__icon up"></div>
							<div class="profile__text" id="route-elevation-chart-footer-sumUp">${this._getLocalizedValue(sumUp)}</div>
						</div>
					</div>
					<div class="profile__box">
						<div class="profile__header">${translate('elevationProfile_sumDown')} (m)</div>
						<div class="profile__content">
							<div class="profile__icon down"></div>
							<div class="profile__text" id="route-elevation-chart-footer-sumDown">${this._getLocalizedValue(sumDown)}</div>
						</div>
					</div>
					<div class="profile__box">
						<div class="profile__header">${translate('elevationProfile_highestPoint')} (m)</div>
						<div class="profile__content">
							<div class="profile__icon highest"></div>
							<div class="profile__text" id="route-elevation-chart-footer-highestPoint">${this._getLocalizedValue(highestPoint)}</div>
						</div>
					</div>
					<div class="profile__box">
						<div class="profile__header">${translate('elevationProfile_lowestPoint')} (m)</div>
						<div class="profile__content">
							<div class="profile__icon lowest"></div>
							<div class="profile__text" id="route-elevation-chart-footer-lowestPoint">${this._getLocalizedValue(lowestPoint)}</div>
						</div>
					</div>
					<div class="profile__box">
						<div class="profile__header">${translate('elevationProfile_verticalHeight')} (m)</div>
						<div class="profile__content">
							<div class="profile__icon height"></div>
							<div class="profile__text" id="route-elevation-chart-footer-verticalHeight">${toLocaleString(verticalHeight)}</div>
						</div>
					</div>
					<div class="profile__box">
						<div class="profile__header">${translate('elevationProfile_linearDistance')} (${linearDistanceRepresentation.unit})</div>
						<div class="profile__content">
							<div class="profile__icon distance"></div>
							<div class="profile__text" id="route-elevation-chart-footer-linearDistance">${linearDistanceRepresentation.localizedValue}</div>
						</div>
					</div>
				</div>
			</div>
		`;
	}

	_getLocalizedValue(measurement) {
		return measurement == null ? `-` : `${toLocaleString(measurement)}`;
	}

	get _noAnimation() {
		return this._noAnimationValue;
	}
	set _noAnimation(value) {
		this._noAnimationValue = value;
	}

	_enrichAltsArrayWithAttributeData(attribute, profile) {
		const attributeName = attribute.id;
		attribute.values.forEach((from_to_value) => {
			for (let index = from_to_value[0]; index <= from_to_value[1]; index++) {
				profile.elevations[index][attributeName] = from_to_value[2];
			}
		});
	}

	_enrichProfileData(profile) {
		const translate = (key) => this._translationService.translate(key);
		if (profile.refSystem === undefined) {
			profile.refSystem = translate('elevationProfile_unknown');
		}

		// check m or km
		profile.distUnit = this._getDistUnit(profile);
		const newLabels = [];
		const startZ = profile.elevations[0].z;
		profile.elevations.forEach((elevation) => {
			if (profile.distUnit === 'km') {
				newLabels.push(elevation.dist / 1000);
			} else {
				newLabels.push(elevation.dist);
			}
			// create alt entry in elevations
			elevation.alt = elevation.z;
			elevation.relativeZ = elevation.z - startZ;
		});
		profile.labels = newLabels;

		profile.chartData = profile.elevations.map((elevation) => elevation.z);

		profile.attrs.forEach((attr) => {
			this._enrichAltsArrayWithAttributeData(attr, profile);
		});
		// add alt(itude) to attribute select
		profile.attrs = [Default_Attribute, ...profile.attrs];

		const selectedAttribute = this.getModel().selectedAttribute;
		const attribute = profile.attrs.find((attr) => {
			return attr.id === selectedAttribute;
		});
		if (!attribute) {
			this.signal(Update_Selected_Attribute, Default_Attribute_Id);
		}

		return;
	}

	_getDistUnit(profile) {
		const from = profile.elevations[0].dist;
		const to = profile.elevations[profile.elevations.length - 1].dist;

		const unitsResult = this._unitsService.formatDistance(to - from);
		return unitsResult.unit;
	}

	_getChartData(profile, newDataLabels, newDataData) {
		const translate = (key) => this._translationService.translate(key);

		const _chartData = {
			labels: newDataLabels,
			datasets: [
				{
					data: newDataData,
					label: translate('elevationProfile_elevation_profile'),
					fill: true,
					borderWidth: 4,
					backgroundColor: (context) => {
						const selectedAttribute = this.getModel().selectedAttribute;
						if (!this._chartColorOptions[selectedAttribute].backgroundColor) {
							if (context.chart.chartArea) {
								this._chartColorOptions[selectedAttribute].backgroundColor = this._getBackground(context.chart, profile, selectedAttribute);
							} else {
								return this.getBackgroundColor();
							}
						}
						return this._chartColorOptions[selectedAttribute].backgroundColor;
					},
					borderColor: (context) => {
						const selectedAttribute = this.getModel().selectedAttribute;
						if (!this._chartColorOptions[selectedAttribute].borderColor) {
							if (context.chart.chartArea) {
								this._chartColorOptions[selectedAttribute].borderColor = this._getBorder(context.chart, profile, selectedAttribute);
							} else {
								return this.getBorderColor();
							}
						}
						return this._chartColorOptions[selectedAttribute].borderColor;
					},
					tension: 0.1,
					pointRadius: 0,
					spanGaps: true,
					maintainAspectRatio: false
				}
			]
		};
		return _chartData;
	}

	_getBackground(chart, profile, selectedAttribute) {
		switch (selectedAttribute) {
			case 'surface':
				return this._getTextTypeGradient(chart, profile, selectedAttribute);

			default:
				return this.getBackgroundColor();
		}
	}

	_getBorder(chart, profile, selectedAttribute) {
		switch (selectedAttribute) {
			case 'slope':
				return this._getSlopeGradient(chart, profile);

			case 'surface':
				return this._getTextTypeGradient(chart, profile, selectedAttribute);

			default:
				return this._getFixedColorGradient(chart, this.getBorderColor());
		}
	}

	_addAttributeType(attributeType) {
		if (!this._elevationProfileAttributeTypes[attributeType._attribute]) {
			this._elevationProfileAttributeTypes[attributeType._attribute] = [];
		}
		this._elevationProfileAttributeTypes[attributeType._attribute].push(attributeType);
	}

	_getElevationProfileAttributeType(attribute, typeString) {
		const attributeType = this._elevationProfileAttributeTypes[attribute].find((element) => {
			return element._name === typeString;
		});
		return attributeType;
	}

	_initSurfaceTypes() {
		this._addAttributeType(new SurfaceType('asphalt', '#222222', '#444444'));
		this._addAttributeType(new SurfaceType('gravel', '#eeeeee', '#dddddd'));
		this._addAttributeType(new SurfaceType('missing', '#2222ee', '#ee2222'));
	}

	_getTextTypeGradient(chart, profile, selectedAttribute) {
		const { ctx, chartArea } = chart;
		const gradientBg = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
		const distance = profile.elevations.at(-1).dist; // the dist-property contains ascending values, starting by ZERO to the final distance of the elevation profile

		const elevationProfileAttributeString = profile.elevations[0][selectedAttribute];
		let currentElevationProfileAttributeType = this._getElevationProfileAttributeType(selectedAttribute, elevationProfileAttributeString);
		gradientBg.addColorStop(0, currentElevationProfileAttributeType.color);
		let elevationProfileAttributeType;
		profile.elevations.forEach((element, index) => {
			if (index === 0) {
				return;
			}
			const xPoint = element.dist / distance;
			if (index === profile.elevations.length - 1) {
				gradientBg.addColorStop(xPoint, currentElevationProfileAttributeType.color);
				return;
			}
			const attributeType = element[selectedAttribute];
			elevationProfileAttributeType = this._getElevationProfileAttributeType(selectedAttribute, attributeType);
			if (currentElevationProfileAttributeType === elevationProfileAttributeType) {
				return;
			}
			gradientBg.addColorStop(xPoint, currentElevationProfileAttributeType.color);
			currentElevationProfileAttributeType = elevationProfileAttributeType;
			gradientBg.addColorStop(xPoint, currentElevationProfileAttributeType.color);
		});
		return gradientBg;
	}

	_getSlopeGradient(chart, profile) {
		/** Elevation data points should come with equal distances by interpolation, but in some edge cases
		 *  (i. e. from routing results), the equality of distance is broken up on connection points.
		 *
		 * Thats why we rely on the elevation-element 'dist' property to calculate always a valid xPoint.
		 * */
		const { ctx, chartArea } = chart;
		const gradientBg = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
		const distance = profile.elevations.at(-1).dist; // the dist-property contains ascending values, starting by ZERO to the final distance of the elevation profile

		profile?.elevations.forEach((element) => {
			if (isNumber(element.slope) && isNumber(element.dist)) {
				const xPoint = element.dist / distance;
				const slopeValue = Math.abs(element.slope);
				const slopeClass = SoterSlopeClasses.find((c) => c.min <= slopeValue && c.max > slopeValue);

				gradientBg.addColorStop(xPoint, slopeClass.color);
			}
		});
		return gradientBg;
	}

	_getFixedColorGradient(chart, color) {
		// hint: workaround for Safari Problem displaying horizontal lines with fixed color
		const { ctx, chartArea } = chart;
		const gradientBg = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
		gradientBg.addColorStop(0, color);
		gradientBg.addColorStop(1, color);

		return gradientBg;
	}

	/**
	 * @private
	 */
	async _getElevationProfile(id) {
		if (id) {
			const profile = await this._elevationService.fetchProfile(id);
			if (!profile) {
				this.signal(Update_Profile_Data, Empty_Profile_Data);
			} else {
				this._enrichProfileData(profile);
				this.signal(Update_Profile_Data, profile);
			}
		}
	}

	_getChartConfig(profile, newDataLabels, newDataData, distUnit) {
		const that = this;
		const translate = (key) => this._translationService.translate(key);
		const getElevationEntry = (tooltipItem) => {
			const index = profile.labels.indexOf(tooltipItem.parsed.x);
			return profile.elevations[index];
		};

		const resetChartColor = () => {
			const selectedAttribute = this.getModel().selectedAttribute;
			this._chartColorOptions[selectedAttribute] = {};
		};

		const labelsMax = newDataLabels ? Math.max(...newDataLabels) : 0;

		const baseLineValue = profile.elevations[0]?.z ?? 0;
		const config = {
			type: 'line',
			data: this._getChartData(profile, newDataLabels, newDataData),
			plugins: [
				{
					afterRender() {
						that.dispatchEvent(new CustomEvent('chartJsAfterRender', { bubbles: true }));
					}
				},
				{
					id: 'terminateHighlightFeatures',
					beforeEvent(chart, args) {
						/**
						 * We look for the ChartEvents 'native' property
						 * See https://www.chartjs.org/docs/latest/api/interfaces/ChartEvent.html
						 */
						if (args?.event?.native && ['mouseout', 'pointerup'].includes(args.event.native.type)) {
							removeHighlightFeaturesById(ElevationProfile.HIGHLIGHT_FEATURE_ID);
						}
					}
				},
				{
					id: 'drawVerticalLineAtMousePosition',
					afterTooltipDraw(chart, args) {
						const tooltip = args.tooltip;
						const x = tooltip.caretX;
						const { scales, ctx } = chart;

						const yScale = scales.y;
						ctx.beginPath();
						chart.ctx.moveTo(x, yScale.getPixelForValue(yScale.max, 0));
						chart.ctx.strokeStyle = '#ff0000';
						chart.ctx.lineTo(x, yScale.getPixelForValue(yScale.min, 0));
						chart.ctx.stroke();
					}
				},
				{
					id: 'horizontalLine',
					afterDatasetsDraw: (chart) => {
						const yValue = chart.scales.y.getPixelForValue(baseLineValue);
						const ctx = chart.ctx;
						ctx.save();
						ctx.setLineDash([2, 4]);
						ctx.beginPath();
						ctx.moveTo(chart.chartArea.left, yValue);
						ctx.lineTo(chart.chartArea.right, yValue);
						ctx.strokeStyle = this.getBorderColor();
						ctx.lineWidth = 1;
						ctx.stroke();
						ctx.restore();
					}
				},
				{
					id: 'terrainVisibility',

					// configuration for line of sight
					defaults: {
						observerHeight: 1.6, // observer height (of the eyes) above ground usually 1.6 m
						earthRadius: 6371000,
						kRefraction: 0.13,
						lineColor: 'rgba(179, 22, 227, 0.5)',
						lineWidth: 2,
						lineDash: [6, 4]
					},

					beforeDatasetsUpdate(chart, args, options) {
						const config = { ...this.defaults, ...options };
						const elevationDataset = chart.data.datasets[0];
						const distanceArray = chart.data.labels;
						if (!elevationDataset || !elevationDataset.data.length) return;

						const R_eff = config.earthRadius / (1 - config.kRefraction);

						// rebuilding the elevation points by the chart data
						const elevationPoints = [];
						for (let index = 0; index < elevationDataset.data.length; index++) {
							elevationPoints.push({ x: distanceArray[index], y: elevationDataset.data[index] });
						}
						const observer = { x: elevationPoints[0].x, y: elevationPoints[0].y + config.observerHeight, visible: true };
						const dObserverHorizon = Math.sqrt(2 * R_eff * observer.y + Math.pow(observer.y, 2));

						// 1. dropping the elevation profile by earth curvature and refraction of light
						const transformedElevationPoints = elevationPoints.map((pt) => {
							const d = profile.distUnit === 'km' ? pt.x * 1000 : pt.x; // the source-values for the elevation are always calculated as distances

							const horizonDrop = d > dObserverHorizon ? Math.sqrt(Math.pow(R_eff, 2) + Math.pow(d - dObserverHorizon, 2)) - R_eff : 0;

							return {
								x: pt.x,
								y: pt.y,
								reducedY: pt.y - horizonDrop
							};
						});

						// 2. calculate line of sight
						const viewPoints = [];

						viewPoints.push(observer);

						let maxSlope = -Infinity;
						let maxReducedSlope = -Infinity;
						for (let i = 1; i < transformedElevationPoints.length; i++) {
							const pt = transformedElevationPoints[i];
							const dxInMeters = profile.distUnit === 'km' ? pt.x * 1000 : pt.x; // the source-values for the elevation are always calculated as distances
							const dy = pt.reducedY - observer.y;
							const reducedSlope = dy / dxInMeters;
							const slope = (pt.y - observer.y) / dxInMeters;
							if (dxInMeters > dObserverHorizon && dy < 0) {
								// point is behind && under the horizon
								viewPoints.push({ x: pt.x, y: -Infinity, visible: false });
							} else if (reducedSlope > maxReducedSlope) {
								maxReducedSlope = reducedSlope;
								maxSlope = slope;
								viewPoints.push({ x: pt.x, y: pt.y, visible: true });
							} else {
								const targetY = observer.y + maxSlope * dxInMeters; // point is covered, the y-value must be linear to the last blocker
								viewPoints.push({ x: pt.x, y: targetY, visible: false });
							}
						}

						// 3. save the result for the draw hook
						chart._visibilityPoints = viewPoints;
					},

					// drawing line of sight into the chart
					afterDatasetsDraw(chart, args, options) {
						const config = { ...this.defaults, ...options };
						const ctx = chart.ctx;
						const points = chart._visibilityPoints;

						const getPixel = (point, axes) => {
							return { x: axes.x.getPixelForValue(point.x), y: axes.y.getPixelForValue(point.y) };
						};
						if (!points || points.length < 2) return;

						const axes = chart.scales;

						ctx.save();
						ctx.beginPath();

						// start (observer eye)
						const startPixel = getPixel(points[0], axes);
						ctx.moveTo(startPixel.x, startPixel.y);

						for (let i = 1; i < points.length; i++) {
							/**
							 * We draw points which are:
							 * - before the horizon and visible
							 * - or behind the horizon but visible
							 *
							 * An y-value of -Infinity marks invisible points behind the horizon. If no point
							 * with a valid y-value is left, the line will end early.
							 */
							if (points[i].y !== -Infinity) {
								const pixel = getPixel(points[i], axes);
								ctx.lineTo(pixel.x, pixel.y);
							}
						}

						ctx.strokeStyle = config.lineColor;
						ctx.lineWidth = config.lineWidth;
						ctx.setLineDash(config.lineDash);
						ctx.stroke();
						ctx.restore();
					}
				}
			],
			options: {
				responsive: true,
				animation: {
					duration: this._noAnimation ? 0 : Chart_Duration,
					delay: this._noAnimation ? 0 : Chart_Delay
				},
				maintainAspectRatio: false,
				onResize: resetChartColor,
				scales: {
					x: {
						type: 'linear',
						title: {
							display: true,
							text: `${translate('elevationProfile_distance')} ${distUnit ? `(${distUnit})` : ''}`,
							color: this.getTextColor()
						},
						ticks: {
							includeBounds: false,
							maxRotation: 0,
							color: this.getTextColor()
						},
						max: labelsMax
					},
					y: {
						type: 'linear',
						beginAtZero: false,
						title: {
							display: true,
							text: translate('elevationProfile_alt') + ' (m)',
							color: this.getTextColor()
						},
						ticks: {
							color: this.getTextColor()
						}
					}
				},
				events: ['pointermove', 'pointerup', 'mouseout'],
				plugins: {
					title: {
						align: 'end',
						display: true,
						text: profile.refSystem,
						color: this.getTextColor()
					},
					legend: { display: false },
					tooltip: {
						displayColors: false,
						mode: 'index',
						intersect: false,
						callbacks: {
							title: (tooltipItems) => {
								const tooltipItem = tooltipItems[0];
								const elevationEntry = getElevationEntry(tooltipItem);
								const distance = this._unitsService.formatDistance(elevationEntry.dist);
								this.setCoordinates([elevationEntry.e, elevationEntry.n]);

								return `${translate('elevationProfile_distance')} (${distance.unit}): ${distance.localizedValue}`;
							},
							label: (tooltipItem) => {
								const createLabel = (attribute) => {
									const name = translate('elevationProfile_' + attribute.id);
									const nameWithUnit = `${translate('elevationProfile_' + attribute.id)} (${attribute.unit})`;
									const prefix = attribute.prefix ? ` ${attribute.prefix} ` : ' ';
									const value = elevationEntry[attribute.id];
									return `${attribute.unit ? nameWithUnit : name}:${prefix}${typeof value !== 'string' ? toLocaleString(value, attribute.id === Default_Attribute_Id ? profile.precision : 0) : value}`;
								};

								const selectedAttributeId = this.getModel().selectedAttribute;
								const elevationEntry = getElevationEntry(tooltipItem);
								const attribute = profile.attrs.find((attr) => {
									return attr.id === selectedAttributeId;
								});

								return selectedAttributeId === Default_Attribute_Id
									? [createLabel(Default_Attribute), createLabel({ id: 'relativeZ', unit: 'm' })]
									: [createLabel(Default_Attribute), createLabel(attribute)];
							}
						}
					}
				}
			}
		};
		return config;
	}

	setCoordinates(coordinates) {
		setTimeout(() => {
			removeHighlightFeaturesById(ElevationProfile.HIGHLIGHT_FEATURE_ID);
			addHighlightFeatures({
				id: ElevationProfile.HIGHLIGHT_FEATURE_ID,
				type: HighlightFeatureType.MARKER_TMP,
				data: [...coordinates]
			});
		});
	}

	_createChart(profile, newDataLabels, newDataData, distUnit) {
		const ctx = this.shadowRoot.querySelector('.elevationprofile').getContext('2d');
		this._chart = new Chart(ctx, this._getChartConfig(profile, newDataLabels, newDataData, distUnit));
		this._noAnimation = false;
	}

	_destroyChart() {
		if (this._chart) {
			this._chart.clear();
			this._chart.destroy();
			delete this._chart;
		}
	}

	_updateOrCreateChart() {
		const { profile, labels, data, distUnit } = this.getModel();
		this._destroyChart();
		this._createChart(profile, labels, data, distUnit);
	}

	getTextColor() {
		return window.getComputedStyle(document.body).getPropertyValue('--text1');
	}

	getBackgroundColor() {
		return window.getComputedStyle(document.body).getPropertyValue('--header-background-color');
	}

	getBorderColor() {
		return window.getComputedStyle(document.body).getPropertyValue('--primary-color');
	}

	static get HIGHLIGHT_FEATURE_ID() {
		return '#elevationProfileHighlightFeatureId';
	}

	static get tag() {
		return 'ba-elevation-profile';
	}
}
