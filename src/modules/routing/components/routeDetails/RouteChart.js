/**
 * @module modules/routing/components/routeDetails/RouteChart
 */
import { html } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat.js';
import { classMap } from 'lit-html/directives/class-map.js';
import { MvuElement } from '../../../MvuElement';
import Chart from 'chart.js/auto';
import css from './routeChart.css';
import { $injector } from '../../../../injection/index';
import { resetHighlightedSegments, setHighlightedSegments } from '../../../../store/routing/routing.action';

/**
 * @typedef {Object} RoutingChartData
 * @property {number} absolute The absolute value in meters of this chart item
 * @property {number} relative The relative (%) value of this chart item
 * @property {Array<number>} segments The indices of the route segments related to this chart item
 */

/**
 * @typedef {Object} RoutingChartItem
 * @property {number} id The id of this chart item
 * @property {string} label The label of this chart item
 * @property {RoutingChartData} data The data of this chart item
 * @property {string} image the stringified image, visualizing the chart item
 * @property {string} color the stringified color as rgba-value
 */

const Update_Items = 'update_items';
const Update_Label = 'update_label';
const Update_Collapsed_Chart = 'update_collapsed_chart';

/**
 * Displays the number values in a chart with a legend.
 * @class
 * @property {Array<RoutingChartItem>} items the route chart items
 * @property {string} label the route chart label
 * @author thiloSchlemmer
 */
export class RouteChart extends MvuElement {
	constructor() {
		super({ items: [], label: null, collapsedChart: false });
		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
		this._chart = null;
	}

	update(type, data, model) {
		switch (type) {
			case Update_Items:
				return { ...model, items: [...data] };
			case Update_Label:
				return { ...model, label: data };
			case Update_Collapsed_Chart:
				return { ...model, collapsedChart: data };
		}
	}

	onAfterRender() {
		this._updateOrCreateChart();
	}

	createView(model) {
		const { items, label, collapsedChart } = model;

		const translate = (key) => this._translationService.translate(key);
		const toggleCollapseChart = () => {
			this.signal(Update_Collapsed_Chart, !collapsedChart);
		};

		const bodyCollapseClassInfo = {
			iscollapsed: !collapsedChart
		};
		const iconCollapseInfoClass = {
			iconexpand: collapsedChart
		};

		const title = translate(collapsedChart ? 'routing_chart_hide' : 'routing_chart_show');

		const getChartTitle = (item) => {
			const { relative } = item.data;
			return `${relative < 1 ? '<' + Math.ceil(relative) : Math.round(relative)}%`;
		};

		const getLegendStyle = (item) => {
			const style = 'background-color:' + item.color;

			return item.image ? `${style}; background-image: ${item.image}` : style;
		};

		const getLegendValue = (item) => {
			const value = item.data.absolute;

			const formattedInMeter = (value) => value.toFixed(0) + ' m';
			const formattedInKilometer = (value) => {
				const meterInKilometer = (value) => value / 1000;
				return value < 5000 ? meterInKilometer(value).toFixed(2) + ' km' : meterInKilometer(value).toFixed(0) + ' km';
			};

			return value < 1000 ? formattedInMeter(value) : formattedInKilometer(value);
		};

		const onMouseOver = (item) => {
			setHighlightedSegments({ segments: item.data.segments, zoomToExtent: false });
		};

		return html`<style>
				${css}
			</style>
			<div class="container">
				<div class="chart-selector" title=${title} @click="${toggleCollapseChart}">
					<span class="title">${label}</span>
					<i class="icon chevron ${classMap(iconCollapseInfoClass)}"></i>
				</div>
				<div class="${classMap(bodyCollapseClassInfo)}">
					<div class="overflow-container">
						<canvas class="chart_section donut"></canvas>
						<div class="legend_section">
							${repeat(
								items,
								(legendItem) => legendItem.id,
								(legendItem) => html`
									<div
										class="highlight"
										title=${getChartTitle(legendItem)}
										@mouseover=${() => onMouseOver(legendItem)}
										@mouseout=${() => resetHighlightedSegments()}
									>
										<div class="legend_item" style=${getLegendStyle(legendItem)}></div>
										<span class="legend_item_label"> ${legendItem.label}:</span>
										<span> ${getLegendValue(legendItem)}</span>
									</div>
								`
							)}
						</div>
					</div>
				</div>
			</div>`;
	}

	_getChartConfig(items, title) {
		const getLegendValue = (item) => {
			const value = item.data.absolute;

			const formattedInMeter = (value) => value.toFixed(0) + ' m';
			const formattedInKilometer = (value) => {
				const meterInKilometer = (value) => value / 1000;
				return value < 5000 ? meterInKilometer(value).toFixed(2) + ' km' : meterInKilometer(value).toFixed(0) + ' km';
			};

			return value < 1000 ? formattedInMeter(value) : formattedInKilometer(value);
		};

		const data = {
			labels: items.map((item) => item.label),
			datasets: [
				{
					label: title,
					data: items.map((item) => (item.data.relative ? Math.max(item.data.relative, 1) : item.data.relative)),
					backgroundColor: items.map((item) => item.color),
					hoverBorderWidth: 2,
					hoverOffset: 4
				}
			]
		};
		return {
			type: 'doughnut',
			data: data,
			options: {
				onHover: (event, elements) => (elements.length === 0 ? resetHighlightedSegments() : () => {}),
				plugins: {
					legend: {
						display: false
					},
					tooltip: {
						enabled: true,
						mode: 'nearest',
						callbacks: {
							label: (tooltipItem) => {
								const item = items[tooltipItem.dataIndex];
								setHighlightedSegments({ segments: item.data.segments, zoomToExtent: false });
								const value = getLegendValue(item);
								return `${value}`;
							}
						}
					}
				},
				borderWidth: 0,
				borderAlign: 'inner',
				cutout: '80%'
			}
		};
	}

	_createChart(items, label) {
		const ctx = this.shadowRoot.querySelector('.donut').getContext('2d');
		this._chart = new Chart(ctx, this._getChartConfig(items, label));
	}

	_destroyChart() {
		if (this._chart) {
			this._chart.clear();
			this._chart.destroy();
			delete this._chart;
		}
	}

	_updateOrCreateChart() {
		const { items, label } = this.getModel();
		this._destroyChart();
		this._createChart(items, label);
	}

	set items(values) {
		if (Array.isArray(values)) {
			this.signal(Update_Items, values);
		}
	}

	set label(value) {
		this.signal(Update_Label, value ?? '');
	}

	static get tag() {
		return 'ba-routing-chart';
	}
}
