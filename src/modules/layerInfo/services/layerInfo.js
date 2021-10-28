/**
* @class
* @author costa_gi
*/
export class LayerInfo {

	/**
	 *
	 * @param {string} content of this LayerInfo
	 * @param {string} [title=null] optional title of this LayerInfo
	 */
	constructor(content, title = null) {

		this._content = content;
		this._title = title;
	}

	get content() {
		return this._content;
	}

	get title() {
		return this._title;
	}
}
