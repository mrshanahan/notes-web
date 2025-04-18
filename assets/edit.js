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

function saveNote() {
    const titleNode = document.getElementById('note-title');
    const newTitle = titleNode.value.trimEnd();
    if (originalNote !== null) {
        if (originalNote.title !== newTitle) {
            updateNote(originalNote.id, { title: newTitle }, token, (response) => {
                console.log('Updated note with id ' + response.id + ': "' + originalNote.title + '" -> "' + newTitle + '"');
                updateContentAndReload(response.id);
            });
        } else {
            updateContentAndReload(originalNote.id);
        }
    } else {
        createNote({ title: titleNode.value }, token, (response) => {
            console.log('Note created with id ' + response.id);
            updateContentAndReload(response.id);
        });
    }
}

function updateContentAndReload(id) {
    const editorNode = document.getElementById('editor');
    updateNoteContent(id, editorNode.innerText, token, () => {
        console.log('Updated note contents with id ' + id);
        window.location.href = '/edit.html?id=' + id;
    });
}

function saveNoteAndRedirect(toUrl) {
    saveNote();
    window.location.href = toUrl;
}

function processEditorKeyDown(args) {
    if (args.key === 'Enter' && args.ctrlKey === true && args.shiftKey === true) {
        saveNoteAndRedirect('/');
    } else if (args.key === 'Enter' && args.ctrlKey === true) {
        saveNote();
    }
}

window.onload = () => {
    loadNoteContent();
}