/**
 * @module modules/timeTravel/TimeTravel
 */
import { html } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import { MvuElement } from '../MvuElement';
import { $injector } from '../../injection';
import toggleSvg from './assets/arrow.svg';
import minus from './assets/minusCircle.svg';
import startSvg from './assets/play.svg';
import plus from './assets/plusCircle.svg';
import resetSvg from './assets/reset.svg';
import stopSvg from './assets/stop.svg';
import css from './timeTravel.css';
import { changeZoom } from '../../store/position/position.action';

const Update_IsPortrait_HasMinWidth = 'update_isPortrait_hasMinWidth';
const Update_ZoomLevel_Property = 'update_zoomLevel_property';

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

/**
 * Panel to control historic data via slider
 *
 * @class
 * @author alsturm
 */
export class TimeTravel extends MvuElement {
	#environmentService;
	#translationService;

	constructor() {
		super({
			open: false,
			isPortrait: false
		});

		const { EnvironmentService: environmentService, TranslationService: translationService } = $injector.inject(
			'EnvironmentService',
			'TranslationService'
		);

		this.#environmentService = environmentService;
		this.#translationService = translationService;
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
			(media) => this.signal(Update_IsPortrait_HasMinWidth, { isPortrait: media.portrait, hasMinWidth: media.minWidth })
		);
	}

	isRenderingSkipped() {
		return this.#environmentService.isEmbedded();
	}

	createView(model) {
		const { isPortrait } = model;

		const getScaleOptions = (jears) => {
			return jears.map((j) => html`<option value=${j}>${j}</option> `);
		};
		const onChangeScale = () => {
			//TODO
		};

		const onJearClick = (jear, zoom = 0) => {
			const searchInput = this.shadowRoot.getElementById('rangeSlider');
			if (searchInput) {
				searchInput.value = jear;
				searchInput.dispatchEvent(new Event('input'));
				if (zoom) {
					changeZoom(zoom);
				}
			}
		};
		const increaseJear = () => {
			const select = this.shadowRoot.getElementById('select_jear');
			const newJear = parseInt(select.value);
			onJearClick(newJear + 1);
		};
		const decreaseJear = () => {
			const select = this.shadowRoot.getElementById('select_jear');
			const newJear = parseInt(select.value);
			onJearClick(newJear - 1);
		};

		const isActiveJear = (jear, zoom, itemjears = []) => {
			return itemjears.includes(jear.toString())
				? html`<span class="item active ${'y' + jear}" data-year="${jear}" title="${jear}" @click="${() => onJearClick(jear, zoom)}"
						><span> </span
					></span>`
				: html`<span class="item ${'y' + jear}" data-year="${jear}" title="${jear} "><span> </span></span>`;
		};

		const onChangeSliderWidth = (event) => {
			const select = this.shadowRoot.getElementById('select_jear');
			select.value = event.target.value;

			const items = this.shadowRoot.querySelectorAll('.item');
			items.forEach((item) => {
				item.classList.remove('active-item');
			});

			const searchInput = this.shadowRoot.querySelectorAll('.y' + event.target.value);
			searchInput.forEach((item) => {
				item.classList.add('active-item');
			});
		};

		let myTimer;

		const start = () => {
			const start = this.shadowRoot.getElementById('start');
			start.classList.add('hide');
			const stop = this.shadowRoot.getElementById('stop');
			stop.classList.remove('hide');

			const slider = this.shadowRoot.getElementById('rangeSlider');

			clearInterval(myTimer);
			myTimer = setInterval(function () {
				let value = (+slider.value + 1) % (+slider.getAttribute('max') + 1);
				if (value === 0) {
					value = +slider.getAttribute('min');
				}
				slider.value = value;
				slider.dispatchEvent(new Event('input'));
			}, 300);
		};
		const stop = () => {
			const start = this.shadowRoot.getElementById('start');
			start.classList.remove('hide');
			const stop = this.shadowRoot.getElementById('stop');
			stop.classList.add('hide');

			clearInterval(myTimer);
		};
		const reset = () => {
			const start = this.shadowRoot.getElementById('start');
			start.classList.remove('hide');

			const stop = this.shadowRoot.getElementById('stop');
			stop.classList.add('hide');

			clearInterval(myTimer);
			onJearClick(1834);
		};
		const toggle = () => {
			const containerMobeile = this.shadowRoot.querySelectorAll('.jear-container')[0];
			containerMobeile.classList.toggle('hide');

			const containerDesktop = this.shadowRoot.querySelectorAll('.container')[0];
			containerDesktop.classList.toggle('hide');
		};

		const arrayRange = (start, stop, step) => Array.from({ length: (stop - start) / step + 1 }, (value, index) => start + index * step);

		const jears = arrayRange(1834, 2020, 1);

		const classes = {
			'is-portrait': isPortrait,
			'is-landscape': !isPortrait
		};

		const translate = (key) => this.#translationService.translate(key);
		return html`
			<style>
				${css}
			</style>
			<div class="${classMap(classes)}">
				<div>
					<ba-icon
						id="increase"
						class="toggle"
						.icon="${toggleSvg}"
						.color=${'var(--text2)'}
						.size=${1.5}
						.title=${translate('')}
						@click=${toggle}
					></ba-icon>
					<h3>${translate('timeTravel_title')}</h3>
					<div class="container">
						${jsonMock.map(
							(item) => html`
								<div class="row">
									<span class="title" title="beste Darstellung Zoom ${item.zoomlevel}">${item.bezeichnung}</span>
									${jears.map((jear) => isActiveJear(jear, item.zoomlevel, item.years.split(',')))}
								</div>
							`
						)}
					</div>
					<div class="jear-container  hide">
						<ba-icon
							id="increase"
							.icon="${minus}"
							.color=${'var(--primary-color)'}
							.size=${2.2}
							.title=${translate('')}
							@click=${decreaseJear}
						></ba-icon>
						<select id="select_jear" @change=${onChangeScale}>
							${getScaleOptions(jears)}
						</select>
						<ba-icon
							id="decrease"
							.icon="${plus}"
							.color=${'var(--primary-color)'}
							.size=${2.2}
							.title=${translate('')}
							@click=${increaseJear}
						></ba-icon>
					</div>
					<div class="slider-container">
						<div class="slider-pre">
							<ba-icon id="start" .type=${'primary'} . .icon=${startSvg} @click=${start}></ba-icon>
							<ba-icon id="stop" class="hide" .type=${'primary'} .icon=${stopSvg} @click=${stop}></ba-icon>
							<ba-icon id="reset" .type=${'primary'} .icon=${resetSvg} @click=${reset}></ba-icon>
						</div>
						<input id="rangeSlider" class="slider" type="range" min="1834" max="2020" value="1" @input=${onChangeSliderWidth} />
						<div class="slider-after"></div>
					</div>
				</div>
				<div class="button-container"></div>
			</div>
		`;
	}

	static get tag() {
		return 'ba-time-travel';
	}
}
