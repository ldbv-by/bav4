export const CONTEXT_ADD_MENUE_COMMANDS = 'components/contextMenue/addCommands';

export const initialState = {
	commands: {}
};

export const contextMenueReducer = (state = initialState, action) => {
	const {
		type,
		payload
	} = action;
	switch (type) {
		case CONTEXT_ADD_MENUE_COMMANDS: {
			const {
				contextTarget,
				commands
			} = payload;
			return {
				...state,
				commands:{
					...state.commands,[contextTarget]:commands
				}
			};
		}
	}

	return state;
};