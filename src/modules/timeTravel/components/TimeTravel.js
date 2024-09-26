/**
 * @module modules/timeTravel/components/TimeTravel
 */
import { html, nothing } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import { MvuElement } from '../../MvuElement';
import { $injector } from '../../../injection';
import { changeZoom } from '../../../store/position/position.action';
import css from './timeTravel.css';
import arrowDownSvg from './assets/chevron-down.svg';
import arrowUpSvg from './assets/chevron-up.svg';
import minusSvg from './assets/minusCircle.svg';
import playSvg from './assets/play.svg';
import plusSvg from './assets/plusCircle.svg';
import resetSvg from './assets/reset.svg';
import stopSvg from './assets/stop.svg';

const Update_Timestamp = 'update_timestamp';
const Update_GeoResourceId = 'update_georesourceid';
const Update_IsPortrait = 'update_isPortrait';

const Time_Interval = 1000;
const Range_Slider_Step = 1;

/**
 * Panel to control chronological data via slider
 *
 * @class
 * @author alsturm
 */
export class TimeTravel extends MvuElement {
	#environmentService;
	#translationService;
	#geoResourceService;
	#isOpen;
	#myTimer;

	constructor() {
		super({
			timestamps: null,
			activeTimestamp: null,
			min: null,
			max: null,
			isPortrait: false
		});

		const {
			EnvironmentService: environmentService,
			TranslationService: translationService,
			GeoResourceService: geoResourceService
		} = $injector.inject('EnvironmentService', 'TranslationService', 'GeoResourceService');

		this.#environmentService = environmentService;
		this.#translationService = translationService;
		this.#geoResourceService = geoResourceService;

		this.#isOpen = false;
	}

	update(type, data, model) {
		const fromGeoResource = (geoResourceId) => {
			const gr = this.#geoResourceService.byId(geoResourceId);
			return gr.hasTimestamps() ? gr.timestamps : [];
		};
		switch (type) {
			case Update_IsPortrait:
				return { ...model, ...data };
			case Update_GeoResourceId:
				return { ...model, timestamps: fromGeoResource(data) };
			case Update_Timestamp:
				return {
					...model,
					activeTimestamp: data
				};
		}
	}

	onInitialize() {
		this.observe(
			(state) => state.media,
			(media) => this.signal(Update_IsPortrait, { isPortrait: media.portrait })
		);
	}

	isRenderingSkipped() {
		return this.#environmentService.isEmbedded();
	}

	createView(model) {
		const { timestamps, isPortrait, activeTimestamp } = model;
		const min = Math.min(...timestamps);
		const max = Math.max(...timestamps);
		const initialValue = min;
		const arrayRange = (start, stop, step) => Array.from({ length: (stop - start) / step + 1 }, (value, index) => start + index * step);
		const years = arrayRange(min, max, Range_Slider_Step);

		const setYear = (year, zoom = 0) => {
			this.signal(Update_Timestamp, year);
			if (zoom) changeZoom(zoom);
		};

		const onChangeSelect = (e) => {
			setYear(parseInt(e.target.value));
		};

		const onChangeRangeSlider = (e) => {
			setYear(parseInt(e.target.value));
		};

		const increaseYear = () => {
			if (activeTimestamp < max) {
				setYear(activeTimestamp + Range_Slider_Step);
			}
		};

		const decreaseYear = () => {
			if (activeTimestamp > min) {
				setYear(activeTimestamp - Range_Slider_Step);
			}
		};

		const start = () => {
			const start = this.shadowRoot.getElementById('start');
			const stop = this.shadowRoot.getElementById('stop');
			const slider = this.shadowRoot.getElementById('rangeSlider');

			start.classList.add('hide');
			stop.classList.remove('hide');
			clearInterval(this.#myTimer);
			this.#myTimer = setInterval(function () {
				const value = (+slider.value + Range_Slider_Step) % (+slider.getAttribute('max') + Range_Slider_Step);
				slider.value = value;
				slider.dispatchEvent(new Event('input'));
			}, Time_Interval);
		};

		const stop = () => {
			const start = this.shadowRoot.getElementById('start');
			const stop = this.shadowRoot.getElementById('stop');

			start.classList.remove('hide');
			stop.classList.add('hide');
			clearInterval(this.#myTimer);
		};

		const reset = () => {
			const start = this.shadowRoot.getElementById('start');
			const stop = this.shadowRoot.getElementById('stop');

			start.classList.remove('hide');
			stop.classList.add('hide');
			clearInterval(this.#myTimer);
			setYear(min);
		};

		const getSelectOptions = (years) => {
			return years.map((year) => html`<option ?selected=${year === activeTimestamp} value=${year}>${year}</option> `);
		};

		const isDecade = (year) => {
			return year.toString().endsWith('0') ? true : false;
		};

		const getRangeBackground = () => {
			const fullRange = Array.from({ length: max - min }, (value, index) => min + index);

			return fullRange.map((timestamp) => {
				const classes = {
					active: timestamps.includes(timestamp),
					border: isDecade(timestamp)
				};
				return html`<span class="range-bg  ${classMap(classes)}" data-year="${timestamp}"></span>`;
			});
		};

		const getThumbWidth = () => {
			return 100 / (years.length - 1);
		};

		const classContainer = {
			'is-portrait': isPortrait,
			'is-landscape': !isPortrait
		};

		const translate = (key) => this.#translationService.translate(key);

		//reset data color
		const items = this.shadowRoot.querySelectorAll('.item');
		items.forEach((item) => {
			item.classList.remove('activeItem');
		});

		//set data color
		const activeItem = this.shadowRoot.querySelectorAll('.data [data-year="' + activeTimestamp + '"]');
		activeItem.forEach((item) => {
			item.classList.add('activeItem');
		});

		return timestamps.length !== 0 && initialValue && min & max
			? html`
					<style>
						input {
							--thumb-width: ${getThumbWidth()}%;
						}
					</style>
					<style>
						${css}
					</style>
					<div class="${classMap(classContainer)}">
						<h3 class="header  ">${translate('timeTravel_title')}</h3>
						<div id="base" class="base">
							<div class="actions">
								<div>
									<select id="yearSelect" class="hide" @change=${onChangeSelect}>
										${getSelectOptions(years)}
									</select>
									<div class="ba-form-element active-year-input">
										<input id="yearInput" type="number" min="${min}" max="${max}" .value="${activeTimestamp}" @change=${onChangeSelect} />
										<i class="bar"></i>
									</div>
								</div>
								<div>
									<ba-icon
										id="decrease"
										.icon="${minusSvg}"
										.color=${'var(--primary-color)'}
										.size=${isPortrait ? 2.8 : 1.9}
										.title=${translate('timeTravel_decrease')}
										@click=${decreaseYear}
									></ba-icon>
									<ba-icon
										id="increase"
										.icon="${plusSvg}"
										.color=${'var(--primary-color)'}
										.size=${isPortrait ? 2.8 : 1.9}
										.title=${translate('timeTravel_increase')}
										@click=${increaseYear}
									></ba-icon>
									<ba-icon
										id="start"
										.title=${translate('timeTravel_start')}
										.size=${isPortrait ? 2.8 : 1.9}
										.type=${'primary'}
										.
										.icon=${playSvg}
										@click=${start}
									></ba-icon>
									<ba-icon
										id="stop"
										.title=${translate('timeTravel_stop')}
										.size=${isPortrait ? 2.8 : 1.9}
										class="hide"
										.type=${'primary'}
										.icon=${stopSvg}
										@click=${stop}
									></ba-icon>
									<ba-icon
										id="reset"
										.title=${translate('timeTravel_reset')}
										.size=${isPortrait ? 3.1 : 2.1}
										.type=${'primary'}
										.icon=${resetSvg}
										@click=${reset}
									></ba-icon>
								</div>
							</div>
							<div class="slider">
								<input
									id="rangeSlider"
									type="range"
									step="${Range_Slider_Step}"
									min="${min}"
									max="${max}"
									.value="${activeTimestamp}"
									@input=${onChangeRangeSlider}
								/>
								<div class="range-background">${getRangeBackground()}</div>
							</div>
						</div>
					</div>
				`
			: nothing;
	}

	get timestamp() {
		return this.getModel().timestamp;
	}

	set timestamp(value) {
		this.signal(Update_Timestamp, value);
	}

	get geoResourceId() {
		return this.getModel().geoResourceId;
	}

	set geoResourceId(value) {
		this.signal(Update_GeoResourceId, value);
	}

	static get tag() {
		return 'ba-time-travel-slider';
	}
}
