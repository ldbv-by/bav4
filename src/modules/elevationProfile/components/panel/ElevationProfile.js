/**
 * @module modules/elevationProfile/components/panel/ElevationProfile
 */
import { html } from 'lit-html';
import css from './elevationProfile.css';
import { MvuElement } from '../../../MvuElement';
import Chart from 'chart.js/auto'; // Todo: Import single dependencies for tree shaking
import { $injector } from '../../../../injection';

import { SurfaceType } from '../../utils/elevationProfileAttributeTypes';
import { addHighlightFeatures, removeHighlightFeaturesById } from '../../../../store/highlight/highlight.action';
import { toLocaleString } from '../../../../utils/numberUtils';
import { isNumber } from '../../../../utils/checks';
import { HighlightFeatureType } from '../../../../domain/highlightFeature';

const Update_Schema = 'update_schema';
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
			darkSchema: null,
			distUnit: null,
			portrait: false,
			minWidth: false
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
			(darkSchema) => this.signal(Update_Schema, darkSchema)
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

			case Update_Schema:
				return { ...model, darkSchema: data };

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

		const onChange = () => {
			this._noAnimation = true;
			const select = this.shadowRoot.getElementById('attrs');
			const selectedAttribute = select.options[select.selectedIndex].value;
			this.signal(Update_Selected_Attribute, selectedAttribute);
		};

		const getOrientationClass = () => (portrait ? 'is-portrait' : 'is-landscape');

		const getMinWidthClass = () => (minWidth ? 'is-desktop' : 'is-tablet');

		const linearDistanceRepresentation = this._unitsService.formatDistance(linearDistance);
		return html`
			<style>
				${css}
			</style>
			<div class="profile ${getOrientationClass()} ${getMinWidthClass()}">
				<div class="chart-container">
					<span class="profile__options">
						<select id="attrs" @change=${onChange}>
							${attrs.map(
								(attr) => html`
									<option value="${attr.id}" ?selected=${model.selectedAttribute === attr.id}>${translate('elevationProfile_' + attr.id)}</option>
								`
							)}
						</select>
					</span>
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
		profile.elevations.forEach((elevation) => {
			if (profile.distUnit === 'km') {
				newLabels.push(elevation.dist / 1000);
			} else {
				newLabels.push(elevation.dist);
			}
			// create alt entry in elevations
			elevation.alt = elevation.z;
		});
		profile.labels = newLabels;

		profile.chartData = profile.elevations.map((elevation) => elevation.z);

		profile.attrs.forEach((attr) => {
			this._enrichAltsArrayWithAttributeData(attr, profile);
		});
		// add alt(itude) to attribute select
		profile.attrs = [{ id: 'alt' }, ...profile.attrs];

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

	_getChartData(elevationData, newDataLabels, newDataData) {
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
								this._chartColorOptions[selectedAttribute].backgroundColor = this._getBackground(context.chart, elevationData, selectedAttribute);
							} else {
								return ElevationProfile.BACKGROUND_COLOR;
							}
						}
						return this._chartColorOptions[selectedAttribute].backgroundColor;
					},
					borderColor: (context) => {
						const selectedAttribute = this.getModel().selectedAttribute;
						if (!this._chartColorOptions[selectedAttribute].borderColor) {
							if (context.chart.chartArea) {
								this._chartColorOptions[selectedAttribute].borderColor = this._getBorder(context.chart, elevationData, selectedAttribute);
							} else {
								return ElevationProfile.BORDER_COLOR;
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

	_getBackground(chart, elevationData, selectedAttribute) {
		switch (selectedAttribute) {
			case 'surface':
				return this._getTextTypeGradient(chart, elevationData, selectedAttribute);

			default:
				return ElevationProfile.BACKGROUND_COLOR;
		}
	}

	_getBorder(chart, elevationData, selectedAttribute) {
		switch (selectedAttribute) {
			case 'slope':
				return this._getSlopeGradient(chart, elevationData);

			case 'surface':
				return this._getTextTypeGradient(chart, elevationData, selectedAttribute);

			default:
				return this._getFixedColorGradient(chart, ElevationProfile.BORDER_COLOR);
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

	_getTextTypeGradient(chart, elevationData, selectedAttribute) {
		const { ctx, chartArea } = chart;
		const gradientBg = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
		const distance = elevationData.elevations.at(-1).dist; // the dist-property contains ascending values, starting by ZERO to the final distance of the elevation profile

		const elevationProfileAttributeString = elevationData.elevations[0][selectedAttribute];
		let currentElevationProfileAttributeType = this._getElevationProfileAttributeType(selectedAttribute, elevationProfileAttributeString);
		gradientBg.addColorStop(0, currentElevationProfileAttributeType.color);
		let elevationProfileAttributeType;
		elevationData.elevations.forEach((element, index) => {
			if (index === 0) {
				return;
			}
			const xPoint = element.dist / distance;
			if (index === elevationData.elevations.length - 1) {
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

	_getSlopeGradient(chart, elevationData) {
		/** Elevation data points should come with equal distances by interpolation, but in some edge cases
		 *  (i. e. from routing results), the equality of distance is broken up on connection points.
		 *
		 * Thats why we rely on the elevation-element 'dist' property to calculate always a valid xPoint.
		 * */
		const { ctx, chartArea } = chart;
		const gradientBg = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
		const distance = elevationData.elevations.at(-1).dist; // the dist-property contains ascending values, starting by ZERO to the final distance of the elevation profile

		elevationData?.elevations.forEach((element) => {
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

	_getChartConfig(elevationData, newDataLabels, newDataData, distUnit) {
		const that = this;
		const translate = (key) => this._translationService.translate(key);
		const getElevationEntry = (tooltipItem) => {
			const index = elevationData.labels.indexOf(tooltipItem.parsed.x);
			return elevationData.elevations[index];
		};

		const resetChartColor = () => {
			const selectedAttribute = this.getModel().selectedAttribute;
			this._chartColorOptions[selectedAttribute] = {};
		};

		const labelsMax = newDataLabels ? Math.max(...newDataLabels) : 0;
		const config = {
			type: 'line',
			data: this._getChartData(elevationData, newDataLabels, newDataData),
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
							color: ElevationProfile.DEFAULT_TEXT_COLOR
						},
						ticks: {
							includeBounds: false,
							maxRotation: 0,
							color: ElevationProfile.DEFAULT_TEXT_COLOR
						},
						max: labelsMax
					},
					y: {
						type: 'linear',
						beginAtZero: false,
						title: {
							display: true,
							text: translate('elevationProfile_alt') + ' (m)',
							color: ElevationProfile.DEFAULT_TEXT_COLOR
						},
						ticks: {
							color: ElevationProfile.DEFAULT_TEXT_COLOR
						}
					}
				},
				events: ['pointermove', 'pointerup', 'mouseout'],
				plugins: {
					title: {
						align: 'end',
						display: true,
						text: elevationData.refSystem,
						color: ElevationProfile.DEFAULT_TEXT_COLOR
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

									return `${attribute.unit ? nameWithUnit : name}:${prefix}${typeof value !== 'string' ? toLocaleString(value) : value}`;
								};

								const selectedAttributeId = this.getModel().selectedAttribute;
								const elevationEntry = getElevationEntry(tooltipItem);
								const attribute = elevationData.attrs.find((attr) => {
									return attr.id === selectedAttributeId;
								});

								return selectedAttributeId === Default_Attribute_Id
									? createLabel(Default_Attribute)
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

	static get IS_DARK() {
		const { StoreService } = $injector.inject('StoreService');
		const {
			media: { darkSchema }
		} = StoreService.getStore().getState();
		return darkSchema;
	}

	static get DEFAULT_TEXT_COLOR_DARK() {
		return 'rgb(240, 243, 244)';
	}

	static get DEFAULT_TEXT_COLOR_LIGHT() {
		return 'rgb(92, 106, 112)';
	}

	static get DEFAULT_TEXT_COLOR() {
		if (ElevationProfile.IS_DARK) {
			return ElevationProfile.DEFAULT_TEXT_COLOR_DARK;
		}
		return ElevationProfile.DEFAULT_TEXT_COLOR_LIGHT;
	}

	static get BACKGROUND_COLOR_DARK() {
		return 'rgb(38, 74, 89)';
	}

	static get BACKGROUND_COLOR_LIGHT() {
		return '#e3eef4';
	}

	static get BACKGROUND_COLOR() {
		if (ElevationProfile.IS_DARK) {
			return ElevationProfile.BACKGROUND_COLOR_DARK;
		}
		return ElevationProfile.BACKGROUND_COLOR_LIGHT;
	}

	static get BORDER_COLOR_DARK() {
		return 'rgb(9, 157, 220)';
	}

	static get BORDER_COLOR_LIGHT() {
		return '#2c5a93';
	}

	static get BORDER_COLOR() {
		if (ElevationProfile.IS_DARK) {
			return ElevationProfile.BORDER_COLOR_DARK;
		}
		return ElevationProfile.BORDER_COLOR_LIGHT;
	}

	static get HIGHLIGHT_FEATURE_ID() {
		return '#elevationProfileHighlightFeatureId';
	}

	static get tag() {
		return 'ba-elevation-profile';
	}
}
