/**
 * @module modules/chips/components/chipsContainer/ChipsContainer
 */
import { html, nothing } from 'lit-html';
import { $injector } from '../../../../injection';
import css from './chipsContainer.css';
import { MvuElement } from '../../../MvuElement';
import { openModal } from '../../../../store/modal/modal.action';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg.js';
import { classMap } from 'lit-html/directives/class-map.js';
import { addLayerIfNotPresent } from '../../../../store/layers/layers.action';
import { createUniqueId } from '../../../../utils/numberUtils';

const Update_Media_Related_Properties = 'update_isPortrait_hasMinWidth';
const Update_IsOpen_TabIndex = 'update_isOpen_tabIndex';
const Update_Chips = 'update_chips';
const Update_IsOpen_NavigationRail = 'update_isOpen_NavigationRail';

/**
 * @class
 * @author alsturm
 * @author taulinger
 */
export class ChipsContainer extends MvuElement {
	constructor() {
		super({
			isPortrait: false,
			hasMinWidth: false,
			isDarkSchema: false,
			isOpen: false,
			currentChips: [],
			isOpenNavigationRail: false
		});

		const { EnvironmentService: environmentService } = $injector.inject('EnvironmentService');

		this._environmentService = environmentService;
		this._resizeObserver = null;
	}

	/**
	 * @override
	 */
	update(type, data, model) {
		switch (type) {
			case Update_Media_Related_Properties:
				return { ...model, ...data };
			case Update_IsOpen_TabIndex:
				return { ...model, ...data };
			case Update_Chips:
				return { ...model, ...data };
			case Update_IsOpen_NavigationRail:
				return { ...model, ...data };
		}
	}

	/**
	 * @override
	 */
	onInitialize() {
		this.observe(
			(state) => state.media,
			(media) =>
				this.signal(Update_Media_Related_Properties, { isDarkSchema: media.darkSchema, isPortrait: media.portrait, hasMinWidth: media.minWidth })
		);
		this.observe(
			(state) => state.mainMenu,
			(mainMenu) => this.signal(Update_IsOpen_TabIndex, { isOpen: mainMenu.open })
		);
		this.observe(
			(state) => state.chips.current,
			(current) => this.signal(Update_Chips, { currentChips: [...current] })
		);
		this.observe(
			(state) => state.navigationRail,
			(navigationRail) => this.signal(Update_IsOpen_NavigationRail, { isOpenNavigationRail: navigationRail.open })
		);
	}

	/**
	 * @override
	 */
	onAfterRender(firsttime) {
		const showOrHideScrollButtons = (container) => {
			const isScrollable = container.scrollWidth > container.clientWidth ? true : false;
			isScrollable ? container.classList.add('show') : container.classList.remove('show');
		};
		const scrollElement = this.shadowRoot.getElementById('chipscontainer');
		showOrHideScrollButtons(scrollElement);

		this._resizeObserver = new (this._environmentService.getWindow().ResizeObserver)((entries) => {
			for (const entry of entries) {
				showOrHideScrollButtons(entry.target);
			}
		});

		if (firsttime) {
			const chipsContainer = this.shadowRoot.getElementById('chipscontainer');
			this._resizeObserver.observe(chipsContainer);
		}
	}

	/**
	 * @override
	 */
	onDisconnect() {
		this._resizeObserver?.disconnect();
	}

	/**
	 * @override
	 */
	createView(model) {
		const { isDarkSchema, isPortrait, hasMinWidth, isOpen, isOpenNavigationRail, currentChips } = model;

		const scrollLeft = () => {
			const container = this.shadowRoot.getElementById('chipscontainer');
			container.scrollLeft += container.clientWidth;
		};

		const scrollRight = () => {
			const container = this.shadowRoot.getElementById('chipscontainer');
			container.scrollLeft -= container.clientWidth;
		};

		const openButtonModal = (chip) => {
			openModal(
				chip.title,
				html`<style>
						${css}</style
					><iframe title=${chip.title} src=${chip.href} allowfullscreen="true" webkitallowfullscreen="true" mozallowfullscreen="true"></iframe>`
			);
		};

		const renderIcon = (chip) => {
			if (chip.style.icon) {
				return html`
					<svg class="chips__icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">${unsafeSVG(chip.style.icon)}</svg>
				`;
			}
			return nothing;
		};

		const renderStyle = (chip) => {
			return html`
				<style>
					.chips__${chip.id} {
						--chip-color: ${isDarkSchema ? chip.style.colorDark : chip.style.colorLight};
						--chip-background-color: ${isDarkSchema ? chip.style.backgroundColorDark : chip.style.backgroundColorLight};
					}
				</style>
			`;
		};

		const getLink = (chip) => {
			return html`
				${renderStyle(chip)}
				<a class="chips__${chip.id} chips__button" draggable="false" href="${chip.href}" target="_blank">
					${renderIcon(chip)}
					<span class="chips__button-text">${chip.title}</span>
				</a>
			`;
		};

		const getButton = (chip) => {
			return html`
				${renderStyle(chip)}
				<button class="chips__${chip.id} chips__button" draggable="false" @click=${() => openButtonModal(chip)}>
					${renderIcon(chip)}
					<span class="chips__button-text">${chip.title}</span>
				</button>
			`;
		};

		const addGeoResources = (geoResourceIds) => {
			const geoResourceIdsArray = geoResourceIds.split(',');
			geoResourceIdsArray.map((geoResourceId) => {
				const layerId = `${geoResourceId}_${createUniqueId()}`;
				addLayerIfNotPresent(layerId, { geoResourceId });
			});
		};

		const getInternalButton = (chip) => {
			return html`
				${renderStyle(chip)}
				<button class="chips__${chip.id} chips__button" draggable="false" @click=${() => addGeoResources(chip.href)}>
					${renderIcon(chip)}
					<span class="chips__button-text">${chip.title}</span>
				</button>
			`;
		};

		const getLayoutChips = (currentChips) => {
			return currentChips.map((chip) => {
				switch (chip.target) {
					case 'modal':
						return getButton(chip);

					case 'internal':
						return getInternalButton(chip);

					default:
						return getLink(chip);
				}
			});
		};

		const classes = {
			'is-open': isOpen && !isPortrait,
			'is-open-navigationRail': isOpenNavigationRail && !isPortrait,
			'is-desktop': hasMinWidth,
			'is-tablet': !hasMinWidth,
			'is-portrait': isPortrait,
			'is-landscape': !isPortrait
		};

		return html`
			<style>
				${css}
			</style>
			<div id="chipscontainer" class="${classMap(classes)} chips__container">
				<button class="chips__scroll-button chips__scroll-button-left" @click="${scrollRight}">
					<span class="icon"> </span>
				</button>
				${currentChips.length === 0 ? nothing : getLayoutChips(currentChips)}
				<button class="chips__scroll-button chips__scroll-button-right" @click="${scrollLeft}">
					<span class="icon"> </span>
				</button>
			</div>
		`;
	}

	/**
	 * @override
	 */
	isRenderingSkipped() {
		return this._environmentService.isEmbedded();
	}

	static get tag() {
		return 'ba-chips';
	}
}
