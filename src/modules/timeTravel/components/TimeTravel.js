/**
 * @module modules/timeTravel/TimeTravel
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

const Update_TimeTravel_Data = 'update_profile_data';
const Update_Active_Year = 'update_active_year';
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
	#timeTravelService;
	#isOpen;
	#myTimer;

	constructor() {
		super({
			data: null,
			activeYear: null,
			min: null,
			max: null,
			isPortrait: false
		});

		const {
			EnvironmentService: environmentService,
			TranslationService: translationService,
			TimeTravelService: timeTravelService
		} = $injector.inject('EnvironmentService', 'TranslationService', 'TimeTravelService');

		this.#environmentService = environmentService;
		this.#translationService = translationService;
		this.#timeTravelService = timeTravelService;

		this.#isOpen = false;
	}

	update(type, data, model) {
		switch (type) {
			case Update_IsPortrait:
				return { ...model, ...data };
			case Update_TimeTravel_Data:
				return { ...model, ...data };
			case Update_Active_Year:
				return {
					...model,
					activeYear: data
				};
		}
	}

	onInitialize() {
		this.observe(
			(state) => state.media,
			(media) => this.signal(Update_IsPortrait, { isPortrait: media.portrait })
		);
		this._loadData();
	}

	async _loadData() {
		const data = await this.#timeTravelService.all();
		const initialValue = await this.#timeTravelService.getInitialValue();
		const min = await this.#timeTravelService.getMin();
		const max = await this.#timeTravelService.getMax();
		if (data) {
			this.signal(Update_TimeTravel_Data, { data: data, initialValue: initialValue, min: min, max: max, activeYear: initialValue });
		}
	}

	isRenderingSkipped() {
		return this.#environmentService.isEmbedded();
	}

	createView(model) {
		const { data, initialValue, min, max, isPortrait, activeYear } = model;

		const arrayRange = (start, stop, step) => Array.from({ length: (stop - start) / step + 1 }, (value, index) => start + index * step);
		const years = arrayRange(min, max, Range_Slider_Step);
		const yearsActiveMap = new Map();

		const setYear = (year, zoom = 0) => {
			this.signal(Update_Active_Year, year);
			if (zoom) changeZoom(zoom);
		};

		const onChangeSelect = (e) => {
			setYear(parseInt(e.target.value));
		};

		const onChangeRangeSlider = (e) => {
			setYear(parseInt(e.target.value));
		};

		const increaseYear = () => {
			if (activeYear < max) {
				setYear(activeYear + Range_Slider_Step);
			}
		};

		const decreaseYear = () => {
			if (activeYear > min) {
				setYear(activeYear - Range_Slider_Step);
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
			return years.map((year) => html`<option ?selected=${year === activeYear} value=${year}>${year}</option> `);
		};

		const isDecade = (year) => {
			return year.toString().endsWith('0') ? true : false;
		};

		const isHalfCentury = (year) => {
			return year.toString().endsWith('50') || year.toString().endsWith('00') ? true : false;
		};

		const getYearItems = (year, yearsActiveMap, zoom, itemYear = []) => {
			//fill Map
			if (itemYear.includes(year.toString())) {
				yearsActiveMap.set(year, true);
			} else {
				if (!yearsActiveMap.has(year)) yearsActiveMap.set(year, false);
			}

			const classes = {
				border: isHalfCentury(year),
				activeItem: year.toString() === initialValue.toString()
			};

			return itemYear.includes(year.toString())
				? html`<span class="item active ${classMap(classes)}" data-year="${year}" title="${year}" @click="${() => setYear(year, zoom)}"></span>`
				: html`<span class="item ${classMap(classes)}" data-year="${year}" title="${year} "></span>`;
		};

		const getRangeBackground = (yearsActive) => {
			const sortedMap = new Map([...yearsActive.entries()].sort());
			const array = Array.from(sortedMap, ([year, active]) => ({ year, active }));
			return array.map((item) => {
				const classes = {
					active: item.active,
					border: isDecade(item.year)
				};
				return html`<span class="range-bg  ${classMap(classes)}" data-year="${item.year}"></span>`;
			});
		};

		const toggle = () => {
			const data = this.shadowRoot.getElementById('data');

			this.#isOpen = !this.#isOpen;
			this.#isOpen ? data.classList.remove('hide') : data.classList.add('hide');
		};

		const getIcon = () => {
			return this.#isOpen ? arrowDownSvg : arrowUpSvg;
		};

		const getThumbWidth = () => {
			return 100 / (years.length - 1);
		};

		const classContainer = {
			'is-portrait': isPortrait,
			'is-landscape': !isPortrait
		};

		const classData = {
			hide: !this.#isOpen
		};

		const translate = (key) => this.#translationService.translate(key);

		//reset data color
		const items = this.shadowRoot.querySelectorAll('.item');
		items.forEach((item) => {
			item.classList.remove('activeItem');
		});

		//set data color
		const searchInput = this.shadowRoot.querySelectorAll('.data [data-year="' + activeYear + '"]');
		searchInput.forEach((item) => {
			item.classList.add('activeItem');
		});

		return data && initialValue && min & max
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
						<div id="data" class="data ${classMap(classData)}">
							${data.map(
								(item) =>
									html`<div class="row">
										<span class="title" title="beste Darstellung Zoom ${item.zoomlevel}">${item.bezeichnung}</span>
										${years.map((year) => getYearItems(year, yearsActiveMap, item.zoomlevel, item.years.split(',')))}
									</div>`
							)}
						</div>
						<div id="base" class="base">
							<div class="actions">
								<div>
									<select id="yearSelect" @change=${onChangeSelect}>
										${getSelectOptions(years)}
									</select>
									<ba-button
										id="buttonData"
										.label=${translate('timeTravel_data')}
										.icon=${getIcon()}
										.type=${'secondary'}
										@click=${toggle}
									></ba-button>
								</div>
								<div>
									<ba-icon
										id="increase"
										.icon="${minusSvg}"
										.color=${'var(--primary-color)'}
										.size=${isPortrait ? 2.8 : 1.9}
										.title=${translate('timeTravel_decrease')}
										@click=${decreaseYear}
									></ba-icon>
									<ba-icon
										id="decrease"
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
									class="slider"
									type="range"
									step="${Range_Slider_Step}"
									min="${min}"
									max="${max}"
									.value="${activeYear}"
									@input=${onChangeRangeSlider}
								/>
								<div class="range-background">${getRangeBackground(yearsActiveMap)}</div>
							</div>
						</div>
					</div>
				`
			: nothing;
	}

	static get tag() {
		return 'ba-time-travel';
	}
}
