// depends on notes.js

function loadNoteContent() {
    const token = validateAuthToken();
    if (!token) {
        return;
    }

    const id = getUrlQueryParameter('id');
    if (!id) {
        return;
    }

    getNote(id, token, function (response) {
        const noteTitle = document.getElementById('note-title');
        noteTitle.innerText = response.title;

        const pageTitle = document.getElementsByTagName('title')[0];
        pageTitle.innerText = 'Edit: ' + response.title;
    })

    getNoteContent(id, token, function (response) {
        const editor = document.getElementById('editor');
        var lines = response.split('\n');
        // console.log(lines);
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            // if (line.match(/^\s+/)) {
            //     console.log('Matches: ' + line);
            // }
            while (line.match(/^\s+/)) {
                line = line.replace(/^(\s*)\s/, '$1&nbsp;');
            }
            while (line.match(/\s\s+/)) {
                line = line.replace(/(\s+)\s/, '$1&nbsp;');
            }
            lines[i] = line;
        }
        editor.innerHTML = lines.join('<br/>');
    })
}