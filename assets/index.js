// depends on notes.js

var notesList;
var sortDirection = 1;
var sortCriteria = {
    'updated-on': {
        title: 'Last updated',
        compare: compareByUpdatedOn
    },
    'created-on': {
        title: 'Most recently created',
        compare: compareByCreatedOn
    },
    'title': {
        title: 'Title',
        compare: compareByTitle
    }
};
var currentSortCriterion = 'updated-on';

function compareByUpdatedOn(x, y) {
    // NB: Reversed here to sort by latest by default
    return sortDirection * (Date.parse(y.updated_on) - Date.parse(x.updated_on));
}

function compareByCreatedOn(x, y) {
    // NB: Reversed here to sort by latest by default
    return sortDirection * (Date.parse(y.created_on) - Date.parse(x.created_on));
}

function compareByTitle(x, y) {
    return sortDirection * x.title.localeCompare(y.title, 'en');
}

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
    notes.sort(sortCriteria[currentSortCriterion].compare);
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
    noteNode.setAttribute('onclick', "noteClick(" + note.id + ");");
    noteNode.setAttribute('id', 'note-' + note.id);
    noteNode.setAttribute('tabindex', '0');
    const noteNodeMetadataContainer = document.createElement('div');
    noteNodeMetadataContainer.className = 'note-metadata';
    const noteNodeTimestampContainer = document.createElement('div');
    noteNodeTimestampContainer.className = 'note-timestamp-container';
    const noteNodeCreatedTime = document.createElement('div');
    noteNodeCreatedTime.className = 'note-timestamp';
    noteNodeCreatedTime.innerHTML = '<b>Created:</b> ' + new Date(note.created_on).toLocaleString();
    const noteNodeUpdatedTime = document.createElement('div');
    noteNodeUpdatedTime.className = 'note-timestamp';
    noteNodeUpdatedTime.innerHTML = '<b>Updated:</b> ' + new Date(note.updated_on).toLocaleString();
    const noteNodeDeleteButtonContainer = document.createElement('div');
    noteNodeDeleteButtonContainer.className = 'note-delete-button-container';
    const noteNodeDeleteButton = document.createElement('button');
    noteNodeDeleteButton.setAttribute('onclick', "deleteButtonClick(" + note.id + ", event);");
    noteNodeDeleteButton.id = 'delete-note-' + note.id;
    noteNodeDeleteButton.className = 'note-delete-button';
    noteNodeDeleteButton.innerText = 'X';
    const noteNodeTitle = document.createElement('div');
    noteNodeTitle.className = 'note-title';
    noteNodeTitle.innerText = note.title;
    const noteNodePreview = document.createElement('div');
    noteNodePreview.className = 'note-preview';
    noteNodePreview.innerHTML = genericTextToHtmlText(note.content_preview);

    noteNodeDeleteButtonContainer.appendChild(noteNodeDeleteButton);
    noteNodeTimestampContainer.appendChild(noteNodeCreatedTime);
    noteNodeTimestampContainer.appendChild(noteNodeUpdatedTime);
    noteNodeMetadataContainer.appendChild(noteNodeTitle);
    noteNodeMetadataContainer.appendChild(noteNodeTimestampContainer);
    noteNodeMetadataContainer.appendChild(noteNodeDeleteButtonContainer);
    noteNode.appendChild(noteNodeMetadataContainer);
    noteNode.appendChild(noteNodePreview);
    return noteNode;
}

function toggleSortDirection(button) {
    sortDirection *= -1;
    updateSortButton(button);
    renderNotes();
}

function updateSortButton(button) {
    if (sortDirection > 0) {
        button.innerText = '↑';
        button.className = button.className.replace(/sort-button-[^\s]*/, 'sort-button-up');
    } else {
        button.innerText = '↓';
        button.className = button.className.replace(/sort-button-[^\s]*/, 'sort-button-down');
    }
}

function setSortCriterion(criterion) {
    const isValidCriterion = sortCriteria.hasOwnProperty(criterion);
    if (isValidCriterion && currentSortCriterion !== criterion) {
        currentSortCriterion = criterion;
        renderNotes();
    } else if (!isValidCriterion) {
        console.log('error: no such sort criteion: ' + criterion);
    }
}

function noteClick(id) {
    window.location.href = '/edit.html?id=' + id;
}

function deleteButtonClick(id, event) {
    event.stopPropagation();

    const token = validateAuthToken();
    if (!token) {
        return;
    }
    if (confirm('Delete note?')) {
        deleteNote(id, token, _ => {
            loadNotes();
        });
    }
}

function load() {
    loadNotes();

    const sortDirectionButton = document.getElementById('sort-direction-button');
    updateSortButton(sortDirectionButton);

    const sortCriterionSelect = document.getElementById('sort-criterion-select');
    for (const [k, v] of Object.entries(sortCriteria)) {
        const option = document.createElement('option');
        option.value = k;
        option.innerText = v.title;
        sortCriterionSelect.appendChild(option);
    }
    setSortCriterion(currentSortCriterion);
}

window.onload = load;