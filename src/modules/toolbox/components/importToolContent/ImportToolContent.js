import { html } from 'lit-html';
import css from './importToolContent.css';
import { AbstractToolContent } from '../toolContainer/AbstractToolContent';

/**
 * @class
 * @author alsturm
 */
export class ImportToolContent extends AbstractToolContent {

	constructor() {
		super({
			mode: null
		});
	}


	createView() {

		return html`
        <style>${css}</style>
            <div class="ba-tool-container">
				<div class="ba-tool-container__title">
						Datei Import 
						<span style='font-size:.9rem; opacity:.9;margin-left:.5em; font-weight:normal'> KML, GPX, GeoJSON </span>
				</div>
				<div style="    position: absolute;
				font-weight: bold;
				left: 50%;
				top: 6em;
				background: var(--primary-bg-color);
				">
				oder
				</div>

				<div class="ba-tool-container__content divider" style="display:flex">                						     				
					<div class="tool-container__buttons" style="width: 12em">      
						<button class="tool-container__button" role="button" tabindex="0" target="_blank" id="share-api" title="upload" > 	                              
							<div class="tool-container__background"></div>
							<div class="tool-container__icon data"></div>  
							<div class="tool-container__button-text" style='position: relative;left: -1.5em;'>Datei Auswählen</div>
						</button>
					</div>
					<div  class='drag-drop-preview' style='width: 12em;text-align: center;padding: 2em 0em;border-left: 1px dotted var(--text1);'>
							<div class='text-to-search'>
								Drag and Drop 
								<div class='drag-drop-bg'>
									<div class='drag-drop-bg-icon'>
									</div>	
									<div class='drag-drop-bg-text'>
									KML, GPX, GeoJSON Datei hierhin ziehen
									</div>
								</div>
							</div>
							<div>
								in die Karte
							</div>						 
					</div>
				</div>  
				<div class="ba-tool-container__title ">
					URL Import
					<span style='font-size:.9rem; opacity:.9; margin-left:.5em;font-weight:normal'> WMS, KML, GPX, GeoJSON </span>
				</div>
				<div class="ba-tool-container__content">      					                  											
				Bitte geben Sie die URL in das <span class='text-to-search-icon'></span> <span class='text-to-search' ">
				 Suchfeld 
				 <div class='search-bg'>

								</div>
				</span> ein. Die Daten werden automatisch geladen.
				</div>								          
            </div>
		</div>	  
        `;

	}

	static get tag() {
		return 'ba-tool-import-content';
	}
}
