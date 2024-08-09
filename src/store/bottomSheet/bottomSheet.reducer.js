export const BOTTOM_SHEET_CHANGED = 'bottomSheet/contentChanged';
export const MAIN_BOTTOM_SHEET_ID = 'main';

/**
 * @typedef {Object} BottomSheetContent
 * @property {string} id the id of the bottomSheet
 * @property {object|null} content the content of the bottomSheet
 */

export const initialState = {
	/**
	 * @property {Array<BottomSheetContent>}
	 */
	data: [],
	/**
	 * @property {string| null}
	 */
	active: null
};

const addOrReplaceContent = (state, payload) => {
	const { id, content } = payload;
	const currentIndex = state.data.findIndex((b) => b.id === id);
	const add = () => {
		return content ? [payload, ...state.data] : state.data;
	};
	const replace = () => {
		return content ? [payload, ...state.data.toSpliced(currentIndex, 1)] : state.data.with(currentIndex, { id, content: null });
	};
	return currentIndex === -1 ? add() : replace();
};

const getActive = (bottomSheets) => {
	const mostActiveBottomSheet = bottomSheets.find((b) => !!b.content);
	return mostActiveBottomSheet ? mostActiveBottomSheet.id : null;
};

export const bottomSheetReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case BOTTOM_SHEET_CHANGED: {
			const changedBottomSheets = addOrReplaceContent(state, payload);
			return {
				...state,
				data: changedBottomSheets,
				active: getActive(changedBottomSheets)
			};
		}
	}

	return state;
};
