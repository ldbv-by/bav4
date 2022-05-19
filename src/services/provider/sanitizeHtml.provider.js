import DOMPurify from 'dompurify';

export const domPurifySanitizeHtml = (htmlString) => {
	return DOMPurify.sanitize(htmlString);
};
