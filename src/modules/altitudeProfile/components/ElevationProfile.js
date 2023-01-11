import { html } from 'lit-html';
import css from './elevationProfile.css';
import { MvuElement } from '../../MvuElement';
import Chart from 'chart.js/auto'; // Todo: Import single dependencies for tree shaking
import { $injector } from '../../../injection';

import { SurfaceType } from '../utils/altitudeProfileAttributeTypes';
import { nothing } from 'lit-html';

const Update_Schema = 'update_schema';
const Update_Selected_Attribute = 'update_selected_attribute';
const Enrich_Profile_Data = 'enrich_profile_data';

/**
 * different types of slope
 * @enum
 */
export const SlopeType = Object.freeze({
	FLAT: 'flat',
	STEEP: 'steep'
});

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
			distUnit: null
		});
		this._chart = null;
		this._altitudeProfileAttributeTypes = [];

		const {
			ConfigService: configService,
			ElevationService: elevationService,
			TranslationService: translationService
		} = $injector.inject('ConfigService', 'ElevationService', 'TranslationService');

		this._translationService = translationService;
		this._configService = configService;
		this._elevationService = elevationService;

		this._enableTooltip = true;
		this._drawSelectedAreaBorder = false;
		this._mouseIsDown = false;
		this._firstLeft = 0;
		this._secondLeft = 0;
		this._top = 0;
		this._bottom = 0;

		this._initSurfaceTypes();
	}

	/**
	 * @override
	 */
	onInitialize() {
		this.style.width = '100%';
		this.style.height = '14em';

		this.observe(
			(state) => state.media.darkSchema,
			(darkSchema) => this.signal(Update_Schema, darkSchema)
		);
		this.observe(
			(state) => state.altitudeProfile.coordinates,
			(coordinates) => this._getAltitudeProfile(coordinates)
		);
	}

	/**
	 * @override
	 */
	update(type, data, model) {
		switch (type) {
			case Enrich_Profile_Data:
				this._enrichProfileData(data);
				return { ...model, profile: data, labels: data.labels, data: data.chartData, distUnit: data.distUnit };

			case Update_Schema:
				return { ...model, darkSchema: data };

			case Update_Selected_Attribute:
				return { ...model, selectedAttribute: data };
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
	createView(model) {
		const translate = (key) => this._translationService.translate(key);

		if (!model.profile) {
			return nothing;
		}
		const sumUp = model.profile?.stats?.sumUp;
		const sumDown = model.profile?.stats?.sumDown;

		const onChange = () => {
			const select = this.shadowRoot.getElementById('attrs');
			const selectedAttribute = select.options[select.selectedIndex].value;
			this.signal(Update_Selected_Attribute, selectedAttribute);
		};

		return html`
			<style>
				${css}
			</style>

			<div class="chart-container" style="position: relative; height:100%; ">
				<canvas class="altitudeprofile" id="route-altitude-chart"></canvas>

				<div class="flex" id="route-altitude-chart-footer">
					<span id="route-altitude-chart-footer-sumUp">${translate('altitudeProfile_sumUp')}: ${sumUp}</span>
					<span id="route-altitude-chart-footer-sumDown">${translate('altitudeProfile_sumDown')}: ${sumDown}</span>
					<span>
						<select id="attrs" @change=${onChange}>
							${model.profile.attrs.map((attr) => html`
									<option value="${attr.id}" ?selected=${model.selectedAttribute === attr.id}>
										${translate('altitudeProfile_' + attr.id)}
									</option>
								`)}
						</select>
					</span>
				</div>
			</div>
		`;
	}

	_enritchAltsArrayWithAttributeData(attribute, profile) {
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
			this._enritchAltsArrayWithAttributeData(attr, profile);
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
					label: translate('altitudeProfile_elevation_profile'),
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
		const selectedAttribute = this.getModel().selectedAttribute;
		switch (selectedAttribute) {
			case 'surface':
				return this._getTextTypeGradient(chart, altitudeData, selectedAttribute);

			default:
				return ElevationProfile.BACKGROUND_COLOR;
		}
	}

	_getBorder(chart, altitudeData) {
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
		try {
			const profile = await this._elevationService.getProfile(coordinates);
			this.signal(Enrich_Profile_Data, profile);
		}
		catch (e) {
			console.warn(e.message);
			// Todo: emit error notification
			// this.signal(Update_Profile_Data, null);
		}
	}

	_getChartConfig(altitudeData, newDataLabels, newDataData, distUnit) {
		const translate = (key) => this._translationService.translate(key);
		const config = {
			type: 'line',
			data: this._getChartData(altitudeData, newDataLabels, newDataData),
			plugins: [
				{
					id: 'shortenLeftEndOfScale',
					beforeInit: (chart) => {
						chart.options.scales.x.min = Math.min(...chart.data.labels);
						chart.options.scales.x.max = Math.max(...chart.data.labels);
					}
				}
			],
			options: {
				responsive: true,
				animation: false, // HINT: UX decision
				maintainAspectRatio: false,

				scales: {
					x: { type: 'linear',
						title: {
							display: true,
							text: translate('altitudeProfile_distance') + ' [' + distUnit + ']'
						}
					},
					y: { type: 'linear', beginAtZero: false,
						title: {
							display: true,
							text: translate('altitudeProfile_alt') + ' [m]'
						}
					}, // HINT: UX decision
					y1: {
						type: 'linear',
						display: true,
						position: 'right',
						grid: { drawOnChartArea: false }
					}
				},
				events: ['mousemove', 'mousedown', 'mouseup', 'mouseout', 'click', 'touchstart', 'touchmove'],
				plugins: {
					title: {
						align: 'end',
						display: true,
						text: translate('altitudeProfile_elevation_reference_system')
					},
					legend: { display: false }
				}
			}
		};
		return config;
	}


	_updateChart(labels, data) {
		this._chart.data.labels = labels;
		this._chart.data.datasets[0].data = data;
		this._chart.update();
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
		if (this._chart && this._chart.data && this._chart.data.datasets.length > 0) {
			this._updateChart(labels, data);
			return;
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
		return '#66eeff';
	}

	static get SLOPE_FLAT_COLOR_LIGHT() {
		return '#eeff66';
	}

	static get SLOPE_FLAT_COLOR() {
		if (ElevationProfile.IS_DARK) {
			return ElevationProfile.SLOPE_FLAT_COLOR_DARK;
		}
		return ElevationProfile.SLOPE_FLAT_COLOR_LIGHT;
	}

	static get SLOPE_STEEP_COLOR_DARK() {
		return '#ee4444';
	}

	static get SLOPE_STEEP_COLOR_LIGHT() {
		return '#4444ee';
	}

	static get SLOPE_STEEP_COLOR() {
		if (ElevationProfile.IS_DARK) {
			return ElevationProfile.SLOPE_STEEP_COLOR_DARK;
		}
		return ElevationProfile.SLOPE_STEEP_COLOR_LIGHT;
	}

	static get BACKGROUND_COLOR_DARK() {
		return '#888888';
	}

	static get BACKGROUND_COLOR_LIGHT() {
		return '#ddddff';
	}

	static get BACKGROUND_COLOR() {
		if (ElevationProfile.IS_DARK) {
			return ElevationProfile.BACKGROUND_COLOR_DARK;
		}
		return ElevationProfile.BACKGROUND_COLOR_LIGHT;
	}

	static get BORDER_COLOR_DARK() {
		return '#886644';
	}

	static get BORDER_COLOR_LIGHT() {
		return '#AA2266';
	}

	static get BORDER_COLOR() {
		if (ElevationProfile.IS_DARK) {
			return ElevationProfile.BORDER_COLOR_DARK;
		}
		return ElevationProfile.BORDER_COLOR_LIGHT;
	}

	static get tag() {
		return 'ba-elevation-profile';
	}
}
