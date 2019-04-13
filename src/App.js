import { createNote, deleteNote } from './graphql/mutations';
import { listNotes } from './graphql/queries';
// import { ADD_NOTE, FETCH_NOTES } from './state/constants';
import React, { useState, useEffect, useReducer, useCallback } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react';
// import NotesReducer from './state/reducer';

const App = () => {
	// const [notes, dispatch] = useReducer(NotesReducer);
	const [notes, setNotes] = useState([]);
	const [note, setNote] = useState('');

	const getInitialNoteState = async () => {
		const { error, loading, data: { listNotes: { items } } } = await API.graphql(graphqlOperation(listNotes));
		// if (!error && !loading) return dispatch({ type: FETCH_NOTES, notes: items, loading: false });
		if (!error && !loading) return setNotes(items);
	};

	useEffect(() => {
		getInitialNoteState();
	}, []);

	//event handlers
	const handleInput = e => setNote(e.target.value);
	const handleDelete = async id => {
		const input = { id };
		const { data } = await API.graphql(graphqlOperation(deleteNote, { input }));
		return setNotes(notes.filter(({ id }) => id !== data.deleteNote.id));
	};

	const addNote = async e => {
		e.preventDefault();
		const input = { note };
		const { data } = await API.graphql(graphqlOperation(createNote, { input }));
		setNote([...note, data.createNote]);
		// dispatch({ type: ADD_NOTE, note: data.createNote });
		setNote('');
		// dispatch({ type: ADD_NOTE, note: data.createNote });
	};

	return (
		<div className="flex flex-column items-center justify-center pa3 bg-washed-red">
			<h1 className="code f2-l">Scribble</h1>
			<form className="mb3" onSubmit={addNote}>
				<input type="text" className="pa2 f4" value={note} placeholder="write your note" onChange={handleInput} />
				<button type="submit" className="pa2 f4">
					Add
				</button>
			</form>
			<div>
				{notes &&
					notes.map(({ id, note }) => (
						<div className="flex items-center" key={id}>
							<li className="list pa1 f3">{note}</li>
							<button className="bg-transparent bn f4" onClick={() => handleDelete(id)}>
								<span className="red">&times;</span>
							</button>
						</div>
					))}
			</div>
		</div>
	);
};

export default withAuthenticator(App, { includeGreetings: true });
