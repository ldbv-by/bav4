import { html } from 'lit-html';
import { BaElement } from '../../BaElement';
import { toggleSidePanel } from '../../menue/store/sidePanel.action';
import { openModal } from '../../modal/store/modal.action';
import { $injector } from '../../../injection';
import { changeZoomAndPosition } from '../../map/store/olMap.action';
import css from './header.css';


/**
 * Container element for header stuff. 
 * @class
 * @author aul
 */
export class Header extends BaElement {

	constructor() {
		super();

		const { CoordinateService, EnvironmentService } = $injector.inject('CoordinateService', 'EnvironmentService');
		this._coordinateService = CoordinateService;
		this._environmentService = EnvironmentService;
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

		const showModalInfo = ()=> {
			const payload = { title:'Info', content: html `Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.` };
			openModal(payload);
		};

		return html`
			<style>${css}</style>
			<div class="header header-desktop">
				<div class="content">
					<div class="item0">
						<div class='ci'>
							<h3 class='ci-text'>BAv4 (#nomigration)</h3>
							<div class='ci-logo' @click="${showModalInfo}"></div>
						</div>
					</div>
					<ba-autocomplete-search class="item1"></ba-autocomplete-search>
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

	onWindowLoad() {
		if (this._environmentService.isEmbedded()) {
			return;
		}

		this._root.querySelector('ba-autocomplete-search').onSelect = (data) => {
			changeZoomAndPosition({
				zoom: 16,
				position: this._coordinateService.fromLonLat([data.center[0], data.center[1]])
			});
		};
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
