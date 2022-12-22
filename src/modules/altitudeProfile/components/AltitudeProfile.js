import { html } from 'lit-html';
import css from './altitudeProfile.css';
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
export class AltitudeProfile extends MvuElement {
	constructor() {
		super({
			profile: null,
			labels: null,
			data: null,
			selectedAttribute: null,
			darkSchema: null
		});
		this._chart = null;
		this._altitudeProfileAttributeTypes = [];

		const {
			ConfigService: configService,
			AltitudeService: altitudeService,
			TranslationService: translationService
		} = $injector.inject('ConfigService', 'AltitudeService', 'TranslationService');

		this._translationService = translationService;
		this._configService = configService;
		this._altitudeService = altitudeService;

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
				return { ...model, profile: data, labels: data.labels, data: data.chartData };

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
				<canvas class="altitudeprofile" id="route-altit_getAltitudeProfileude-chart"></canvas>

				<div class="flex">
					${translate('altitudeProfile_sumUp')}: ${sumUp} ${translate('altitudeProfile_sumDown')}: ${sumDown}
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
				profile.alts[index][attributeName] = from_to_value[2];
			}
		});
		profile.alts.forEach((alt) => {
			if (!alt[attributeName]) {
				alt[attributeName] = 'missing';
			}
		});
	}

	_enrichProfileData(profile) {
		profile.labels = profile.alts.map((alt) => alt.dist);
		profile.chartData = profile.alts.map((alt) => alt.alt);

		profile.attrs.forEach((attr) => {
			this._enritchAltsArrayWithAttributeData(attr, profile);
		});
		// add alt itude to attribute select
		profile.attrs = [{ id: 'alt' }, ...profile.attrs];
		return;
	}

	_getChartData(altitudeData, newDataLabels, newDataData) {
		const _chartData = {
			labels: newDataLabels,
			datasets: [
				{
					data: newDataData,
					label: 'Höhenprofil',
					fill: true,
					borderWidth: 4,
					backgroundColor: (context) => {
						return this._getBackgroundColor(context, altitudeData);
					},
					borderColor: (context) => {
						return this._getBorderColor(context, altitudeData);
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

	_getGradient(selectedAttribute, chart, altitudeData) {
		switch (selectedAttribute) {
			case 'slope':
				return this._getSlopeGradient(chart, altitudeData);

			case 'surface':
				return this._getTextTypeGradient(chart, altitudeData, selectedAttribute);

			default:
				return '#88dd88';
		}
	}

	_getBackgroundColor(context, altitudeData) {
		const chart = context.chart;
		const selectedAttribute = this.getModel().selectedAttribute;
		if (selectedAttribute === 'surface') {
			return this._getGradient(selectedAttribute, chart, altitudeData);
		}
		if (selectedAttribute === 'slope') {
			return '#ddddff';
		}
		return this._getGradient(selectedAttribute, chart, altitudeData);
	}

	_getBorderColor(context, altitudeData) {
		const chart = context.chart;
		const selectedAttribute = this.getModel().selectedAttribute;
		if (selectedAttribute === 'surface' || selectedAttribute === 'slope') {
			return this._getGradient(selectedAttribute, chart, altitudeData);
		}
		return '#88dd88';
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
		const numberOfPoints = altitudeData.alts.length;
		const xPointWidth = chartArea.width / numberOfPoints;
		const altitudeProfileAttributeString = altitudeData.alts[0][selectedAttribute];
		let currentAltitudeProfileAttributeType = this.getAltitudeProfileAttributeType(selectedAttribute, altitudeProfileAttributeString);
		gradientBg.addColorStop(0, currentAltitudeProfileAttributeType.color);
		let altitudeProfileAttributeType;
		altitudeData.alts.forEach((element, index) => {
			if (index === 0) {
				return;
			}
			if (index === altitudeData.alts.length - 1) {
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
		const numberOfPoints = altitudeData.alts.length;
		const xPointWidth = chartArea.width / numberOfPoints;
		// start gradient with 'flat' color
		gradientBg.addColorStop(0, AltitudeProfile.FLAT_COLOR);
		let currentSlopeType = SlopeType.FLAT;
		altitudeData?.alts.forEach((element, index) => {
			if (currentSlopeType === SlopeType.STEEP) {
				// look for first element with slope less than X
				if (!element.slope || element.slope <= AltitudeProfile.STEEP_THRESHOLD) {
					const xPoint = (xPointWidth / chartArea.width) * index;
					gradientBg.addColorStop(xPoint, AltitudeProfile.STEEP_COLOR);
					gradientBg.addColorStop(xPoint, AltitudeProfile.FLAT_COLOR);
					currentSlopeType = SlopeType.FLAT;
				}
			}
			else {
				// look for first element with slope greater X
				if (element.slope && element.slope > AltitudeProfile.STEEP_THRESHOLD) {
					const xPoint = (xPointWidth / chartArea.width) * index;
					gradientBg.addColorStop(xPoint, AltitudeProfile.FLAT_COLOR);
					gradientBg.addColorStop(xPoint, AltitudeProfile.STEEP_COLOR);
					currentSlopeType = SlopeType.STEEP;
				}
			}
		});
		// end with currentSlopeType - color
		if (currentSlopeType === SlopeType.STEEP) {
			gradientBg.addColorStop(1, AltitudeProfile.STEEP_COLOR);
		}
		else {
			gradientBg.addColorStop(1, AltitudeProfile.FLAT_COLOR);
		}
		return gradientBg;
	}

	/**
	 * @private
	 */
	async _getAltitudeProfile(coordinates) {
		try {
			const profile = await this._altitudeService.getProfile(coordinates);
			this.signal(Enrich_Profile_Data, profile);
		}
		catch (e) {
			console.warn(e.message);
			// Todo: emit error notification
			// this.signal(Update_Profile_Data, null);
		}
	}

	_getChartConfig(altitudeData, newDataLabels, newDataData) {
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
					x: { type: 'linear' },
					y: { type: 'linear', beginAtZero: false }, // HINT: UX decision
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
						text:
							'hier geht was ' +
							translate('altitudeProfile_distance') +
							', m / ' +
							translate('altitudeProfile_alt') +
							', m'
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

	_createChart(profile, newDataLabels, newDataData) {
		const ctx = this.shadowRoot.querySelector('.altitudeprofile').getContext('2d');
		this._chart = new Chart(ctx, this._getChartConfig(profile, newDataLabels, newDataData));
	}

	_updateOrCreateChart() {
		const { profile, labels, data } = this.getModel();
		if (profile === null) {
			return;
		}
		if (this._chart && this._chart.data && this._chart.data.datasets.length > 0) {
			this._updateChart(labels, data);
			return;
		}
		this._createChart(profile, labels, data);
	}

	static get STEEP_THRESHOLD() {
		return 0.02;
	}

	static get FLAT_COLOR() {
		return '#66eeff';
	}

	static get STEEP_COLOR() {
		return '#ee4444';
	}

	static get tag() {
		return 'ba-altitude-profile';
	}
}
