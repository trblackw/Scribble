import { ADD_NOTE, DELETE_NOTE, UPDATE_NOTE, FETCH_NOTES } from './constants';

export default (state, { type, note, notes }) => {
   switch (type) {
      case FETCH_NOTES:
         return { ...state, notes }
		case ADD_NOTE:
			return { ...state, note };
		case DELETE_NOTE:
			state = state.filter(({ id }) => id !== note.id);
			return state;
		case UPDATE_NOTE:
			return {};
		default:
			return state;
	}
};
