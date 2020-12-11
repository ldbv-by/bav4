export const CONTEXT_ADD_MENUE_COMMAND = 'components/contextMenue/addCommand';

export const initialState = {
	commands: {}
};

export const contextMenueReducer = (state = initialState, action) => {
	const {
		type,
		payload
	} = action;
	switch (type) {
		case CONTEXT_ADD_MENUE_COMMAND: {
			const {
				contextTarget,
				command
			} = payload;
			return {
				...state,
				commands: state.commands[contextTarget] = command
			};
		}
	}

	return state;
};