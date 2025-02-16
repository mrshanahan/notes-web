// depends on notes.js

function loadNotes() {
    const token = validateAuthToken();
    if (!token) {
        return;
    }

    getNotes(token, function (response) {
        const notesList = document.getElementById('notes-list');
        for (var i = 0; i < response.length; i++) {
            var note = response[i];
            const noteNode = document.createElement('a');
            noteNode.className = 'note';
            noteNode.innerText = note.title;
            noteNode.setAttribute('href', "/edit.html?id=" + note.id);
            noteNode.setAttribute('id', 'note-' + note.id);
            notesList.appendChild(noteNode);
        }
    })
}

window.onload = loadNotes;