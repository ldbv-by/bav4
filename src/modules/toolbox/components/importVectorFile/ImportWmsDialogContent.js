import { html } from 'lit-html';
import css from './importWmsDialogContent.css';
import { $injector } from '../../../../injection';
import { MvuElement } from '../../../MvuElement';


/**
 * A content component to import Wms
 * @class
 * @author costa_gi
 */
export class ImportWmsDialogContent extends MvuElement {

	constructor() {
		super();
		const { TranslationService: translationService } = $injector.inject('TranslationService');
		this._translationService = translationService;
		this.iconDirection;
	}

	createView() {
		const translate = (key) => this._translationService.translate(key);

		const addresses = [
			{
				'name': 'topic 1',
				'description': 'this is topic 1 xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
			},
			{
				'name': 'topic 2',
				'description': 'this is topic 2'
			},
			{
				'name': 'topic 3',
				'description': 'this is topic 3'
			},
			{
				'name': 'topic 4',
				'description': 'this is topic 4'
			}
		];

		return html`
             <style>${css}</style>
			 	<div>
					 
				 <div>
					 <p class="title">${translate('toolbox_importWms_input_url')} *</p>    
						<input class='wms_toggle_input width80' id='wmsFileBrowser' name='wmsFileBrowser'>	
						<button class="connect">${translate('toolbox_importWms_button_connect')}</button>
					 </div>
				
					<div class="grid-container">
						<div>
						<p class="title">${translate('toolbox_importWms_input_user')}</p>    
						<input id='wmsName' name='wmsName'>	
						</div>
						<div>
						<p class="title">${translate('toolbox_importWms_input_pwd')}</p>    
						<input id='wmsFirstname'  name='wmsFirstname'>	
						</div>
					</div>

					<div class="grid-container">
						<div>
							<button id="layer-button" @click=${() => this._sortListDirection()}>
							<span class="title">${translate('toolbox_importWms_textarea_layer')}
										<i class='icon icon-rotate-90 chevron'></i>
							</span>
							</button>
								<div id='id01' class="area-url">
									${addresses.map((topic) => html`
									<li class="list-margin" @mouseover=${() => this._fillDescriptionArea(topic.description)}>
									${topic.name} 
									</li>
									`)}
								</div>
					  	</div>
						<div>
							<p class="title">${translate('toolbox_importWms_textarea_description')}</p>
							<textarea id='descriptionArea' class='area-description' cols="35"></textarea>
						</div>
					</div>	

				</div>
			`;
	}

	_sortListDirection() {
		let index;
		let switching;
		let listItem;
		let shouldSwitch;
		let direction;
		let switchcount = 0;
		const list = this.shadowRoot.getElementById('id01');
		switching = true;
		// Set the sorting direction to ascending:
		direction = 'asc';
		// Make a loop that will continue until no switching has been done:
		while (switching) {
		// start by saying: no switching is done:
			switching = false;
			listItem = list.getElementsByTagName('LI');
			// Loop through all list-items:
			for (index = 0; index < (listItem.length - 1); index++) {
				//start by saying there should be no switching:
				shouldSwitch = false;
				const icon = this.shadowRoot.querySelector('i');
				/* check if the next item should switch place with the current item, based on the sorting direction (asc or desc): */
				if (direction === 'asc') {

					icon.classList.add('iconexpand');
					this.iconDirection = 'iconexpand';
					if (listItem[index].innerHTML.toLowerCase() > listItem[index + 1].innerHTML.toLowerCase()) {
						/* if next item is alphabetically lower than current item, mark as a switch and break the loop: */
						shouldSwitch = true;
						break;
					}
				}
				else if (direction === 'desc') {
					this.iconDirection = '';
					icon.classList.remove('iconexpand');
					if (listItem[index].innerHTML.toLowerCase() < listItem[index + 1].innerHTML.toLowerCase()) {
						/* if next item is alphabetically higher than current item, mark as a switch and break the loop: */
						shouldSwitch = true;
						break;
					}
				}
			}
			if (shouldSwitch) {
				/* If a switch has been marked, make the switch and mark that a switch has been done: */
				listItem[index].parentNode.insertBefore(listItem[index + 1], listItem[index]);
				switching = true;
				// Each time a switch is done, increase switchcount by 1:
				switchcount ++;
			}
			else {
				/* If no switching has been done AND the direction is 'asc', set the direction to 'desc' and run the while loop again. */
				if (switchcount === 0 && direction === 'asc') {
					direction = 'desc';
					switching = true;
				}
			}
		}
	}

	_fillDescriptionArea(description) {
		const area = this.shadowRoot.getElementById('descriptionArea');
		area.innerText = description;
	}

	static get tag() {
		return 'ba-import-wms-content';
	}
}
