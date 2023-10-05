import { domPurifySanitizeHtml } from '../../../src/services/provider/sanitizeHtml.provider';

describe('DOMPurify sanitize HTML provider', () => {
	it('sanitize a HTML string', () => {
		// examples from https://github.com/cure53/DOMPurify/blob/main/README.md
		// partially modified for our use case

		// scripts are not allowed
		expect(domPurifySanitizeHtml('<img src=x onerror=alert(1)//>')).toBe('<img src="x">');
		expect(domPurifySanitizeHtml('<p>abc<iframe//src=jAva&Tab;script:alert(3)>def</p>')).toBe('<p>abc</p>');
		expect(domPurifySanitizeHtml('<TABLE><tr><td>HELLO</tr></TABL>')).toBe('<table><tbody><tr><td>HELLO</td></tr></tbody></table>');
		expect(domPurifySanitizeHtml('<UL><li><A HREF=//google.com>click</UL>')).toBe('<ul><li><a href="//google.com">click</a></li></ul>');

		// mathML is not allowed
		expect(domPurifySanitizeHtml('<div><math><mi//xlink:href="data:x,<script>alert(4)</script></div>">')).toBe('<div></div>');

		// any HTML form elements not allowed
		expect(
			domPurifySanitizeHtml('<p>abc<div onclick=alert(0)><form onsubmit=alert(1)><input onfocus=alert(2) name=parentNode>123</form></div></p>')
		).toBe('<p>abc</p><div>123</div><p></p>');

		// any HTML style (as element or inline) not allowed
		expect(domPurifySanitizeHtml('<style>*{color: red}</style>')).toBe('');
		expect(
			domPurifySanitizeHtml(
				'<div id="33"><a style="pointer-events:none;position:absolute;"><a style="position:absolute;" onclick="alert(33);">XXX</a></a></div>'
			)
		).toBe('<div id="33"><a></a><a>XXX</a></div>');

		// sanitizes SVG
		expect(domPurifySanitizeHtml('<div><svg><g/onload=alert(2)//<p></div>')).toBe('<div><svg><g></g></svg></div>');

		// allows style tags but ensure they are sanitized
		expect(domPurifySanitizeHtml('<style type="text/css">p { </style><script>alert()</script> }</style>')).toBe('}');
	});
});
