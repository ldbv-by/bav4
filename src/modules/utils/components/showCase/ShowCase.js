import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import { $injector } from '../../../../injection';
import { closeModal } from '../../../modal/store/modal.action';
import { changeZoomAndCenter } from '../../../map/store/position.action';
import arrowUpSvg from './assets/arrow-up.svg';

/**
 * Displays a showcase of common and reusable components or 
 * functional behaviors, which are not finally in place
 * @class
 * @author thiloSchlemmer
 */
export class ShowCase extends BaElement {

	constructor() {
		super();

		const { CoordinateService, EnvironmentService } = $injector.inject('CoordinateService', 'EnvironmentService');
		this._coordinateService = CoordinateService;
		this._environmentService = EnvironmentService;
	}

	/**
	 * @override
	 */
	createView() {

		const onClick0 = () => {
			changeZoomAndCenter({
				zoom: 13,
				center: this._coordinateService.fromLonLat([11.57245, 48.14021])
			});
		};

		const onClick1 = () => {
			changeZoomAndCenter({
				zoom: 11,
				center: this._coordinateService.fromLonLat([11.081, 49.449])
			});
		};
		const onToggle = (event) => {
			// eslint-disable-next-line no-console
			console.log('toggled ' + event.detail.checked);
		};

		const onClickMeasureDistance = () => {
			// activate measurement-modus in map, so modal must disappear
			//todo: start/activate measurement-state in state
			closeModal();
		};

		return html`<div>
			<p>Here we present components in random order that:</p>
			<ul>
			<li>are <i>common and reusable</i> components or <i>functional behaviors</i>, who can be added to or extend other components</li>
			<li><i>feature</i> components, which have already been implemented, but have not yet been given the most suitable place...</li>
			</ul>
			<hr>
			<h3>Common components or functional behaviors</h3>
			<p>ba-icons</p>
			<div class='icons'>		
						<ba-icon icon='${arrowUpSvg}' @click=${onClick0}></ba-icon>
						<ba-icon icon='${arrowUpSvg}' disabled=true @click=${onClick0}></ba-icon>
						<ba-icon icon='${arrowUpSvg}' size=15 @click=${onClick0}></ba-icon>
						<ba-icon icon='${arrowUpSvg}' size=40 @click=${onClick0}></ba-icon>
						
			</div>
			<p>ba-buttons</p>
			<div class='buttons'>		
						<ba-button id='button0' label='primary style' type="primary" @click=${onClick0}></ba-button>
						<ba-button id='button1' label='secondary style' @click=${onClick1}></ba-button>
						<ba-button id='button2' label='disabled' type='primary' disabled=true ></ba-button>
						<ba-button id='button3' label='disabled' disabled=true></ba-button>
			</div>
			<p>Toggle-Button</p>
			<div class='toggle' style="display: flex;justify-content: flex-start;"><ba-toggle id='toggle' title="Toggle" @toggle=${onToggle}><span>Toggle me!</span></ba-toggle></div>
			<hr>
			<h3>Specific components</h3>
			<p>Theme-Toggle</p>
			<div class='theme-toggle' style="display: flex;justify-content: flex-start;"><ba-theme-toggle></ba-theme-toggle></div>				
			<p>Measure Distance</p>
			<ba-button id='buttonMeasureDistance' label='Measure Distance' type="primary" @click=${onClickMeasureDistance}></ba-button>	
		</div>`;
	}
    
	static get tag() {
		return 'ba-showcase';
	}
}