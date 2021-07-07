import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import css from './toolBar.css';
import { DrawToolContent } from '../../../toolbox/components/drawToolContent/DrawToolContent';
import { MeasureToolContent } from '../../../toolbox/components/measureToolContent/MeasureToolContent';
import { toggleToolBar } from '../../store/toolBar.action';
import { toggleToolContainer, setContainerContent, openToolContainer } from '../../../toolbox/store/toolContainer.action';
import { $injector } from '../../../../injection';


/**
 * Container for Tools 
 *  
 * @class
 * @author alsturm
 */
export class ToolBar extends BaElement {

	constructor() {
		super();

		const {
			EnvironmentService: environmentService,
			TranslationService: translationService
		}
			= $injector.inject('EnvironmentService', 'TranslationService');

		this._environmentService = environmentService;
		this._translationService = translationService;
	}

	/**
	 * @override
	 */
	createView(state) {

		const { toolBar, toolContainer, portrait, minWidth } = state;
		const toolBarOpen = toolBar.open;
		const activeToolId = toolContainer.contentId;
		const getOrientationClass = () => {
			return portrait ? 'is-portrait' : 'is-landscape';
		};

		const getMinWidthClass = () => {
			return minWidth ? 'is-desktop' : 'is-tablet';
		};

		const getOverlayClass = () => {
			return toolBarOpen ? 'is-open' : '';
		};

		const toggleTool = (toolId) => {
			setContainerContent(toolId);
			if (activeToolId === toolId) {
				toggleToolContainer();
			}
			else {
				openToolContainer();
			}
		};
		const toggleDrawTool = () => {
			const toolId = DrawToolContent.tag;
			toggleTool(toolId);
		};

		const toggleMeasureTool = () => {
			const toolId = MeasureToolContent.tag;
			toggleTool(toolId);
		};

		const translate = (key) => this._translationService.translate(key);

		return html`
			<style>${css}</style>		
			<div class="${getOrientationClass()} ${getMinWidthClass()}">  
				<button  @click="${toggleToolBar}"  class="action-button">
					<div class="action-button__icon">
					</div>
				</button>
				<div class="tool-bar ${getOverlayClass()}">    	
					<div  @click="${toggleMeasureTool}" class="tool-bar__button">
						<div class="tool-bar__button_icon measure">							
						</div>
						<div class="tool-bar__button-text">
							${translate('menu_toolbar_measure_button')}
						</div>  
					</div>  	
					<div  @click="${toggleDrawTool}" class="tool-bar__button">
						<div class="tool-bar__button_icon pencil">							
						</div>
						<div class="tool-bar__button-text">
							${translate('menu_toolbar_draw_button')}
						</div>  
					</div>  				               
					<div  class="tool-bar__button">
						<div class="tool-bar__button_icon share">							
						</div>
						<div class="tool-bar__button-text">
							${translate('menu_toolbar_share_button')}
						</div>  
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
		const { toolBar, toolContainer, media: { portrait, minWidth } } = globalState;
		return { toolBar, toolContainer, portrait, minWidth };
	}

	static get tag() {
		return 'ba-tool-bar';
	}
}
