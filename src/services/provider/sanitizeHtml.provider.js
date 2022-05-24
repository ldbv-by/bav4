import DOMPurify from 'dompurify';
const Black_List = [
	'style',
	'iframe',
	'embed',
	'object',
	'param',
	'video',
	'audio',
	'track',
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
	'canvas',
	'template',
	'dialog'
];

/**
 * Sanitizes HTML content by removing unsafe HTML-, SVG-, mathML-Tags
 * and scripts.
 * @param {string} dirty the potentially dirty html content
 * @returns {string} the cleaned html content
 */
export const domPurifySanitizeHtml = (dirty) => {
	return DOMPurify.sanitize(dirty, { USE_PROFILES: { html: true }, FORBID_TAGS: Black_List });
};
