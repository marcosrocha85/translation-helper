const progressContainer = $('#progress-container')
const progress = $('#progress')
const progressBar = $('#progress-bar')
let table
function resetProgress() {
    if (!progressBar.hasClass('progress-bar-animated')) {
        console.log('Não tem a classe')
        progressBar.addClass('progress-bar-animated')
    }
    progressBar.css('width', '100%')
    progress.attr('aria-valuenow', 0)
}

function setMaxProgress(value) {
    progress.attr('aria-valuemax', value)
}

function setCurrentProgress(value) {
    progressBar.removeClass('progress-bar-animated')
    const max = progress.attr('aria-valuemax')
    const percentage = Math.floor((value * 100) / max)
    progressBar.css('width', percentage + '%')
    progress.attr('aria-valuenow', value)
}

function hideFieldEditor() {
    const fieldEditor = $('#field_editor')
    const target = $(fieldEditor).data('key')
    if (target === undefined) {
        fieldEditor.remove()
        return true
    }
    $($('tr[data-id='+target+']').children()[2])
        .html(fieldEditor.val())
        .data('original-value', fieldEditor.val())
    const idx = target.split('_')[1] - 1
    table.row(idx).data()[2] = fieldEditor.val()
    if (fieldEditor) {
        fieldEditor.remove()
    }
    return true
}

function loadColumnClickable() {
    $('.column-clickable').off('click').on('click', function (e) {
        if (!$(e.target).is('td')) {
            return
        }

        if ($('#field_editor').is(':visible')) {
            if (!hideFieldEditor()) {
                return
            }
        }
        const cell = $(e.target)[0]
        const id = $(cell.parentElement).attr('data-id')
        const editField = document.createElement('textarea')
        editField.id = 'field_editor'
        editField.dataset['key'] = id
        editField.value = $(cell).data('original-value')
        $(editField)
            .css('min-height', $(cell).height())
            .css('max-height', $(cell).height())
            .data('original-value', editField.value)
            .off('blur').on('blur', function (e) {
                hideFieldEditor()
            })
        $(cell).html('').append(editField)
        $(editField).trigger('focus')
    })
}

function fillTable(jsonData, translationData) {
    const maxProgress = Object.keys(jsonData).length - 1
    resetProgress()
    setMaxProgress(maxProgress)
    let currentProgress = 0
    for (const element in jsonData) {
        setCurrentProgress(++currentProgress)
        let translation = jsonData[element]
        if (translationData && translationData.hasOwnProperty(element)) {
            translation = translationData[element]
        }
        const node = table.row
            .add([element, jsonData[element], translation])
            .draw()
            .node()
        $(node).attr('data-id', 'traducao_' + currentProgress)
        $($(node).children()[2])
            .attr('id', 'col2_traducao_' + currentProgress)
            .addClass('no-padding')
            .addClass('column-clickable')
            .data('original-value', jsonData[element])
    }
    //loadColumnClickable()
}

function loadTranslationJson(translationFile) {
    return new Promise((resolve, reject) => {
        if (translationFile.files.length === 0) {
            resolve()
        }

        const readerB = new FileReader()
        try {
            readerB.onload = function (event) {
                let content = event.target.result
                const translation = JSON.parse(content)
                resolve(translation)
            }
            readerB.readAsText(translationFile.files[0])
        } catch (e) {
            reject(e)
        }
    })
}

function loadJson(jsonFile, translationFile) {
    return new Promise((resolve, reject) => {
        loadTranslationJson(translationFile)
            .then((translationJson) => {
                const reader = new FileReader()
                try {
                    reader.onload = function (event) {
                        let content = event.target.result
                        let data = JSON.parse(content)
                        fillTable(data, translationJson)
                        resolve()
                    }
                    reader.readAsText(jsonFile.files[0])
                } catch (e) {
                    reject(e)
                }
            })
            .catch((err) => {
                reject(err)
            })
    })
}

$('#loadButton').on('click', function () {
    progressContainer.show()
    table.clear()
    loadJson($('#jsonFile')[0], $('#translationFile')[0])
        .then(() => {
            progressContainer.hide()
        })
        .catch((e) => {
            console.log(e)
            progressContainer.hide()
        })
});

$('#export').on('click', function () {
    const json = {}
    table.rows().every(function (rowIdx, tableLoop, rowLoop) {
        json[this.data()[0]] = this.data()[2]
    })
    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(json)))
    element.setAttribute('download', 'pt-BR.json')
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
})

$(function() {
    table = $('#table').DataTable({
        order: [],
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/pt-BR.json'
        },
        responsive: true,
        pageLength: 100
    })
        .draw(true)
        .columns.adjust()
        .on('page.dt', function () {
            hideFieldEditor()
        })
        .on('draw', function (e, settings, data) {
            loadColumnClickable()
        });
    progressContainer.hide()
});
