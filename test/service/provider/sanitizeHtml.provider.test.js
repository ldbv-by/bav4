import { domPurifySanitizeHtml } from '../../../src/services/provider/sanitizeHtml.provider';

describe('DOMPurify sanitize HTML provider', () => {

	it('sanitize a HTML string', () => {
		// examples from https://github.com/cure53/DOMPurify/blob/main/README.md
		expect(domPurifySanitizeHtml('<img src=x onerror=alert(1)//>')).toBe('<img src="x">');
		expect(domPurifySanitizeHtml('<svg><g/onload=alert(2)//<p>')).toBe('<svg><g></g></svg>');
		expect(domPurifySanitizeHtml('<p>abc<iframe//src=jAva&Tab;script:alert(3)>def</p>')).toBe('<p>abc</p>');
		expect(domPurifySanitizeHtml('<math><mi//xlink:href="data:x,<script>alert(4)</script>">')).toBe('<math><mi></mi></math>');
		expect(domPurifySanitizeHtml('<TABLE><tr><td>HELLO</tr></TABL>')).toBe('<table><tbody><tr><td>HELLO</td></tr></tbody></table>');
		expect(domPurifySanitizeHtml('<UL><li><A HREF=//google.com>click</UL>')).toBe('<ul><li><a href="//google.com">click</a></li></ul>');
	});

});
