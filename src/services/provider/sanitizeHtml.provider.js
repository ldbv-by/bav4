/**
 * @module services/provider/sanitizeHtml_provider
 */
import DOMPurify from 'dompurify';

const Black_List = [
	'form',
	'fieldset',
	'input',
	'datalist',
	'button',
	'select',
	'option',
	'optgroup',
	'textarea',
	'output',
	'keygen',
	'script',
	'noscript',
	'dialog'
];

/**
 * Add a hook to make all links open a new window
 * see:  https://github.com/cure53/DOMPurify/blob/main/demos/hooks-target-blank-demo.html
 */
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
	// set all elements owning target to target=_blank
	if ('target' in node) {
		node.setAttribute('target', '_blank');
		node.setAttribute('rel', 'noopener noreferrer');
	}
});

/**
 * Sanitizes HTML content by removing unsafe HTML-, SVG-, mathML-Tags
 * and scripts.
 * @param {string} dirty the potentially dirty content
 * @returns {string} the cleaned content
 */
export const domPurifySanitizeHtml = (dirty) => {
	return DOMPurify.sanitize(dirty, { USE_PROFILES: { html: true, svg: true }, FORBID_TAGS: Black_List, FORBID_ATTR: ['style'] });
};
