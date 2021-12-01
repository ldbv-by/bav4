// https://medium.com/the-z/making-a-resizable-div-in-js-is-not-easy-as-you-think-bda19a1bc53d

/*Make resizable div by Hung Nguyen*/
export const makeResizableDiv = (div) => {
	const element = document.querySelector(div);
	const resizers = document.querySelectorAll(div + ' .resizer');
	const minimum_size = 20;
	let original_width = 0;
	let original_height = 0;
	let original_x = 0;
	let original_y = 0;
	let original_mouse_x = 0;
	let original_mouse_y = 0;
	for (let i = 0; i < resizers.length; i++) {
		const currentResizer = resizers[i];
		currentResizer.addEventListener('mousedown', (e) => {
			e.preventDefault();
			original_width = parseFloat(getComputedStyle(element, null).getPropertyValue('width').replace('px', ''));
			original_height = parseFloat(getComputedStyle(element, null).getPropertyValue('height').replace('px', ''));
			original_x = element.getBoundingClientRect().left;
			original_y = element.getBoundingClientRect().top;
			original_mouse_x = e.pageX;
			original_mouse_y = e.pageY;
			window.addEventListener('mousemove', resize);
			window.addEventListener('mouseup', stopResize);
		});

		const resize = (e) => {
			if (currentResizer.classList.contains('bottom-right')) {
				const width = original_width + (e.pageX - original_mouse_x);
				const height = original_height + (e.pageY - original_mouse_y);
				if (width > minimum_size) {
					element.style.width = width + 'px';
				}
				if (height > minimum_size) {
					element.style.height = height + 'px';
				}
			}
			else if (currentResizer.classList.contains('bottom-left')) {
				const height = original_height + (e.pageY - original_mouse_y);
				const width = original_width - (e.pageX - original_mouse_x);
				if (height > minimum_size) {
					element.style.height = height + 'px';
				}
				if (width > minimum_size) {
					element.style.width = width + 'px';
					element.style.left = original_x + (e.pageX - original_mouse_x) + 'px';
				}
			}
			else if (currentResizer.classList.contains('top-right')) {
				const width = original_width + (e.pageX - original_mouse_x);
				const height = original_height - (e.pageY - original_mouse_y);
				if (width > minimum_size) {
					element.style.width = width + 'px';
				}
				if (height > minimum_size) {
					element.style.height = height + 'px';
					element.style.top = original_y + (e.pageY - original_mouse_y) + 'px';
				}
			}
			else {
				const width = original_width - (e.pageX - original_mouse_x);
				const height = original_height - (e.pageY - original_mouse_y);
				if (width > minimum_size) {
					element.style.width = width + 'px';
					element.style.left = original_x + (e.pageX - original_mouse_x) + 'px';
				}
				if (height > minimum_size) {
					element.style.height = height + 'px';
					element.style.top = original_y + (e.pageY - original_mouse_y) + 'px';
				}
			}
		};

		const stopResize = () => {
			window.removeEventListener('mousemove', resize);
		};
	}
};
