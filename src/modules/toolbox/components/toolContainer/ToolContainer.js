import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import { $injector } from '../../../../injection';
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
	createView() {

		const { open } = this._state;

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
			<div class="tool-container ${getOrientationClass()} ${getMinWidthClass()}">  				
				<div class="tool-container__content ${getOverlayClass()}">    		
				<div class="ba-tool-container__item ba-tool-menu__zeichnen">
                    <div>
                        <span class="tool-container__header">
                            Zeichnen
                        </span>
                    </div>                                      
                    <div class="tool-container__tools-nav">                        
                            <button class="tool-container__close-button">
                                x
                            </button>                             
                    </div>
                    <div class="tool-container__buttons">                                    
                        <div>
                            <div  class="tool-container__button_icon pencil">
                                
                            </div>
                            <div class="tool-container__button-text">
                                Symbol
                            </div>                   
                        </div>
                        <div>
						<div  class="tool-container__button_icon pencil">
                            </div>
							<div class="tool-container__button-text">
                                Text
                            </div>                   
                        </div>
                        <div>
						<div  class="tool-container__button_icon pencil">
                            </div>
							<div class="tool-container__button-text">
                                Linie
                            </div>                   
                        </div>
                        <div>
						<div  class="tool-container__button_icon pencil">
                            </div>
							<div class="tool-container__button-text">
                                Polygon
                            </div>                   
                        </div>
						<div>
						<div  class="tool-container__button_icon pencil">
                            </div>
							<div class="tool-container__button-text">
                                Messen
                            </div>                   
                        </div>
                    </div>
                    <div class="tool-container__buttons-secondary">                         
						<button>                                                                
							Löschen                                                                           
						</button>
						<button>                              
							Teilen                                 
						</button>
						<button >                               
							Speichern                                
						</button>                                             
                    </div>                
                    <div class="tool-container__info"> 
                        <span>
                            Ihre Zeichnung wird automatisch für ein Jahr gespeichert. Durch die Nutzung dieses Dienstes stimmen Sie den Nutzungsbedingungen zu.
                        </span>
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
	 * @param {Object} state 
	 */
	extractState(state) {
		const { toolContainer: { open } } = state;
		return { open };
	}

	static get tag() {
		return 'ba-tool-container';
	}

}