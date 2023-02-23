import { html } from 'lit-html';
import css from './elevationProfile.css';
import { MvuElement } from '../../MvuElement';
import Chart from 'chart.js/auto'; // Todo: Import single dependencies for tree shaking
import { $injector } from '../../../injection';

import { SurfaceType } from '../utils/elevationProfileAttributeTypes';
import { nothing } from 'lit-html';

import { fit as fitMap } from '../../../store/position/position.action';
import { addHighlightFeatures, HighlightFeatureType, removeHighlightFeaturesById } from '../../../store/highlight/highlight.action';

const Update_Schema = 'update_schema';
const Update_Selected_Attribute = 'update_selected_attribute';
const Update_Profile_Data = 'update_profile_data';

const Update_Media = 'update_media';

/**
 * different types of slope
 * @enum
 */
export const SlopeType = Object.freeze({
	FLAT: 'flat',
	STEEP: 'steep'
});

const EmptyProfileData = {
	labels: [],
	chartData: [],
	elevations: [],
	attrs: [{ id: 'alt' }],
	distUnit: 'm',
	stats: {
		sumUp: 0,
		sumDown: 0,
		verticalHeight: 0,
		highestPoint: 0,
		lowestPoint: 0,
		linearDistance: 0
	} };

/**
 * @author nklein
 */
export class ElevationProfile extends MvuElement {
	constructor() {
		super({
			profile: null,
			labels: null,
			data: null,
			selectedAttribute: null,
			darkSchema: null,
			distUnit: null,
			portrait: false,
			minWidth: false
		});
		this._chart = null;
		this._altitudeProfileAttributeTypes = [];

		const {
			MapService: mapService,
			ConfigService: configService,
			ElevationService: elevationService,
			TranslationService: translationService
		} = $injector.inject('MapService', 'ConfigService', 'ElevationService', 'TranslationService');

		this._mapService = mapService;
		this._translationService = translationService;
		this._configService = configService;
		this._elevationService = elevationService;

		this._drawSelectedAreaBorder = false;
		this._mouseIsDown = false;
		this._firstLeft = 0;
		this._secondLeft = 0;
		this._top = 0;
		this._bottom = 0;

		this._unsubscribers = [];
		this._currentExtent = [];

		this._initSurfaceTypes();
	}

	/**
	 * @override
	 */
	onInitialize() {
		this.style.width = '100%';

		this._unsubscribers = [
			this.observe(
				(state) => state.media.darkSchema,
				(darkSchema) => this.signal(Update_Schema, darkSchema)
			),
			this.observe(
				(state) => state.elevationProfile.coordinates,
				(coordinates) => this._getAltitudeProfile(coordinates)
			),
			this.observe(state => state.media, data => this.signal(Update_Media, data), true)
		];
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
		this._chart?.destroy();
		removeHighlightFeaturesById(ElevationProfile.HIGHLIGHT_FEATURE_ID);
		while (this._unsubscribers.length > 0) {
			this._unsubscribers.shift()();
		}
	}

	/**
	 * @override
	 */
	createView(model) {

		const { portrait, minWidth } = model;

		const translate = (key) => this._translationService.translate(key);

		if (!model.profile) {
			return nothing;
		}
		const sumUp = model.profile?.stats?.sumUp;
		const sumDown = model.profile?.stats?.sumDown;

		const verticalHeight = model.profile?.stats?.verticalHeight;
		const highestPoint = model.profile?.stats?.highestPoint;
		const lowestPoint = model.profile?.stats?.lowestPoint;
		const linearDistance = model.profile?.stats?.linearDistance;

		const onChange = () => {
			const select = this.shadowRoot.getElementById('attrs');
			const selectedAttribute = select.options[select.selectedIndex].value;
			this.signal(Update_Selected_Attribute, selectedAttribute);
		};

		const getOrientationClass = () => portrait ? 'is-portrait' : 'is-landscape';

		const getMinWidthClass = () => (minWidth) ? 'is-desktop' : 'is-tablet';

		return html`
			<style>
				${css}
			</style>
			<div class="profile ${getOrientationClass()} ${getMinWidthClass()}">
				<span class="profile__options">
					<select id="attrs" @change=${onChange}>
						${model.profile.attrs.map((attr) => html`
								<option value="${attr.id}" ?selected=${model.selectedAttribute === attr.id}>
									${translate('elevationProfile_' + attr.id)}
								</option>
							`)}
					</select>
				</span>
				<div class="chart-container" style="">
					<canvas class="altitudeprofile" id="route-altitude-chart"></canvas>
				</div>
				<div class="profile__data" id="route-altitude-chart-footer" >
					<div class="profile__box" title="${translate('elevationProfile_sumUp')}">
						<div class="profile__icon up"></div>
						<div class="profile__text" id="route-elevation-chart-footer-sumUp">${sumUp} m</div>
					</div>
					<div class="profile__box" title="${translate('elevationProfile_sumDown')}">
						<div class="profile__icon down"></div>
						<div class="profile__text" id="route-elevation-chart-footer-sumDown" >${sumDown} m</div>
					</div>
					<div class="profile__box" title="${translate('elevationProfile_highestPoint')}">
						<div class="profile__icon highest"></div>
						<div class="profile__text" id="route-elevation-chart-footer-highestPoint" >${highestPoint} m</div>
					</div>
					<div class="profile__box" title="${translate('elevationProfile_lowestPoint')}">
						<div class="profile__icon lowest"></div>
						<div class="profile__text" id="route-elevation-chart-footer-lowestPoint" >${lowestPoint} m</div>
					</div>
					<div class="profile__box" title="${translate('elevationProfile_verticalHeight')}">
						<div class="profile__icon height"></div>
						<div class="profile__text" id="route-elevation-chart-footer-verticalHeight" >${verticalHeight} m</div>
					</div>
					<div class="profile__box" title="${translate('elevationProfile_linearDistance')}">
						<div class="profile__icon distance"></div>
						<div class="profile__text" id="route-elevation-chart-footer-linearDistance" >${linearDistance} m</div>
					</div>
				</div>
			</div>
	`;
	}

	_enrichAltsArrayWithAttributeData(attribute, profile) {
		const attributeName = attribute.id;
		attribute.values.forEach((from_to_value) => {
			for (let index = from_to_value[0]; index <= from_to_value[1]; index++) {
				profile.elevations[index][attributeName] = from_to_value[2];
			}
		});
		profile.elevations.forEach((alt) => {
			if (!alt[attributeName]) {
				alt[attributeName] = 'missing';
			}
		});
	}

	_enrichProfileData(profile) {
		profile.labels = profile.elevations.map((alt) => alt.dist);
		profile.chartData = profile.elevations.map((alt) => alt.z);

		profile.attrs.forEach((attr) => {
			this._enrichAltsArrayWithAttributeData(attr, profile);
		});
		// add alt(itude) to attribute select
		profile.attrs = [{ id: 'alt' }, ...profile.attrs];
		// check m or km
		profile.distUnit = this._getDistUnit(profile);
		const newLabels = [];
		profile.elevations.forEach((alt) => {
			if (profile.distUnit === 'km') {
				newLabels.push(alt.dist / 1000);
			}
			else {
				newLabels.push(alt.dist);
			}
		});
		profile.labels = newLabels;
		return;
	}

	_getDistUnit(profile) {
		const from = profile.elevations[0].dist;
		const to = profile.elevations[profile.elevations.length - 1].dist;

		const dist = to - from;
		const distUnit = dist >= 10000 ? 'km' : 'm';
		return distUnit;
	}

	_getChartData(altitudeData, newDataLabels, newDataData) {
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
						return this._getBackground(context.chart, altitudeData);
					},
					borderColor: (context) => {
						return this._getBorder(context.chart, altitudeData);
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

	_getBackground(chart, altitudeData) {
		if (chart.chartArea) {
			const selectedAttribute = this.getModel().selectedAttribute;
			switch (selectedAttribute) {
				case 'surface':
					return this._getTextTypeGradient(chart, altitudeData, selectedAttribute);

				default:
					return ElevationProfile.BACKGROUND_COLOR;
			}
		}
		return ElevationProfile.BACKGROUND_COLOR;
	}

	_getBorder(chart, altitudeData) {
		if (chart.chartArea) {
			const selectedAttribute = this.getModel().selectedAttribute;
			switch (selectedAttribute) {
				case 'slope':
					return this._getSlopeGradient(chart, altitudeData);

				case 'surface':
					return this._getTextTypeGradient(chart, altitudeData, selectedAttribute);

				default:
					return ElevationProfile.BORDER_COLOR;
			}
		}
		return ElevationProfile.BORDER_COLOR;
	}

	_addAttributeType(attributeType) {
		if (!this._altitudeProfileAttributeTypes[attributeType._attribute]) {
			this._altitudeProfileAttributeTypes[attributeType._attribute] = [];
		}
		this._altitudeProfileAttributeTypes[attributeType._attribute].push(attributeType);
	}

	getAltitudeProfileAttributeType(attribute, typeString) {
		const attributeType = this._altitudeProfileAttributeTypes[attribute].find((element) => {
			return element._name === typeString;
		});
		return attributeType;
	}

	_initSurfaceTypes() {
		this._addAttributeType(new SurfaceType('asphalt', '#222222', '#444444'));
		this._addAttributeType(new SurfaceType('gravel', '#eeeeee', '#dddddd'));
		this._addAttributeType(new SurfaceType('missing', '#2222ee', '#ee2222'));
	}

	_getTextTypeGradient(chart, altitudeData, selectedAttribute) {
		const { ctx, chartArea } = chart;
		const gradientBg = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
		const numberOfPoints = altitudeData.elevations.length;
		const xPointWidth = chartArea.width / numberOfPoints;
		const altitudeProfileAttributeString = altitudeData.elevations[0][selectedAttribute];
		let currentAltitudeProfileAttributeType = this.getAltitudeProfileAttributeType(selectedAttribute, altitudeProfileAttributeString);
		gradientBg.addColorStop(0, currentAltitudeProfileAttributeType.color);
		let altitudeProfileAttributeType;
		altitudeData.elevations.forEach((element, index) => {
			if (index === 0) {
				return;
			}
			if (index === altitudeData.elevations.length - 1) {
				const xPoint = (xPointWidth / chartArea.width) * index;
				gradientBg.addColorStop(xPoint, currentAltitudeProfileAttributeType.color);
				return;
			}
			const attributeType = element[selectedAttribute];
			altitudeProfileAttributeType = this.getAltitudeProfileAttributeType(selectedAttribute, attributeType);
			if (currentAltitudeProfileAttributeType === altitudeProfileAttributeType) {
				return;
			}
			const xPoint = (xPointWidth / chartArea.width) * index;
			gradientBg.addColorStop(xPoint, currentAltitudeProfileAttributeType.color);
			currentAltitudeProfileAttributeType = altitudeProfileAttributeType;
			gradientBg.addColorStop(xPoint, currentAltitudeProfileAttributeType.color);
		});
		return gradientBg;
	}

	_getSlopeGradient(chart, altitudeData) {
		const { ctx, chartArea } = chart;
		const gradientBg = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
		const numberOfPoints = altitudeData.elevations.length;
		const xPointWidth = chartArea.width / numberOfPoints;
		// start gradient with 'flat' color
		gradientBg.addColorStop(0, ElevationProfile.SLOPE_FLAT_COLOR);
		let currentSlopeType = SlopeType.FLAT;
		altitudeData?.elevations.forEach((element, index) => {
			if (currentSlopeType === SlopeType.STEEP) {
				// look for first element with slope less than X
				if (!element.slope || element.slope <= ElevationProfile.SLOPE_STEEP_THRESHOLD) {
					const xPoint = (xPointWidth / chartArea.width) * index;
					gradientBg.addColorStop(xPoint, ElevationProfile.SLOPE_STEEP_COLOR);
					gradientBg.addColorStop(xPoint, ElevationProfile.SLOPE_FLAT_COLOR);
					currentSlopeType = SlopeType.FLAT;
				}
			}
			else {
				// look for first element with slope greater X
				if (element.slope && element.slope > ElevationProfile.SLOPE_STEEP_THRESHOLD) {
					const xPoint = (xPointWidth / chartArea.width) * index;
					gradientBg.addColorStop(xPoint, ElevationProfile.SLOPE_FLAT_COLOR);
					gradientBg.addColorStop(xPoint, ElevationProfile.SLOPE_STEEP_COLOR);
					currentSlopeType = SlopeType.STEEP;
				}
			}
		});
		// end with currentSlopeType - color
		if (currentSlopeType === SlopeType.STEEP) {
			gradientBg.addColorStop(1, ElevationProfile.SLOPE_STEEP_COLOR);
		}
		else {
			gradientBg.addColorStop(1, ElevationProfile.SLOPE_FLAT_COLOR);
		}
		return gradientBg;
	}

	/**
	 * @private
	 */
	async _getAltitudeProfile(coordinates) {
		if (Array.isArray(coordinates) && coordinates.length >= 2) {
			try {
				const profile = await this._elevationService.getProfile(coordinates);
				this._enrichProfileData(profile);
				this.signal(Update_Profile_Data, profile);
			}
			catch (e) {
				console.warn(e.message);
			// Todo: emit error notification
			// this.signal(Update_Profile_Data, null);
			}
		}
		else {
			this.signal(Update_Profile_Data, EmptyProfileData);
		}
	}

	_getChartConfig(altitudeData, newDataLabels, newDataData, distUnit) {
		const translate = (key) => this._translationService.translate(key);
		const tooltipOptions = {
			displayColors: false,
			mode: 'index',
			intersect: false,
			callbacks: {
				title: (tooltipItems) => {
					const { parsed } = tooltipItems[0];
					const index = altitudeData.labels.indexOf(parsed.x);
					if (index > -1) {
						const found = altitudeData.elevations[index];
						this.setCoordinates([found.e, found.n]);
					}

					return 'Distance: ' + tooltipItems[0].label + 'm';
				},
				label: (tooltipItem) => {
					return 'Elevation: ' + tooltipItem.raw + 'm';
				}
			}
		};
		const fit = (currentExtent) => {
			if (currentExtent.length !== 4) {
				return;
			}

			if (currentExtent[0] > currentExtent[2]) {
				const extent0 = currentExtent[0];
				currentExtent[0] = currentExtent[2];
				currentExtent[2] = extent0;
			}
			if (currentExtent[1] > currentExtent[3]) {
				const extent1 = currentExtent[1];
				currentExtent[1] = currentExtent[3];
				currentExtent[3] = extent1;
			}

			const maxZoom = this._mapService.getMaxZoomLevel();
			const coordDiff1 = Math.abs(currentExtent[0] - currentExtent[2]);
			const coordDiff2 = Math.abs(currentExtent[1] - currentExtent[3]);

			if (coordDiff1 < 500 || coordDiff2 < 500) {
				return;
			}

			fitMap(currentExtent, { zoom: maxZoom });
		};
		const selectedAreaBorderPlugin = {
			id: 'selectedAreaBorder',
			afterDraw(chart) { // , args, options
				const { drawSelectedAreaBorder } = getSelectionProps();
				if (!drawSelectedAreaBorder) {
					return;
				}
				const { ctx } = chart;
				_drawSelectionRect(ctx);
			}
		};
		const getSelectionProps = () => {
			return { mouseIsDown: this._mouseIsDown,
				top: this._top,
				bottom: this._bottom,
				firstLeft: this._firstLeft,
				secondLeft: this._secondLeft,
				drawSelectedAreaBorder: this._drawSelectedAreaBorder,
				enableToolTip: this._enableTooltip
			};
		};
		const setMousedownProps = (mouseIsDown, top, bottom, firstLeft, enableToolTip) => {
			this._mouseIsDown = mouseIsDown;
			this._top = top;
			this._bottom = bottom;
			this._firstLeft = firstLeft;
			this._enableTooltip = enableToolTip;
		};
		const setMousemoveProps = (secondLeft) => {
			this._secondLeft = secondLeft;
		};
		const setMouseupOrMouseoutProps = (mouseIsDown, secondLeft, drawSelectedAreaBorder, enableToolTip) => {
			this._mouseIsDown = mouseIsDown;
			this._secondLeft = secondLeft;
			this._drawSelectedAreaBorder = drawSelectedAreaBorder;
			this._enableTooltip = enableToolTip;
		};
		const _drawSelectionRect = (ctx) => {
			const { firstLeft, secondLeft, top, bottom } = getSelectionProps();

			ctx.save();
			ctx.fillStyle = '#aaaacc40';
			ctx.fillRect(firstLeft, top, secondLeft - firstLeft, bottom);
			ctx.restore();
		};
		const getCoordinate = (tooltip) => {
			let coordinate = [];
			if (tooltip?.dataPoints?.length > 0) {
				const index = altitudeData.labels.indexOf(tooltip.dataPoints[0].parsed.x);
				if (index > -1) {
					const found = altitudeData.elevations[index];
					coordinate = [found.e, found.n];
				}
			}
			return coordinate;
		};
		const config = {
			type: 'line',
			data: this._getChartData(altitudeData, newDataLabels, newDataData),
			plugins: [
				{
					id: 'terminateHighlightFeatures',
					beforeEvent(chart, args) {
						/**
						 * We look for the ChartEvents 'native' property
						 * See https://www.chartjs.org/docs/latest/api/interfaces/ChartEvent.html
						 */
						if (args?.event?.native && args.event.native.type === 'pointerout') {
							removeHighlightFeaturesById(ElevationProfile.HIGHLIGHT_FEATURE_ID);
						}
					}
				},
				selectedAreaBorderPlugin,
				{
					// hm - tricky (buggy?)
					// - wenn ich nur mit pointer* native events arbeite funktionieren
					// die touch - Auswertungen nicht richtig
					// wenn ich die touch* native events dazunehme, scheine ich alles 'zu fangen', was ich benötige
					// ich will dann aber nicht native.type überwachen, da ich dann auch touch (und pen und ???) überwachen muss
					// - normalerweise hat man combies wie
					// 'native pointerdown, event mousedown' und danach 'native touchstart , event mousedown'
					//  oder
					// 'native pointerup, event mouseup' und danach 'native touchend , event mouseup'
					// aber manchmal kommt aber ein einsamer 'native touchend, event mouseup'
					id: 'areaSelect',
					beforeEvent(chart, args) {
						const { mouseIsDown } = getSelectionProps();
						const event = args?.event;
						// const native = args.event.native;
						const { ctx, tooltip, chartArea } = chart;

						let coordinate = [];
						if (event.type === 'mousedown') {
							coordinate = getCoordinate(tooltip);

							setMousedownProps(true, chartArea.top, chartArea.height, tooltip.caretX, false);
							this._currentExtent = coordinate;
							return;
						}
						if (!mouseIsDown) {
							return;
						}
						if (event.type === 'mousemove') {
							setMousemoveProps(tooltip.caretX);
							_drawSelectionRect(ctx);

							return;
						}

						// if (event.type === 'mouseup' || event.type === 'mouseout' ||
						// 	native.type === 'pointerup' || native.type === 'pointerout') {
						coordinate = getCoordinate(tooltip);
						setMouseupOrMouseoutProps (false, tooltip.caretX, true, true);
						this._currentExtent = [...this._currentExtent, ...coordinate];

						fit(this._currentExtent);
						// }
					}
				},
				{
					id: 'shortenLeftEndOfScale',
					beforeInit: (chart) => {
						chart.options.scales.x.min = Math.min(...chart.data.labels);
						chart.options.scales.x.max = Math.max(...chart.data.labels);
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
					duration: 600,
					delay: 300
				},
				maintainAspectRatio: false,

				scales: {
					x: {
						type: 'linear',
						title: {
							display: true,
							text: translate('elevationProfile_distance') + ' [' + distUnit + ']',
							color: ElevationProfile.DEFAULT_TEXT_COLOR
						},
						ticks: {
							color: ElevationProfile.DEFAULT_TEXT_COLOR
						}
					},
					y: {
						type: 'linear',
						beginAtZero: false,
						title: {
							display: true,
							text: translate('elevationProfile_alt') + ' [m]',
							color: ElevationProfile.DEFAULT_TEXT_COLOR
						},
						ticks: {
							color: ElevationProfile.DEFAULT_TEXT_COLOR
						},
						suggestedMin: 200,
						suggestedMax: 500

					}
				},
				events: ['pointerdown', 'pointermove', 'pointerup', 'pointerout', 'touchstart', 'touchmove', 'touchend'],
				// , 'mouseout', 'mousedown', 'mousemove', 'mouseup'
				// , 'pointerover', 'pointerenter', 'pointercancel', 'pointerleave', 'gotpointercapture', 'lostpointercapture'

				plugins: {
					title: {
						align: 'end',
						display: true,
						text: translate('elevationProfile_elevation_reference_system'),
						color: ElevationProfile.DEFAULT_TEXT_COLOR
					},
					legend: { display: false },
					tooltip: tooltipOptions
				}
			}
		};
		return config;

	}

	setCoordinates(coordinates) {
		removeHighlightFeaturesById(ElevationProfile.HIGHLIGHT_FEATURE_ID);
		addHighlightFeatures({
			id: ElevationProfile.HIGHLIGHT_FEATURE_ID,
			type: HighlightFeatureType.TEMPORARY, data: { coordinate: [...coordinates] }
		});
	}

	_createChart(profile, newDataLabels, newDataData, distUnit) {
		const ctx = this.shadowRoot.querySelector('.altitudeprofile').getContext('2d');
		this._chart = new Chart(ctx, this._getChartConfig(profile, newDataLabels, newDataData, distUnit));
	}

	_updateOrCreateChart() {
		const { profile, labels, data, distUnit } = this.getModel();
		if (profile === null) {
			return;
		}
		if (this._chart != null) {
			this._chart.destroy();
		}
		this._createChart(profile, labels, data, distUnit);
	}

	static get IS_DARK() {
		const { StoreService } = $injector.inject('StoreService');
		const {
			media: { darkSchema }
		} = StoreService.getStore().getState();
		return darkSchema;
	}

	static get SLOPE_STEEP_THRESHOLD() {
		return 0.02;
	}

	static get SLOPE_FLAT_COLOR_DARK() {
		return 'lime';
	}

	static get SLOPE_FLAT_COLOR_LIGHT() {
		return 'green';
	}

	static get SLOPE_FLAT_COLOR() {
		if (ElevationProfile.IS_DARK) {
			return ElevationProfile.SLOPE_FLAT_COLOR_DARK;
		}
		return ElevationProfile.SLOPE_FLAT_COLOR_LIGHT;
	}

	static get SLOPE_STEEP_COLOR_DARK() {
		return 'red';
	}

	static get SLOPE_STEEP_COLOR_LIGHT() {
		return 'red';
	}

	static get SLOPE_STEEP_COLOR() {
		if (ElevationProfile.IS_DARK) {
			return ElevationProfile.SLOPE_STEEP_COLOR_DARK;
		}
		return ElevationProfile.SLOPE_STEEP_COLOR_LIGHT;
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
