/**
 * @module modules/timeTravel/components/TimeTravelSlider
 */
import { html, nothing } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import { MvuElement } from '../../MvuElement';
import { setCurrentTimestamp } from '../../../store/timeTravel/timeTravel.action';
import { isFunction, isNumber } from '../../../utils/checks';
import { $injector } from '../../../injection';
import css from './timeTravelSlider.css';
import minusSvg from './assets/minusCircle.svg';
import playSvg from './assets/play.svg';
import plusSvg from './assets/plusCircle.svg';
import resetSvg from './assets/reset.svg';
import stopSvg from './assets/stop.svg';
import { debounced } from '../../../utils/timer';

export const TIMESPAN_DEBOUNCE_DELAY = 200;
const setDebouncedTimestamp = debounced(TIMESPAN_DEBOUNCE_DELAY, (timestamp) => setCurrentTimestamp(`${timestamp}`));

const Update_Timestamp = 'update_timestamp';
const Update_GeoResourceId = 'update_georesourceid';
const Update_IsPortrait = 'update_isPortrait';
const Update_IsPlaying = 'update_isPlaying';

const Range_Slider_Step = 1;

/**
 * Panel to control chronological data via slider
 *
 * @class
 * @property {string} geoResourceId the id of the GeoResource which have timestamps
 * @property {string} timestamp the current selected timestamp
 * @property {function(timestamp)} decadeFunction the decadeFunctions which checks whether or not the timestamp is the start of a decade
 * @author alsturm
 * @author thiloSchlemmer
 */
export class TimeTravelSlider extends MvuElement {
	#translationService;
	#geoResourceService;
	#decadeFunction;
	#timer;

	constructor() {
		super({
			timestamps: [],
			timestamp: null,
			isPortrait: false,
			isPlaying: false
		});

		const { TranslationService: translationService, GeoResourceService: geoResourceService } = $injector.inject(
			'TranslationService',
			'GeoResourceService'
		);

		this.#translationService = translationService;
		this.#geoResourceService = geoResourceService;
		this.#decadeFunction = this._isDecade;
	}

	update(type, data, model) {
		const fromGeoResource = (geoResourceId) => {
			const gr = this.#geoResourceService.byId(geoResourceId);
			return gr.hasTimestamps() ? gr.timestamps.map(Number) : [];
		};
		switch (type) {
			case Update_IsPortrait:
				return { ...model, ...data };
			case Update_GeoResourceId:
				return { ...model, timestamps: fromGeoResource(data), timestamp: model.timestamp ?? fromGeoResource(data)[0] };
			case Update_Timestamp:
				return { ...model, timestamp: parseInt(data) };
			case Update_IsPlaying:
				return { ...model, isPlaying: data };
		}
	}

	onInitialize() {
		this.observe(
			(state) => state.media,
			(media) => this.signal(Update_IsPortrait, { isPortrait: media.portrait })
		);
		this.observe(
			(state) => state.timeTravel.timestamp,
			(timestamp) => this.signal(Update_Timestamp, timestamp),
			false
		);
	}

	onDisconnect() {
		clearInterval(this.#timer);
		this.#timer = null;
	}

	createView(model) {
		const { timestamps, timestamp, isPortrait, isPlaying } = model;

		const min = timestamps.length !== 0 ? Math.min(...timestamps) : 0;
		const max = timestamps.length !== 0 ? Math.max(...timestamps) : 0;

		const arrayRange = (start, stop, step) => Array.from({ length: (stop - start) / step + 1 }, (value, index) => start + index * step);
		const timestampSteps = arrayRange(min, max, Range_Slider_Step);

		const setTimestamp = (timestamp) => {
			this.signal(Update_Timestamp, timestamp);
			setDebouncedTimestamp(timestamp);
		};

		const onChangeSelect = (e) => {
			const inputValue = e.target.value;
			if (inputValue === '') {
				e.target.value = min;
			}
			if (isNumber(inputValue, false)) {
				const candidate = parseInt(inputValue);
				if (candidate < min) {
					e.target.value = min;
				}
				if (candidate > max) {
					e.target.value = max;
				}
			}
			console.log(e.target.value);
			setTimestamp(parseInt(e.target.value));
		};

		const onChangeRangeSlider = (e) => {
			setTimestamp(parseInt(e.target.value));
		};

		const increaseTimestamp = () => {
			if (timestamp < max) {
				setTimestamp(timestamp + Range_Slider_Step);
			}
		};

		const decreaseTimestamp = () => {
			if (timestamp > min) {
				setTimestamp(timestamp - Range_Slider_Step);
			}
		};

		const start = () => {
			const start = this.shadowRoot.getElementById('start');
			const stop = this.shadowRoot.getElementById('stop');
			const slider = this.shadowRoot.getElementById('rangeSlider');

			start.classList.add('hide');
			stop.classList.remove('hide');
			clearInterval(this.#timer);
			this.#timer = setInterval(() => {
				const value = (+slider.value + Range_Slider_Step) % (+slider.getAttribute('max') + Range_Slider_Step);
				slider.value = value;
				slider.dispatchEvent(new Event('input'));
			}, TimeTravelSlider.TIME_INTERVAL_MS);
			this.signal(Update_IsPlaying, true);
		};

		const stop = () => {
			const start = this.shadowRoot.getElementById('start');
			const stop = this.shadowRoot.getElementById('stop');

			start.classList.remove('hide');
			stop.classList.add('hide');
			clearInterval(this.#timer);
			this.signal(Update_IsPlaying, false);
		};

		const reset = () => {
			const start = this.shadowRoot.getElementById('start');
			const stop = this.shadowRoot.getElementById('stop');

			start.classList.remove('hide');
			stop.classList.add('hide');
			clearInterval(this.#timer);
			setTimestamp(min);

			this.signal(Update_IsPlaying, false);
		};

		const getRangeBackground = () => {
			const fullRange = Array.from({ length: max - min + 1 }, (value, index) => min + index);

			return fullRange.map((timestamp) => {
				const classes = {
					active: timestamps.includes(timestamp),
					border: this.#decadeFunction(timestamp)
				};
				return html`<span class="range-bg  ${classMap(classes)}" data-timestamp="${timestamp}"></span>`;
			});
		};

		const getThumbWidth = () => {
			return 100 / (timestampSteps.length - 1);
		};

		const classContainer = {
			'is-portrait': isPortrait,
			'is-landscape': !isPortrait
		};

		const translate = (key) => this.#translationService.translate(key);
		return timestamps.length !== 0
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
									<div class="ba-form-element active-timestamp-input">
										<input
											?disabled=${isPlaying}
											id="timestampInput"
											type="number"
											min="${min}"
											max="${max}"
											.value="${timestamp}"
											@change=${onChangeSelect}
										/>
										<i class="bar"></i>
									</div>
								</div>
								<div>
									<ba-icon
										id="decrease"
										.icon="${minusSvg}"
										.color=${'var(--primary-color)'}
										.size=${isPortrait ? 2.8 : 1.9}
										.title=${translate('timeTravel_slider_decrease')}
										@click=${decreaseTimestamp}
									></ba-icon>
									<ba-icon
										id="increase"
										.icon="${plusSvg}"
										.color=${'var(--primary-color)'}
										.size=${isPortrait ? 2.8 : 1.9}
										.title=${translate('timeTravel_slider_increase')}
										@click=${increaseTimestamp}
									></ba-icon>
									<ba-icon
										id="start"
										.title=${translate('timeTravel_slider_start')}
										.size=${isPortrait ? 2.8 : 1.9}
										.type=${'primary'}
										.icon=${playSvg}
										@click=${start}
									></ba-icon>
									<ba-icon
										id="stop"
										.title=${translate('timeTravel_slider_stop')}
										.size=${isPortrait ? 2.8 : 1.9}
										class="hide"
										.type=${'primary'}
										.icon=${stopSvg}
										@click=${stop}
									></ba-icon>
									<ba-icon
										id="reset"
										.title=${translate('timeTravel_slider_reset')}
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
									.value="${timestamp}"
									@input=${onChangeRangeSlider}
								/>
								<div class="range-background">${getRangeBackground()}</div>
							</div>
						</div>
					</div>
				`
			: nothing;
	}

	_isDecade(timestamp) {
		return timestamp.toString().endsWith('0') ? true : false;
	}

	set decadeFunction(fn) {
		if (isFunction(fn)) this.#decadeFunction = fn;
	}

	get timestamp() {
		return this.getModel().timestamp;
	}

	set timestamp(value) {
		this.signal(Update_Timestamp, value);
	}

	set geoResourceId(value) {
		this.signal(Update_GeoResourceId, value);
	}

	static get tag() {
		return 'ba-time-travel-slider';
	}

	static get TIME_INTERVAL_MS() {
		return 2000;
	}
}
