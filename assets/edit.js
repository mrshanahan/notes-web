// depends on notes.js

var originalNote = null;

var token;

var editInProgress = false;

function setEditPropertiesFromNote(note) {
    setEditProperties(note, note.title);
}

function setEditPropertiesFromEdit(note, noteLastUpdated, editTitle) {
    const title = noteLastUpdated === note.updated_on && editTitle !== note.title
        ? editTitle
        : note.title;
    setEditProperties(note, title);
}

function setEditProperties(note, title) {
    const noteTitle = document.getElementById('note-title');
    noteTitle.value = title;

    const pageTitle = document.getElementsByTagName('title')[0];
    pageTitle.innerText = 'Edit: ' + title;

    originalNote = note;
}

function setEditorContent(content) {
    const editor = document.getElementById('editor');
    editor.innerHTML = genericTextToHtmlText(content);
}

function saveEditorContent() {
    if (editInProgress) {
        const titleNode = document.getElementById('note-title');
        const newTitle = titleNode.value.trimEnd();
        const editorNode = document.getElementById('editor');

        const editDataTs = originalNote?.updated_on ?? '';
        const editDataTitle = newTitle;
        const editData = editorNode.innerText;

        sessionStorage.setItem("editInProgress", "true");
        sessionStorage.setItem("editDataTs", editDataTs);
        sessionStorage.setItem("editDataTitle", editDataTitle);
        sessionStorage.setItem("editData", editData);
    }
}

function setCreateProperties() {
    const pageTitle = document.getElementsByTagName('title')[0];
    pageTitle.innerText = 'Create note';

    const deleteButton = document.getElementById('delete');
    deleteButton.parentNode.removeChild(deleteButton);
}

function loadNoteContent() {
    token = validateAuthToken();
    if (!token) {
        return;
    }

    const id = getUrlQueryParameter('id');
    if (!id) {
        setCreateProperties();
        return;
    }

    const editInProgress = sessionStorage.getItem("editInProgress");
    if (editInProgress) {
        const editDataTs = sessionStorage.getItem("editDataTs");
        const editDataTitle = sessionStorage.getItem("editDataTitle");

        getNote(id, token, function (note) {
            setEditPropertiesFromEdit(note, editDataTs, editDataTitle);

            // This happens inside the getNote callback here so that we
            // can check the updated timestamp before setting the content
            if (editDataTs === note.updated_on) {
                const editData = sessionStorage.getItem("editData");
                setEditorContent(editData);
                sessionStorage.clear();
            } else {
                getNoteContent(id, token, function (response) {
                    setEditorContent(response);
                    sessionStorage.clear();
                });
            }
        });
    } else {
        getNote(id, token, setEditPropertiesFromNote);

        getNoteContent(id, token, setEditorContent);
    }
}

function checkTitleChange() {
    if (originalNote !== null) {
        var titleNode = document.getElementById('note-title');
        if (originalNote.title !== titleNode.value.trimEnd()) {
            titleNode.className = 'note-title-edited';
        } else {
            titleNode.className = '';
        }
    }
}

// TODO: Disable save on empty note. Causes 400 on API side.

function saveNoteThenRedirect(postSaveURL) {
    token = getCookie('access_token'); // TODO: Remove me!
    const titleNode = document.getElementById('note-title');
    const newTitle = titleNode.value.trimEnd();
    if (originalNote !== null) {
        if (postSaveURL == null) {
            postSaveURL = '/edit.html?id=' + originalNote.id;
        }
        if (originalNote.title !== newTitle) {
            updateNote(originalNote.id, { title: newTitle }, token, (response) => {
                console.log('Updated note with id ' + response.id + ': "' + originalNote.title + '" -> "' + newTitle + '"');
                updateContentAndRedirect(response.id, postSaveURL);
            }, saveEditorContent);
        } else {
            updateContentAndRedirect(originalNote.id, postSaveURL);
        }
    } else {
        createNote({ title: titleNode.value }, token, (response) => {
            console.log('Note created with id ' + response.id);
            if (postSaveURL == null) {
                postSaveURL = '/edit.html?id=' + response.id;
            }
            updateContentAndRedirect(response.id, postSaveURL);
        }, saveEditorContent);
    }
}

function updateContentAndRedirect(id, postSaveURL) {
    const editorNode = document.getElementById('editor');
    updateNoteContent(id, editorNode.innerText, token, () => {
        console.log('Updated note contents with id ' + id);

        // If we redirect before existing this callback for some reason the request
        // doesn't "complete" according to the browser (sometimes, at least in Firefox).
        // It appeared to affect whether or not the note actually saved but I couldn't
        // repro that locally, only saw the "incomplete" request locally. A short timeout
        // before redirect appears to fix that but is frustratingly hacky.
        setTimeout(() => window.location.href = postSaveURL, 100);
    }, saveEditorContent);
}

function deleteNoteAndRedirect(postSaveURL) {
    if (originalNote === null) {
        return;
    }

    const token = validateAuthToken();
    if (!token) {
        return;
    }
    if (confirm('Delete note?')) {
        deleteNote(originalNote.id, token, _ => {
            window.location.href = postSaveURL;
        }, saveEditorContent);
    }
}

function processEditorKeyDown(args) {
    if (args.key === 'Enter' && args.ctrlKey === true && args.shiftKey === true) {
        saveNoteThenRedirect('/');
    } else if (args.key === 'Enter' && args.ctrlKey === true) {
        saveNoteThenRedirect();
    }
    editInProgress = true;
}

window.onload = () => {
    loadNoteContent();
}