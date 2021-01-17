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

	createShowCase() {
		const onClick0 = ()=> {
			changeZoomAndPosition({
				zoom: 13,
				position: this._coordinateService.fromLonLat([11.57245, 48.14021])
			});
		};

		const onClick1 = ()  => {
			changeZoomAndPosition({
				zoom: 11,
				position: this._coordinateService.fromLonLat([11.081, 49.449])
			});
		};

		return html `<p>Here we present components in random order that:</p>
		<ul>
		<li>are <i>common and reusable</i> components or <i>functional behaviors</i>, who can be added to or extend other components</li>
		<li><i>feature</i> components, which have already been implemented, but have not yet been given the most suitable place...</li>
		</ul>
		<hr>
		<h3>Common components or functional behaviors</h3>
		<p>ba-buttons</p>
		<div class='buttons'>		
					<ba-button id='button0' label='primary style' type="primary" @click=${onClick0}></ba-button>
					<ba-button id='button1' label='secondary style' @click=${onClick1}></ba-button>
					<ba-button id='button2' label='disabled' type='primary' disabled=true ></ba-button>
					<ba-button id='button3' label='disabled' disabled=true></ba-button>
		</div>
		<p>Toggle-Button</p>
		<div class='toggle' style="display: flex;justify-content: flex-start;"><ba-toggle title="Toggle"><span>Toggle me!</span></ba-toggle></div>
		<hr>
		<h3>Specific components</h3>
		<p>Theme-Toggle</p>
		<div class='theme-toggle' style="display: flex;justify-content: flex-start;"><ba-theme-toggle></ba-theme-toggle></div>
		`;
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
			const payload = { title:'Showcase', content: this.createShowCase() };
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
