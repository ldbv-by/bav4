import { html } from 'lit-html';
import { AbstractMvuContentPanel } from '../AbstractMvuContentPanel';

/**
* Container for more contents.
* @class
* @author costa_gi
*/
export class MoreContentPanel extends AbstractMvuContentPanel {

	createView() {
		return html`
       <ul class="ba-list">	
		<li class="ba-list-item  ba-list-item__header">
            <span class="ba-list-item__text ">
                <span class="ba-list-item__primary-text">
                    Settings
                </span>
            </span>
	    </li>		
		<li  class="ba-list-item">
            <span class="ba-list-item__text vertical-center">
                <span class="ba-list-item__primary-text">
                Dark mode
                </span>              
	        </span>
	        <span class="ba-list-item__after">
	            <ba-theme-toggle></ba-theme-toggle>
	        </span>
		</li>
		<li  class="ba-list-item">
			<span class="ba-list-item__text ">
				<span class="ba-list-item__primary-text">
				Lorem ipsum dolor
				</span>
			</span>
		</li>
		<li  class="ba-list-item">
			<span class="ba-list-item__text ">
				<span class="ba-list-item__primary-text">
				Lorem ipsum dolor
				</span>
			</span>
		</li>
		<li class="ba-list-item  ba-list-item__header">
			<span class="ba-list-item__text ">
				<span class="ba-list-item__primary-text">
					Links
				</span>
			</span>
		</li>
		<li class="ba-list-item">
			<span class="ba-list-item__text ">
				<span class="ba-list-item__primary-text">
				Lorem ipsum
				</span>
				<span class="ba-list-item__secondary-text">
					Lorem ipsum dolor sit amet, consetetur sadipscing elitr
				</span>
			</span>
		</li>             
		<li class="ba-list-item">
			<span class="ba-list-item__text ">
				<span class="ba-list-item__primary-text">
				Lorem ipsum 
				</span>
				<span class="ba-list-item__secondary-text">
					Lorem ipsum dolor sit amet, consetetur sadipscing elitr
				</span>
			</span>
		</li>             
		<li class="ba-list-item">
			<span class="ba-list-item__text ">
				<span class="ba-list-item__primary-text">
				Lorem ipsum 
				</span>
				<span class="ba-list-item__secondary-text">
					Lorem ipsum dolor sit amet, consetetur sadipscing elitr
				</span>
			</span>
		</li>          
		<li class="ba-list-item" style="display:none">
			<span class="ba-list-item__pre">
				<span class="ba-list-item__icon">
				</span>
			</span>
			<span class="ba-list-item__text vertical-center">
				<span class="ba-list-item__primary-text">
				Lorem ipsum dolor
				</span>              
			</span>
			<span class="ba-list-item__after">
                <span class="ba-list-item__icon-info">                                
                </span>
		    </span>
		</li>  		          
	</ul>
    `;
	}

	static get tag() {
		return 'ba-more-content-panel';
	}
}
