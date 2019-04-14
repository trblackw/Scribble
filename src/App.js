import { onCreateNote, onDeleteNote, onUpdateNote } from './graphql/subscriptions';
import { createNote, deleteNote, updateNote } from './graphql/mutations';
import { listNotes } from './graphql/queries';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react';

const App = () => {
	const [notes, setNotes] = useState([]);
	const [note, setNote] = useState('');
	const [noteId, setNoteId] = useState('');
	const noteInput = useRef();

	const getInitialNoteState = useCallback(async () => {
		const { error, loading, data: { listNotes: { items } } } = await API.graphql(graphqlOperation(listNotes));
		if (!error && !loading) return setNotes(items);
	}, []);

	useEffect(() => {
		getInitialNoteState();
		//Listeners
		const createNoteListener = API.graphql(graphqlOperation(onCreateNote)).subscribe({
			next: ({ value: { data } }) => {
				const newNote = data.onCreateNote;
				setNotes(prevNotes => [...prevNotes.filter(({ id }) => id !== newNote.id), newNote]);
			}
		});
		const deleteNoteListener = API.graphql(graphqlOperation(onDeleteNote)).subscribe({
			next: ({ value: { data } }) => {
				const deletedNote = data.onDeleteNote;
				setNotes(prevNotes => prevNotes.filter(({ id }) => id !== deletedNote.id));
			}
		});
		const updateNoteListener = API.graphql(graphqlOperation(onUpdateNote)).subscribe({
			next: ({ value: { data } }) => {
				const updatedNote = data.onUpdateNote;
				setNotes(prevNotes =>
					prevNotes.map(note => {
						if (note.id === updatedNote.id) {
							note = { ...note, note: updatedNote.note };
							return note;
						} else {
							return note;
						}
					})
				);
			}
		});
		//clean up
		return () => {
			createNoteListener.unsubscribe();
			deleteNoteListener.unsubscribe();
			updateNoteListener.unsubscribe();
		};
	}, []);

	//event handlers
	const handleInput = e => setNote(e.target.value);

	const handleDelete = async id => await API.graphql(graphqlOperation(deleteNote, { input: { id } }));

	const handleSetNote = (note, id) => {
		setNote(note);
		setNoteId(id);
		noteInput.current.focus();
	};

	const hasExistingNote = () => {
		if (noteId) {
			return notes.findIndex(({ id }) => id === noteId) > -1;
		}
		return false;
	};

	const handleUpdateNote = async () => {
		await API.graphql(graphqlOperation(updateNote, { input: { note, id: noteId } }));
		setNote('');
		setNoteId('');
	};

	const handleAddNote = async e => {
		e.preventDefault();
		//check if there's an existing matching note
		if (hasExistingNote()) {
			handleUpdateNote();
		} else {
			await API.graphql(graphqlOperation(createNote, { input: { note } }));
			setNote('');
		}
	};

	return (
		<div className="flex flex-column items-center justify-center pa3 bg-washed-red">
			<h1 className="code f2-l">Scribble</h1>
			<form className="mb3" onSubmit={handleAddNote}>
				<input type="text" className="pa2 f4" value={note} ref={noteInput} placeholder="write your note" onChange={handleInput} />
				<button type="submit" className="pa2 f4">
					{!noteId ? 'Add' : 'Update'}
				</button>
			</form>
			<div>
				{notes &&
					notes.map(({ id, note }) => (
						<div className="flex items-center" key={id}>
							<li className="list pa1 f3 pointer" onClick={() => handleSetNote(note, id)}>
								{note}
							</li>
							<button className="bg-transparent bn f4" onClick={() => handleDelete(id)}>
								<span className="red pointer">&times;</span>
							</button>
						</div>
					))}
			</div>
		</div>
	);
};

export default withAuthenticator(App, { includeGreetings: true });
