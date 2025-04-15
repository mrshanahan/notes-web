// depends on notes.js

var originalNote = null;

var token;

function setEditProperties(note) {
    const noteTitle = document.getElementById('note-title');
    noteTitle.value = note.title;

    const pageTitle = document.getElementsByTagName('title')[0];
    pageTitle.innerText = 'Edit: ' + note.title;

    originalNote = note;
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

    getNote(id, token, setEditProperties);

    getNoteContent(id, token, function (response) {
        const editor = document.getElementById('editor');
        editor.innerHTML = genericTextToHtmlText(response);
    })
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
            });
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
        });
    }
}

function updateContentAndRedirect(id, postSaveURL) {
    const editorNode = document.getElementById('editor');
    updateNoteContent(id, editorNode.innerText, token, () => {
        console.log('Updated note contents with id ' + id);
        window.location.href = postSaveURL;
    });
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
        });
    }
}

function processEditorKeyDown(args) {
    if (args.key === 'Enter' && args.ctrlKey === true && args.shiftKey === true) {
        saveNoteThenRedirect('/');
    } else if (args.key === 'Enter' && args.ctrlKey === true) {
        saveNoteThenRedirect();
    }
}

window.onload = () => {
    loadNoteContent();
}