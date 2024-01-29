/**
 * @module modules/footer/components/Footer
 */
import { html } from 'lit-html';
import { $injector } from '../../../injection';
import css from './footer.css';
import { MvuElement } from '../../MvuElement';

const Update_IsOpen = 'update_isOpen_tabIndex';
const Update_IsPortrait_HasMinWidth = 'update_isPortrait_hasMinWidth';
const Update_IsOpen_NavigationRail = 'update_isOpen_NavigationRail';
/**
 * Container element for footer stuff.
 * @class
 * @author taulinger
 */
export class Footer extends MvuElement {
	constructor() {
		super({
			isOpen: false,
			isPortrait: false,
			hasMinWidth: false,
			isOpenNavigationRail: false
		});

		const { EnvironmentService } = $injector.inject('EnvironmentService');
		this._environmentService = EnvironmentService;
	}

	/**
	 * @override
	 */
	onInitialize() {
		this.observe(
			(state) => state.mainMenu,
			(mainMenu) => this.signal(Update_IsOpen, { isOpen: mainMenu.open })
		);
		this.observe(
			(state) => state.media,
			(media) => this.signal(Update_IsPortrait_HasMinWidth, { isPortrait: media.portrait, hasMinWidth: media.minWidth })
		);
		this.observe(
			(state) => state.navigationRail,
			(navigationRail) => this.signal(Update_IsOpen_NavigationRail, { isOpenNavigationRail: navigationRail.open })
		);
	}

	/**
	 * @override
	 */
	update(type, data, model) {
		switch (type) {
			case Update_IsOpen:
				return { ...model, ...data };
			case Update_IsPortrait_HasMinWidth:
				return { ...model, ...data };
			case Update_IsOpen_NavigationRail:
				return { ...model, ...data };
		}
	}

	/**
	 * @override
	 */
	onWindowLoad() {
		// we use optional chaining here because preload class may not be available
		this._root.querySelector('.preload')?.classList.remove('preload');
	}

	/**
	 * @override
	 */
	createView(model) {
		const { isOpen, isOpenNavigationRail, isPortrait, hasMinWidth } = model;

		const getOverlayClass = () => {
			return isOpen && !isPortrait && !this._environmentService.isEmbedded() ? 'is-open' : '';
		};

		const getOrientationClass = () => {
			return isPortrait ? 'is-portrait' : 'is-landscape';
		};

		const getMinWidthClass = () => {
			return hasMinWidth ? 'is-desktop' : 'is-tablet';
		};

		const getOverlayNavClass = () => (isOpenNavigationRail ? 'is-open-nav' : '');

		const isEmbedded = () => {
			return this._environmentService.isEmbedded() ? 'is-embedded' : '';
		};

		const createChildrenView = () => {
			return html`
				<ba-privacy-policy></ba-privacy-policy>
				<ba-map-info></ba-map-info>
			`;
		};

		return html`
			<style>
				${css}
			</style>
			<div class="preload">
				<div class="${getOrientationClass()} ${getMinWidthClass()} ${isEmbedded()}">
					<div class="footer ${getOverlayClass()} ${getOverlayNavClass()}">
						<div class="scale"></div>
						<ba-attribution-info></ba-attribution-info>
						<div class="content">${createChildrenView()}</div>
					</div>
				</div>
			</div>
		`;
	}

	static get tag() {
		return 'ba-footer';
	}
}
