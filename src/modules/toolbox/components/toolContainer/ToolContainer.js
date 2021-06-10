import { html, nothing } from 'lit-html';
import { BaElement } from '../../../BaElement';
import { $injector } from '../../../../injection';
import { DrawToolContent } from '../drawToolContent/DrawToolContent';
import { MeasureToolContent } from '../measureToolContent/MeasureToolContent';
import { ShareToolContent } from '../shareToolContent/ShareToolContent'; 
import { closeToolContainer } from '../../store/toolContainer.action';
import { activate as activateMeasurement, deactivate as deactivateMeasurement } from '../../../map/store/measurement.action';
import css from './toolContainer.css';

/**
 * @class
 * @author thiloSchlemmer
 */
export class ToolContainer extends BaElement {

	constructor() {
		super();

		const {
			EnvironmentService: environmentService
		}
			= $injector.inject('EnvironmentService');

		this._environmentService = environmentService;
		this._portrait = false;
		this._minWidth = false;
		this._lastContentId = false;
	}


	initialize() {

		const _window = this._environmentService.getWindow();
		//MediaQuery for 'orientation'
		const mediaQuery = _window.matchMedia('(orientation: portrait)');
		const handleOrientationChange = (e) => {
			this._portrait = e.matches;
			//trigger a re-render
			this.render();
		};
		mediaQuery.addEventListener('change', handleOrientationChange);
		//initial set of local state
		handleOrientationChange(mediaQuery);


		//MediaQuery for 'min-width'
		const mediaQueryMinWidth = _window.matchMedia('(min-width: 80em)');
		const handleMinWidthChange = (e) => {
			this._minWidth = e.matches;
			//trigger a re-render
			this.render();
		};
		mediaQueryMinWidth.addEventListener('change', handleMinWidthChange);
		//initial set of local state
		handleMinWidthChange(mediaQueryMinWidth);
	}

	/**
	 * @override
	 */
	createView(state) {

		const { open, contentId } = state;

		let content;
		switch (contentId) {
			case DrawToolContent.tag:
				content = html`<ba-tool-draw-content></ba-tool-draw-content>`;
				break;
			case MeasureToolContent.tag:
				content = html`<ba-tool-measure-content></ba-tool-measure-content>`;
				break;
			case ShareToolContent.tag:
				content = html`<ba-tool-share-content></ba-tool-share-content>`;
				break;
			default:
				return nothing;
		}

		if (this._lastContentId !== contentId && open) {
			this._deactivateByContentId(this._lastContentId);
			this._activateByContentId(contentId);
		}

		if (!open) {
			this._deactivateByContentId(this._lastContentId);
		}
		else {
			this._lastContentId = contentId;
		}

		const getOrientationClass = () => {
			return this._portrait ? 'is-portrait' : 'is-landscape';
		};

		const getMinWidthClass = () => {
			return this._minWidth ? 'is-desktop' : 'is-tablet';
		};

		const getOverlayClass = () => {
			return open ? 'is-open' : '';
		};

		return html`
			<style>${css}</style>		
			<div class=" ${getOrientationClass()} ${getMinWidthClass()}">  	
			<div class="tool-container"> 			
				<div class="tool-container__content ${getOverlayClass()}">    
				<div class="tool-container__tools-nav">                        
                        <button @click=${closeToolContainer} class="tool-container__close-button">
                            x
                        </button>                             
                </div>		
					${content}    				               				 				           					 				               				               				 				            				               				               				 				           
				</div>		
			</div>		
			</div>		
		`;
	}

	isRenderingSkipped() {
		return this._environmentService.isEmbedded();
	}

	/**
 * @override
 * @param {Object} globalState 
 */
	extractState(globalState) {
		const { toolContainer } = globalState;
		return toolContainer;
	}

	static get tag() {
		return 'ba-tool-container';
	}

	_activateByContentId(contentId) {
		switch (contentId) {
			case MeasureToolContent.tag:
				activateMeasurement();
				break;
		}
	}

	_deactivateByContentId(contentId) {
		switch (contentId) {
			case MeasureToolContent.tag:
				deactivateMeasurement();
				break;
		}
		this._lastContentId = false;
	}



}