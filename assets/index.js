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
            notesList.appendChild(noteNode);
        }
    })
}

window.onload = loadNotes;