import { html } from 'lit-html';
import { BaElement } from '../../BaElement';
import { toggleSidePanel } from '../../menue/store/sidePanel.action';
import { openModal } from '../../modal/store/modal.action';
import { $injector } from '../../../injection';
import { changeZoomAndCenter } from '../../map/store/position.action';
import css from './header.css';


/**
 * Container element for header stuff. 
 * @class
 * @author aul
 */
export class Header extends BaElement {

	constructor() {
		super();

		const { CoordinateService, EnvironmentService, SearchResultProviderService: providerService } = $injector.inject('CoordinateService', 'EnvironmentService', 'SearchResultProviderService');
		this._coordinateService = CoordinateService;
		this._environmentService = EnvironmentService;
		this._locationSearchResultProvider = providerService.getLocationSearchResultProvider();
		this._menueButtonLocked = false;
	}

	isRenderingSkipped() {
		return this._environmentService.isEmbedded();
	}

	createView() {

		// const getDeviceClass = (prefix) => (mobile ? prefix + '-mobile' : prefix + '-desktop');
		const getTitle = () => {
			const { sidePanelIsOpen } = this._state;
			return sidePanelIsOpen ? 'Close menue' : 'Open menue';
		};

		const toggleSidePanelGuarded = () => {

			if (!this._menueButtonLocked) {
				this._menueButtonLocked = true;
				toggleSidePanel();
				window.setTimeout(() => this._menueButtonLocked = false, Header.menueButtonLockDuration);
			}
		};

		const showModalInfo = () => {
			const payload = { title: 'Showcase', content: html`<ba-showcase></ba-showcase>` };
			openModal(payload);
		};

		const onSelect = (data) => {
			changeZoomAndCenter({
				zoom: 16,
				center: this._coordinateService.fromLonLat([data.center[0], data.center[1]])
			});
		};

		return html`
			<style>${css}</style>
			<div class="header header-desktop">
				<div class="content">
					<div class="item0">
						<div class='ci'>
							<h3 class='ci-text'>BAv4</h3>
							<div class='ci-logo' @click="${showModalInfo}"></div>
						</div>
					</div>
					<ba-autocomplete-search class="item1" .onSelect=${onSelect} .provider=${this._locationSearchResultProvider}></ba-autocomplete-search>
					<div class="item2">
						<div class='menue-button'>
							<a title="${getTitle()}" @click="${toggleSidePanelGuarded}">
								<span class='icon toggle-side-panel'></span>
							</a>
						</div>
					</div>
				</div>
			</div>
		`;
	}

	/**
	 * 
	 * @param {@override} store 
	 */
	extractState(store) {
		const { sidePanel: { open } } = store;
		return { sidePanelIsOpen: open };
	}

	static get tag() {
		return 'ba-header';
	}

	static get menueButtonLockDuration() {
		return 500;
	}
}
