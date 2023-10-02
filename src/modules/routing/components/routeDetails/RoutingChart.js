/**
 * @module modules/routing/components/routeDetails/RoutingChart
 */
import { html } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat.js';
import { classMap } from 'lit-html/directives/class-map.js';
import { MvuElement } from '../../../MvuElement';
import css from './routingChart.css';
import { $injector } from '../../../../injection/index';

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
 * Displays number values of in a chart with a legend.
 * @class
 * @property {Array<RoutingChartItem>} items the routing chart items
 * @author thiloSchlemmer
 */
export class RoutingChart extends MvuElement {
	constructor() {
		super({ items: [], label: null, collapsedChart: false });
		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
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

		const title = translate(collapsedChart ? 'routing_waypoints_show' : 'routing_waypoints_hide');

		const getChartStyle = (item) => {
			const { relative } = item.data;
			const style = `background-color:${item.color}; width: ${relative < 1 ? Math.ceil(relative) : Math.round(relative)}%;`;

			return item.image ? `${style}; background-image: ${item.image}` : style;
		};

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
				return value < 5000 ? value.toFixed(2) + ' km' : value.toFixed(0) + ' km';
			};

			return value < 1000 ? formattedInMeter(value) : formattedInKilometer(value);
		};

		// eslint-disable-next-line no-unused-vars
		const onMouseOut = (item) => {
			/**
			 * todo:
			 * implement EventLike store-operation to routing slice-of-state
			 *  type:'REMOVE_HIGHLIGHTED_SEGMENTS'
			 *  payload: {}
			 */
		};

		// eslint-disable-next-line no-unused-vars
		const onMouseOver = (item) => {
			/**
			 * todo:
			 * implement EventLike store-operation to routing slice-of-state
			 *  type:'HIGHLIGHT_SEGMENTS'
			 *  payload: { segments: item.segments, zoomToExtent: false }
			 */
		};

		return html`<style>
				${css}
			</style>
			<div class="container">
				<hr />
				<div class="chart-selector" title=${label} @click="${toggleCollapseChart}">
					<span class="title">${label}</span>
					<i class="icon chevron ${classMap(iconCollapseInfoClass)}"></i>
				</div>
				<div class="${classMap(bodyCollapseClassInfo)}">
					<div class="overflow-container">
						<div class="chart_section progress">
							${repeat(
								items,
								(chartItem) => chartItem.id,
								(chartItem, index) => html`<div class="progress-bar" style=${getChartStyle(chartItem)} title=${getChartTitle(chartItem)}></div>`
							)}
						</div>
						<div class="legend_section">
							${repeat(
								items,
								(legendItem) => legendItem.id,
								(legendItem, index) => html`
									<div
										class="highlight"
										title=${getChartTitle(legendItem)}
										@mouseover=${() => onMouseOver(legendItem)}
										@mouseout=${() => onMouseOut(legendItem)}
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
