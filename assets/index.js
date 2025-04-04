// depends on notes.js

var notesList;

function loadNotes() {
    const token = validateAuthToken();
    if (!token) {
        return;
    }

    getNotes(token, function (response) {
        notesList = response;
        renderNotes();
    })
}

function renderNotes() {
    const filter = document.getElementById('notes-list-filter').value;
    const notes = notesList.filter(n => n.title.toLowerCase().indexOf(filter) >= 0);
    const notesListElement = document.getElementById('notes-list');

    // Not necessarily the fastest method to remove all children but good enough for us.
    // See some excellent analysis here: https://stackoverflow.com/a/75900408/873216
    notesListElement.replaceChildren();

    for (var i = 0; i < notes.length; i++) {
        const noteElement = createNoteElement(notes[i]);
        notesListElement.appendChild(noteElement);
    }
}

function createNoteElement(note) {
    const noteNode = document.createElement('div');
    noteNode.className = 'note';
    noteNode.setAttribute('onclick', "location.href = '/edit.html?id=" + note.id + "';");
    noteNode.setAttribute('id', 'note-' + note.id);
    noteNode.setAttribute('tabindex', '0');
    const noteNodeTitle = document.createElement('div');
    noteNodeTitle.className = 'note-title';
    noteNodeTitle.innerText = note.title;
    const noteNodePreview = document.createElement('div');
    noteNodePreview.className = 'note-preview';
    noteNodePreview.innerHTML = genericTextToHtmlText(note.content_preview);
    noteNode.appendChild(noteNodeTitle);
    noteNode.appendChild(noteNodePreview);
    return noteNode;
}

window.onload = loadNotes;