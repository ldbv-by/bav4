import { domPurifySanitizeHtml } from '../../../src/services/provider/sanitizeHtml.provider';

describe('DOMPurify sanitize HTML provider', () => {

	it('sanitize a HTML string', () => {
		// examples from https://github.com/cure53/DOMPurify/blob/main/README.md
		// partially modified for our for our usecase

		// scripts not allowed
		expect(domPurifySanitizeHtml('<img src=x onerror=alert(1)//>')).toBe('<img src="x">');
		expect(domPurifySanitizeHtml('<p>abc<iframe//src=jAva&Tab;script:alert(3)>def</p>')).toBe('<p>abc</p>');
		expect(domPurifySanitizeHtml('<TABLE><tr><td>HELLO</tr></TABL>')).toBe('<table><tbody><tr><td>HELLO</td></tr></tbody></table>');
		expect(domPurifySanitizeHtml('<UL><li><A HREF=//google.com>click</UL>')).toBe('<ul><li><a href="//google.com">click</a></li></ul>');

		// SVG or mathML is not alloed
		expect(domPurifySanitizeHtml('<div><svg><g/onload=alert(2)//<p></div>')).toBe('<div></div>');
		expect(domPurifySanitizeHtml('<div><math><mi//xlink:href="data:x,<script>alert(4)</script></div>">')).toBe('<div></div>');

		// any HTML form elements not allowed
		expect(domPurifySanitizeHtml('<p>abc<div onclick=alert(0)><form onsubmit=alert(1)><input onfocus=alert(2) name=parentNode>123</form></div></p>')).toBe('<p>abc</p><div>123</div><p></p>');

	});

});
