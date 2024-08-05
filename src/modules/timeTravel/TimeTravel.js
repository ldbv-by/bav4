/**
 * @module modules/timeTravel/TimeTravel
 */
import { html } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import { MvuElement } from '../MvuElement';
import { $injector } from '../../injection';
import { changeZoom } from '../../store/position/position.action';
import css from './timeTravel.css';
import arrowDownSvg from './assets/chevron-down.svg';
import arrowUpSvg from './assets/chevron-up.svg';
import minusSvg from './assets/minusCircle.svg';
import playSvg from './assets/play.svg';
import plusSvg from './assets/plusCircle.svg';
import resetSvg from './assets/reset.svg';
import stopSvg from './assets/stop.svg';

const Update_IsPortrait_HasMinWidth = 'update_isPortrait_hasMinWidth';

const jsonMock = [
	{
		json_featuretype: 'metamap',
		bezeichnung: 'Topographischer Atlas des Königreiches Bayern 1:50000',
		years:
			'1834,1842,1880,1893,1894,1898,1903,1906,1907,1909,1911,1912,1913,1914,1915,1916,1917,1919,1920,1921,1922,1923,1924,1925,1926,1928,1929,1930,1931,1932,1933,1934,1935,1936,1937,1938,1939,1940,1941,1942,1943,1944,1945,1946,1947,1948,1949,1950,1951,1952,1953,1954,1955,1956,1957,1958,1959,1960',
		zoomlevel: 9
	},
	{
		json_featuretype: 'metamap',
		bezeichnung: 'Karte von Südwestdeutschland 1:250000',
		years:
			'1857,1860,1910,1913,1915,1916,1918,1919,1920,1921,1923,1929,1930,1932,1933,1934,1935,1939,1940,1941,1946,1947,1949,1950,1951,1952,1953,1955,1956',
		zoomlevel: 7
	},
	{
		json_featuretype: 'metamap',
		bezeichnung: 'Topographische Karte 1:25000',
		years:
			'1856,1891,1919,1924,1925,1926,1929,1930,1931,1932,1933,1934,1935,1936,1937,1938,1939,1940,1941,1942,1943,1944,1945,1946,1947,1948,1949,1950,1951,1952,1953,1954,1955,1956,1957,1958,1959,1960,1961,1962,1963,1964,1965,1966,1967,1968,1969,1970,1971,1972,1973,1974,1975,1976,1977,1978,1979,1980,1981,1982,1983,1984,1985,1986,1987,1988,1989,1990,1991,1992,1993,1994,1995,1996,1997,1998,1999,2000,2001,2002,2003,2004,2005,2006,2007,2008',
		zoomlevel: 10
	},
	{
		json_featuretype: 'metamap',
		bezeichnung: 'Positionsblatt 1:25000',
		years:
			'1869,1873,1880,1881,1884,1885,1887,1888,1890,1891,1893,1894,1895,1896,1900,1901,1902,1903,1904,1905,1906,1907,1908,1909,1910,1911,1912,1913,1914,1915,1917,1918,1919,1920,1921,1922,1923,1924,1925,1926,1927,1928,1929,1930,1931,1932,1933,1934,1935,1936,1937,1938,1939,1940,1941,1942,1943,1944,1945,1946,1947,1948,1949,1950,1951,1952,1953,1954,1955,1956,1957',
		zoomlevel: 10
	},
	{
		json_featuretype: 'metamap',
		bezeichnung: 'Karte des Deutschen Reiches 1:100000',
		years:
			'1886,1890,1891,1893,1894,1896,1898,1899,1900,1901,1902,1903,1904,1906,1907,1908,1909,1910,1911,1912,1913,1914,1915,1916,1917,1919,1920,1921,1922,1923,1924,1926,1927,1928,1929,1930,1931,1932,1933,1934,1935,1936,1937,1938,1939,1940,1941,1942,1943,1946,1947,1948,1949,1950,1951,1952,1953,1954,1955,1956,1957,1958,1959,1960,1962,1963,1965',
		zoomlevel: 8
	},

	{
		json_featuretype: 'metamap',
		bezeichnung: 'Deutsche Karte 1:50000',
		years: '1921,1923,1924,1927,1937,1939,1940,1949,1951',
		zoomlevel: 9
	},
	{
		json_featuretype: 'metamap',
		bezeichnung: 'Topographische Karte 1:50000',
		years:
			'1957,1958,1959,1960,1961,1962,1963,1964,1965,1966,1967,1968,1969,1970,1971,1972,1973,1974,1975,1976,1977,1978,1979,1980,1981,1982,1983,1984,1985,1986,1987,1988,1989,1990,1991,1992,1993,1994,1995,1996,1997,1998,1999,2000,2001,2002,2003,2004,2005,2006,2007,2008',
		zoomlevel: 9
	},
	{
		json_featuretype: 'metamap',
		bezeichnung: 'Topographische Übersichtskarte 1:200000',
		years:
			'1963,1964,1965,1967,1968,1974,1975,1976,1977,1978,1979,1980,1981,1982,1983,1984,1985,1986,1987,1988,1989,1990,1991,1992,1993,1994,1996,1997,1998',
		zoomlevel: 7
	},
	{
		json_featuretype: 'metamap',
		bezeichnung: 'Topographische Karte 1:100000',
		years:
			'1971,1972,1973,1974,1975,1976,1977,1978,1979,1980,1981,1982,1983,1984,1985,1986,1987,1988,1989,1990,1991,1992,1993,1994,1995,1996,1997,1998,1999,2000,2001,2002,2003,2005',
		zoomlevel: 8
	},
	{
		json_featuretype: 'metamap',
		bezeichnung: 'Übersichtskarte von Bayern 1:500000',
		years: '1971,1976,1980,1983,1988,1994,1996,1999,2001,2003,2004,2005',
		zoomlevel: 6
	}
];

const Time_Interval = 1000;
const Initial_Value = 1834;
const Min = 1834;
const Max = 2014;

/**
 * Panel to control chronological data via slider
 *
 * @class
 * @author alsturm
 */
export class TimeTravel extends MvuElement {
	#environmentService;
	#translationService;

	#isOpen;
	#myTimer;

	constructor() {
		super({
			isPortrait: false
		});

		const { EnvironmentService: environmentService, TranslationService: translationService } = $injector.inject(
			'EnvironmentService',
			'TranslationService'
		);

		this.#environmentService = environmentService;
		this.#translationService = translationService;

		this.#isOpen = false;
	}

	update(type, data, model) {
		switch (type) {
			case Update_IsPortrait_HasMinWidth:
				return { ...model, ...data };
		}
	}

	onInitialize() {
		this.observe(
			(state) => state.media,
			(media) => this.signal(Update_IsPortrait_HasMinWidth, { isPortrait: media.portrait })
		);
	}

	isRenderingSkipped() {
		return this.#environmentService.isEmbedded();
	}

	createView(model) {
		const { isPortrait } = model;

		const arrayRange = (start, stop, step) => Array.from({ length: (stop - start) / step + 1 }, (value, index) => start + index * step);
		const years = arrayRange(Min, Max, 1);
		const yearsActiveMap = new Map();

		const getSelectOptions = (years) => {
			return years.map((year) => html`<option ?selected=${year.toString() === Initial_Value.toString()} value=${year}>${year}</option> `);
		};

		const onChange = (e) => {
			const rangeSlider = this.shadowRoot.getElementById('rangeSlider');
			rangeSlider.value = e.target.value;
			rangeSlider.dispatchEvent(new Event('input'));
		};

		const onChangeRange = (event) => {
			//select
			const select = this.shadowRoot.getElementById('yearSelect');
			select.value = event.target.value;

			//reset color
			const items = this.shadowRoot.querySelectorAll('.item');
			items.forEach((item) => {
				item.classList.remove('activeItem');
			});

			//set color
			const searchInput = this.shadowRoot.querySelectorAll('.data [data-year="' + event.target.value + '"]');
			searchInput.forEach((item) => {
				item.classList.add('activeItem');
			});
		};

		const setYear = (years, zoom = 0) => {
			const rangeSlider = this.shadowRoot.getElementById('rangeSlider');
			rangeSlider.value = years;
			rangeSlider.dispatchEvent(new Event('input'));
			if (zoom) changeZoom(zoom);
		};

		const increaseYear = () => {
			const select = this.shadowRoot.getElementById('yearSelect');
			setYear(parseInt(select.value) + 1);
		};

		const decreaseYear = () => {
			const select = this.shadowRoot.getElementById('yearSelect');
			setYear(parseInt(select.value) - 1);
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
				activeItem: year.toString() === Initial_Value.toString()
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

		const start = () => {
			const start = this.shadowRoot.getElementById('start');
			const stop = this.shadowRoot.getElementById('stop');
			const slider = this.shadowRoot.getElementById('rangeSlider');

			start.classList.add('hide');
			stop.classList.remove('hide');
			clearInterval(this.#myTimer);
			this.#myTimer = setInterval(function () {
				const value = (+slider.value + 1) % (+slider.getAttribute('max') + 1);
				if (value === 0) {
					slider.value = +slider.getAttribute('min');
				}
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
			setYear(Min);
		};

		const toggle = () => {
			const data = this.shadowRoot.getElementById('data');

			this.#isOpen = !this.#isOpen;
			this.#isOpen ? data.classList.remove('hide') : data.classList.add('hide');
		};

		const getIcon = () => {
			return this.#isOpen ? arrowDownSvg : arrowUpSvg;
		};

		const classContainer = {
			'is-portrait': isPortrait,
			'is-landscape': !isPortrait
		};

		const classData = {
			hide: !this.#isOpen
		};

		const translate = (key) => this.#translationService.translate(key);
		return html`
			<style>
				${css}
			</style>
			<div class="${classMap(classContainer)}">
				<h3 class="header  ">${translate('timeTravel_title')}</h3>
				<div id="data" class="data ${classMap(classData)}">
					${jsonMock.map(
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
							<select id="yearSelect" @change=${onChange}>
								${getSelectOptions(years)}
							</select>
							<ba-button id="buttonData" .label=${translate('timeTravel_data')} .icon=${getIcon()} .type=${'secondary'} @click=${toggle}></ba-button>
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
						<input id="rangeSlider" class="slider" type="range" min="${Min}" max="${Max}" value="${Initial_Value}" @input=${onChangeRange} />
						<div class="range-background">${getRangeBackground(yearsActiveMap)}</div>
					</div>
				</div>
			</div>
		`;
	}

	static get tag() {
		return 'ba-time-travel';
	}
}
