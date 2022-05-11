import DOMPurify from 'dompurify';

export const domPurifySanitizeHtmlProvider = (htmlString) => {
	return DOMPurify.sanitize(htmlString);
};
