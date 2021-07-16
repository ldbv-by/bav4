import { html, nothing } from 'lit-html';
import { BaElement } from '../../../BaElement';
import { $injector } from '../../../../injection';
import { DrawToolContent } from '../drawToolContent/DrawToolContent';
import { MeasureToolContent } from '../measureToolContent/MeasureToolContent';
import { closeToolContainer } from '../../store/toolContainer.action';
import { activate as activateMeasurement, deactivate as deactivateMeasurement } from '../../../map/store/measurement.action';
import { activate as activateDraw, deactivate as deactivateDraw } from '../../../map/store/draw.action';
import css from './toolContainer.css';

/**
 * @class
 * @author thiloSchlemmer
 * @author taulinger
 */
export class ToolContainer extends BaElement {

	constructor() {
		super();

		const {
			EnvironmentService: environmentService
		}
			= $injector.inject('EnvironmentService');

		this._environmentService = environmentService;
		this._lastContentId = false;
	}



	/**
	 * @override
	 */
	createView(state) {

		const { open, contentId, portrait, minWidth } = state;

		let content;
		switch (contentId) {
			case DrawToolContent.tag:
				content = html`<ba-tool-draw-content></ba-tool-draw-content>`;
				break;
			case MeasureToolContent.tag:
				content = html`<ba-tool-measure-content></ba-tool-measure-content>`;
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
			return portrait ? 'is-portrait' : 'is-landscape';
		};

		const getMinWidthClass = () => {
			return minWidth ? 'is-desktop' : 'is-tablet';
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
		const { toolContainer: { open, contentId }, media: { portrait, minWidth } } = globalState;
		return { open, contentId, portrait, minWidth };
	}

	static get tag() {
		return 'ba-tool-container';
	}

	_activateByContentId(contentId) {
		switch (contentId) {
			case MeasureToolContent.tag:
				activateMeasurement();
				break;
			case DrawToolContent.tag:
				activateDraw();
				break;
		}
	}

	_deactivateByContentId(contentId) {
		switch (contentId) {
			case MeasureToolContent.tag:
				deactivateMeasurement();
				break;
			case DrawToolContent.tag:
				deactivateDraw();
				break;
		}
		this._lastContentId = false;
	}
}
