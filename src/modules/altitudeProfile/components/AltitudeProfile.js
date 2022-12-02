/* eslint-disable no-case-declarations */
import { html } from 'lit-html';
import css from './altitudeProfile.css';
import { MvuElement } from '../../MvuElement';
import Chart from 'chart.js/auto'; // Todo: Import single dependencies for tree shaking
import { $injector } from '../../../injection';
import { SurfaceType } from './SurfaceType';
import { AnotherType } from './AnotherType';
import { flatColor, hereStartsSteep, InclineType, startFlat, startSteep, steepColor } from '../utils/AltitudeProfileUtils';
import { nothing } from 'lit-html';

export const getStore = () => {
	const { StoreService: storeService } = $injector.inject('StoreService');
	return storeService.getStore();
};

const Update_Schema = 'update_schema';
const Update_Selected_Attribute = 'update_selected_attribute';
const Update_Profile_Data = 'update_altitude_data';

const lightBorderWidth = 4;

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
		this._initAnotherTypeTypes();
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
			case Update_Profile_Data:
				const profile = data;

				const labels = profile.alts.map((alt) => alt.dist);
				const chartData = profile.alts.map((alt) => alt.alt);

				profile.attrs.forEach((attr) => {
					const id = attr.id;

					attr.values.forEach((value) => {
						for (let index = value[0]; index <= value[1]; index++) {
							const elementValue = value[2];
							profile.alts[index][id] = elementValue;
						}
					});

					profile.alts.forEach((alt) => {
						if (!alt[id]) {
							alt[id] = 'missing';
						}
					});
				});

				return { ...model, profile, labels, data: chartData };

			case Update_Schema:
				return { ...model, darkSchema: data };

			case Update_Selected_Attribute:
				const selectedAttribute = data;
				const newLocal = { ...model, selectedAttribute };
				return newLocal;
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
            ${translate('altitudeProfile_sumUp')}: ${sumUp}
            ${translate('altitudeProfile_sumDown')}: ${sumDown}
           <span> 
              <select id="attrs"  @change=${onChange}>
                <option value="height" selected>height</option>
                ${model.profile.attrs.map((attr) => html` <option value="${attr.id}">${attr.id}</option> `)}
              </select>
            </span>
          </div>
          
        </div>
      </div>
    `;
	}

	_getChartData(altitudeData, newDataLabels, newDataData) {
		const _chartData = {
			labels: newDataLabels,
			datasets: [
				{
					data: newDataData,
					label: 'Höhenprofil',
					fill: true,
					borderWidth: lightBorderWidth,
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

	_getGradient(chart, altitudeData) {
		if (!altitudeData) {
			return;
		}
		if (!altitudeData.alts) {
			return;
		}
		if (altitudeData.alts.length === 0) {
			return;
		}

		const selectedAttribute = this.getModel().selectedAttribute;

		switch (selectedAttribute) {
			case 'slope':
				return this._getSlopeGradient(chart, altitudeData);

			case 'surface':
			case 'anotherType':
				return this._getTextTypeGradient(chart, altitudeData, selectedAttribute);

			default:
				// console.log('ToDo - unknown attribute');
				break;
		}
	}

	_getBackgroundColor(context, altitudeData) {
		const chart = context.chart;

		const selectedAttribute = this.getModel().selectedAttribute;
		if (selectedAttribute === 'surface') {
			return this._getGradient(chart, altitudeData);
		}

		if (selectedAttribute === 'slope') {
			return '#ddddff';
		}

		return '#88dd88';
	}

	_getBorderColor(context, altitudeData) {
		const chart = context.chart;

		const selectedAttribute = this.getModel().selectedAttribute;
		if (selectedAttribute === 'surface' || selectedAttribute === 'slope' || selectedAttribute === 'anotherType') {
			return this._getGradient(chart, altitudeData);
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
		return this._altitudeProfileAttributeTypes[attribute].find((element) => {
			return element._name === typeString;
		});
	}

	_initSurfaceTypes() {
		this._addAttributeType(new SurfaceType('asphalt', '#222222', '#444444'));
		this._addAttributeType(new SurfaceType('gravel', '#eeeeee', '#dddddd'));
		this._addAttributeType(new SurfaceType('missing', '#2222ee', '#ee2222'));
	}

	_initAnotherTypeTypes() {
		this._addAttributeType(new AnotherType('cycle', '#224488', '#44aa44'));
		this._addAttributeType(new AnotherType('foot', '#eeaaaa', '#ddaaaa'));
		this._addAttributeType(new AnotherType('car', '#aaeeee', '#aadddd'));
		this._addAttributeType(new AnotherType('missing', '#2222ee', '#ee2222'));
	}

	_getTextTypeGradient(chart, altitudeData, selectedAttribute) {
		const { ctx, chartArea } = chart;
		if (!chartArea) {
			return null;
		}

		const gradientBg = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
		const numberOfPoints = altitudeData.alts.length;
		const xPointWidth = chartArea.width / numberOfPoints;

		const altitudeProfileAttributeString = altitudeData.alts[0][selectedAttribute];
		let currentAltitudeProfileAttributeType = this.getAltitudeProfileAttributeType(selectedAttribute, altitudeProfileAttributeString);
		if (!currentAltitudeProfileAttributeType) {
			return;
		}
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
		if (!chartArea) {
			return null;
		}

		const gradientBg = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
		const numberOfPoints = altitudeData.alts.length;
		const xPointWidth = chartArea.width / numberOfPoints;

		// start gradient with 'flat' color
		gradientBg.addColorStop(0, flatColor);
		let currentInclineType = InclineType.Flat;

		altitudeData?.alts.forEach((element, index) => {
			if (currentInclineType === InclineType.Steep) {
				// look for first element with slope less than X
				if (!element.slope || element.slope <= hereStartsSteep) {
					const xPoint = (xPointWidth / chartArea.width) * index;
					currentInclineType = startFlat(gradientBg, xPoint, currentInclineType);
				}
			}
			else {
				// look for first element with slope greater X
				if (element.slope && element.slope > hereStartsSteep) {
					const xPoint = (xPointWidth / chartArea.width) * index;
					currentInclineType = startSteep(gradientBg, xPoint, currentInclineType);
				}
			}
		});

		// end with currentInclineType - color
		if (currentInclineType === InclineType.Steep) {
			gradientBg.addColorStop(1, steepColor);
		}
		else {
			gradientBg.addColorStop(1, flatColor);
		}

		return gradientBg;
	}

	/**
   * @private
   */
	async _getAltitudeProfile(coordinates) {
		if (coordinates.length > 0) {
			try {
				const profile = await this._altitudeService.getProfile(coordinates);
				this.signal(Update_Profile_Data, profile);
			}
			catch (e) {
				console.warn(e.message);
				// Todo: emit error notification
				// this.signal(Update_Profile_Data, null);
			}
		}
	}

	_getChartConfig(altitudeData, newDataLabels = [], newDataData = []) {
		const translate = (key) => this._translationService.translate(key);

		const _drawSelectionRect = (ctx) => {
			const { firstLeft, secondLeft, top, bottom } = getSelectionProps();

			ctx.save();
			ctx.fillStyle = '#aaaacc40';
			ctx.fillRect(firstLeft, top, secondLeft - firstLeft, bottom);
			ctx.restore();
		};

		const tooltipOptions = {
			displayColors: false,
			mode: 'index',
			intersect: false,
			callbacks: {
				// title: () => {
				//   return 'Header';
				// },
				// footer: () => {
				//   return 'Footer';
				// },
				label: (tooltipItem) => {
					let slope = '';
					let surface = '';
					const { parsed } = tooltipItem;
					const heightsElement = altitudeData.alts.find((element) => {
						return element.dist === parsed.x;
					});
					if (heightsElement) {
						if (heightsElement.slope) {
							slope = heightsElement.slope + '%';
						}
						else {
							slope = translate('altitudeProfile_unknown');
						}
						if (heightsElement.surface) {
							surface = heightsElement.surface;
						}
						else {
							surface = translate('altitudeProfile_unknown');
						}
					}

					const content = [
						translate('altitudeProfile_distance') + ': ' + tooltipItem.label + 'm',
						translate('altitudeProfile_elevation') + ': ' + tooltipItem.raw + 'm',
						translate('altitudeProfile_incline') + ': ' + slope,
						'surface: ' + surface
					];
					return content;
				}
			}
		};

		const selectedAreaBorderPlugin = {
			id: 'selectedAreaBorder',
			afterDraw(chart) {
				// , args, options
				const { drawSelectedAreaBorder } = getSelectionProps();
				if (!drawSelectedAreaBorder) {
					return;
				}
				const { ctx } = chart;
				_drawSelectionRect(ctx);
			}
		};
		altitudeData;

		const getSelectionProps = () => {
			return {
				mouseIsDown: this._mouseIsDown,
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

		const config = {
			type: 'line',
			data: this._getChartData(altitudeData, newDataLabels, newDataData),
			plugins: [
				selectedAreaBorderPlugin,
				{
					id: 'areaSelect',
					beforeEvent(chart, args) {
						const { mouseIsDown } = getSelectionProps();
						const event = args.event;
						if (!event) {
							return;
						}
						const { ctx, tooltip, chartArea } = chart;

						if (event.type === 'mousedown') {
							setMousedownProps(true, chartArea.top, chartArea.height, tooltip.caretX, false);
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

						if (event.type === 'mouseup' || event.type === 'mouseout') {
							setMouseupOrMouseoutProps(false, tooltip.caretX, true, true);
							return;
						}
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
						if (this._enableTooltip) {
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
						text: 'hier geht was ' + translate('altitudeProfile_distance') + ', m / ' + translate('altitudeProfile_elevation') + ', m'
					},
					legend: { display: false },
					tooltip: tooltipOptions
				}
			}
		};

		return config;
	}

	_createChart(profile, newDataLabels, newDataData) {
		if (!profile) {
			return;
		}
		if (this._chart) {
			this._chart.destroy();
		}
		const ctx = this.shadowRoot.querySelector('.altitudeprofile').getContext('2d');
		this._chart = new Chart(ctx, this._getChartConfig(profile, newDataLabels, newDataData));
	}

	_updateOrCreateChart() {
		const { profile, labels, data } = this.getModel();

		if (profile === null) {
			return;
		}

		if (this._chart && this._chart.data && this._chart.data.datasets.length > 0) {
			this._chart.data.labels = labels;
			this._chart.data.datasets[0].data = data;
			this._chart.update();

			return;
		}
		this._createChart(profile, labels, data);
	}

	static get tag() {
		return 'ba-altitudeprofile-n';
	}
}
