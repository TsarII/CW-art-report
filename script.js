// =====================================================
// CW Art Report Generator
// script.js
// =====================================================

// ---------- Главные элементы ----------

const artistIdInput = document.getElementById("artistId");
const factionInput = document.getElementById("faction");
const descriptionInput = document.getElementById("description");

const sectionsContainer = document.getElementById("sectionsContainer");

const addSectionBtn = document.getElementById("addSectionBtn");

const generateBtn = document.getElementById("generateBtn");
const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");
const clearBtn = document.getElementById("clearBtn");

const output = document.getElementById("output");

const sectionTemplate = document.getElementById("sectionTemplate");
const workTemplate = document.getElementById("workTemplate");


// =====================================================
// Создание раздела
// =====================================================

function createSection(data = null) {

    const section =
        sectionTemplate.content.firstElementChild.cloneNode(true);

    const titleInput =
        section.querySelector(".section-title");

    const worksContainer =
        section.querySelector(".works-container");

    const addWorkButton =
        section.querySelector(".add-work");

    const deleteButton =
        section.querySelector(".delete-section");


    // Заголовок раздела

    if (data) {

        titleInput.value = data.title;

    }


    // Добавить работу

    addWorkButton.addEventListener("click", () => {

        createWork(worksContainer);

        updateWorkNumbers(worksContainer);

        autoGenerate();

        saveData();

    });


    // Удалить раздел

    deleteButton.addEventListener("click", () => {

        if (!confirm("Удалить раздел?"))
            return;

        section.remove();

        autoGenerate();

        saveData();

    });


    // Изменение названия

    titleInput.addEventListener("input", () => {

        autoGenerate();

        saveData();

    });


    // Если загружены данные

    if (data && data.works.length > 0) {

        data.works.forEach(work => {

            createWork(worksContainer, work);

        });

    }

    else {

        // Первая пустая работа

        createWork(worksContainer);

    }


    updateWorkNumbers(worksContainer);

    sectionsContainer.appendChild(section);

}



// =====================================================
// Создание работы
// =====================================================

function createWork(container, data = null) {

    const work =
        workTemplate.content.firstElementChild.cloneNode(true);

    const imageInput =
        work.querySelector(".image-link");

    const proofInput =
        work.querySelector(".proof-link");

    const deleteButton =
        work.querySelector(".delete-work");


    // Заполняем данные

    if (data) {

        imageInput.value = data.image;

        proofInput.value = data.proof;

    }


    // Любое изменение

    imageInput.addEventListener("input", () => {

        autoGenerate();

        saveData();

    });


    proofInput.addEventListener("input", () => {

        autoGenerate();

        saveData();

    });


    // Удаление

    deleteButton.addEventListener("click", () => {

        if (!confirm("Удалить работу?"))
            return;

        work.remove();

        updateWorkNumbers(container);

        autoGenerate();

        saveData();

    });


    container.appendChild(work);

}



// =====================================================
// Перенумерация работ
// =====================================================

function updateWorkNumbers(container) {

    const works =
        container.querySelectorAll(".work-card");

    works.forEach((work, index) => {

        work.querySelector(".work-number").textContent =
            "Работа № " + (index + 1);

    });

}



// =====================================================
// Получить данные со страницы
// =====================================================

function collectData() {

    const result = {

        artistId: artistIdInput.value.trim(),

        faction: factionInput.value.trim(),

        description: descriptionInput.value.trim(),

        sections: []

    };


    const sections =
        sectionsContainer.querySelectorAll(".report-section");


    sections.forEach(section => {

        const sectionData = {

            title:
                section.querySelector(".section-title").value.trim(),

            works: []

        };


        const works =
            section.querySelectorAll(".work-card");


        works.forEach(work => {

            sectionData.works.push({

                image:
                    work.querySelector(".image-link").value.trim(),

                proof:
                    work.querySelector(".proof-link").value.trim()

            });

        });


        result.sections.push(sectionData);

    });


    return result;

}
// =====================================================
// Автоматическая генерация
// =====================================================

function autoGenerate() {

    const data = collectData();

    output.value = generateBBCode(data);

}



// =====================================================
// Генерация BBCode
// =====================================================

function generateBBCode(data) {

    let bb = "";

    if (
        data.artistId === "" &&
        data.faction === "" &&
        data.description === ""
    ) {
        return "";
    }

    bb += `[link${data.artistId}] (${data.artistId}) нарисовал в ${data.faction} ${data.description}. Прошу выдать баллы за работу:\n\n`;

    data.sections.forEach(section => {

        if (section.title === "")
            return;

        bb += `[center][b]${section.title}:[/b][/center]\n\n`;

        bb += `[center][table][tr]`;

        section.works.forEach((work, index) => {

            if (work.image === "")
                return;

            bb += `[td]`;

            bb += `${index + 1}. `;

            bb += `[img]${work.image}[/img]\n\n`;

            bb += `[url]${work.image}[/url]`;

            if (work.proof !== "") {

                bb += `\n\n`;

                bb += `Доказательство: `;

                bb += `[url]${work.proof}[/url]`;

            }

            bb += `[/td]\n\n`;

        });

        bb += `[/tr]\n`;

        bb += `[/table][/center]\n\n`;

    });

    return bb;

}



// =====================================================
// Проверка обязательных полей
// =====================================================

function validateInputs() {

    let ok = true;

    [
        artistIdInput,
        factionInput,
        descriptionInput
    ].forEach(input => {

        if (input.value.trim() === "") {

            input.style.borderColor = "#e74c3c";

            ok = false;

        }

        else {

            input.style.borderColor = "";

        }

    });

    document
        .querySelectorAll(".image-link")
        .forEach(input => {

            if (input.value.trim() === "") {

                input.style.borderColor = "#e74c3c";

                ok = false;

            }

            else {

                input.style.borderColor = "";

            }

        });

    return ok;

}



// =====================================================
// Кнопка генерации
// =====================================================

generateBtn.addEventListener("click", () => {

    if (!validateInputs()) {

        alert("Заполните все обязательные поля.");

        return;

    }

    autoGenerate();

});



// =====================================================
// Копирование
// =====================================================

copyBtn.addEventListener("click", async () => {

    autoGenerate();

    try {

        await navigator.clipboard.writeText(output.value);

        const old = copyBtn.textContent;

        copyBtn.textContent = "✔ Скопировано";

        setTimeout(() => {

            copyBtn.textContent = old;

        }, 1500);

    }

    catch {

        alert("Не удалось скопировать текст.");

    }

});



// =====================================================
// Скачать txt
// =====================================================

downloadBtn.addEventListener("click", () => {

    autoGenerate();

    const blob = new Blob(

        [output.value],

        { type: "text/plain;charset=utf-8" }

    );

    const a = document.createElement("a");

    a.href = URL.createObjectURL(blob);

    a.download = `Report_${artistIdInput.value || "report"}.txt`;

    a.click();

    URL.revokeObjectURL(a.href);

});

// =====================================================
// Автосохранение
// =====================================================

const STORAGE_KEY = "cwArtReportGenerator";

function saveData() {

    const data = collectData();

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );

}

function loadData() {

    const saved =
        localStorage.getItem(STORAGE_KEY);

    if (!saved)
        return;

    const data = JSON.parse(saved);

    artistIdInput.value = data.artistId;
    factionInput.value = data.faction;
    descriptionInput.value = data.description;

    sectionsContainer.innerHTML = "";

    data.sections.forEach(section => {

        createSection(section);

    });

    autoGenerate();

}



// =====================================================
// Очистить всё
// =====================================================

clearBtn.addEventListener("click", () => {

    if (
        !confirm(
            "Удалить весь отчет?"
        )
    ) {
        return;
    }

    artistIdInput.value = "";
    factionInput.value = "";
    descriptionInput.value = "";

    sectionsContainer.innerHTML = "";

    output.value = "";

    localStorage.removeItem(STORAGE_KEY);

});



// =====================================================
// Автогенерация при изменении верхних полей
// =====================================================

[
    artistIdInput,
    factionInput,
    descriptionInput

].forEach(input => {

    input.addEventListener("input", () => {

        autoGenerate();

        saveData();

    });

});



// =====================================================
// Добавление раздела
// =====================================================

addSectionBtn.addEventListener("click", () => {

    createSection({

        title: "",

        works: []

    });

    autoGenerate();

    saveData();

});



// =====================================================
// Первый раздел
// =====================================================

function createDefaultReport() {

    if (
        sectionsContainer.children.length > 0
    ) {
        return;
    }

    createSection({

        title: "",

        works: []

    });

}



// =====================================================
// Запуск приложения
// =====================================================

window.addEventListener("DOMContentLoaded", () => {

    loadData();

    createDefaultReport();

    autoGenerate();

});

// =====================================================
// Вспомогательные функции
// =====================================================

function getSections() {

    return document.querySelectorAll(".report-section");

}

function getWorks(section) {

    return section.querySelectorAll(".work-card");

}

function renumberAll() {

    getSections().forEach(section => {

        updateWorkNumbers(
            section.querySelector(".works-container")
        );

    });

}



// =====================================================
// Подсветка незаполненных изображений
// =====================================================

function validateImages() {

    document
        .querySelectorAll(".image-link")
        .forEach(input => {

            if (input.value.trim() === "") {

                input.style.borderColor = "#e74c3c";

            }

            else {

                input.style.borderColor = "";

            }

        });

}



// =====================================================
// Обновление всего приложения
// =====================================================

function refresh() {

    renumberAll();

    validateImages();

    autoGenerate();

    saveData();

}



// =====================================================
// Следим за всеми изменениями
// =====================================================

document.addEventListener("input", (event) => {

    const target = event.target;

    if (

        target.classList.contains("image-link") ||

        target.classList.contains("proof-link") ||

        target.classList.contains("section-title")

    ) {

        refresh();

    }

});



// =====================================================
// Автоматическая проверка верхних полей
// =====================================================

[
    artistIdInput,
    factionInput,
    descriptionInput

].forEach(input => {

    input.addEventListener("input", refresh);

});



// =====================================================
// Экспорт данных
// =====================================================

function exportData() {

    return JSON.stringify(

        collectData(),

        null,

        4

    );

}



// =====================================================
// Импорт данных
// =====================================================

function importData(json) {

    try {

        const data = JSON.parse(json);

        artistIdInput.value = data.artistId || "";

        factionInput.value = data.faction || "";

        descriptionInput.value = data.description || "";

        sectionsContainer.innerHTML = "";

        data.sections.forEach(section => {

            createSection(section);

        });

        refresh();

    }

    catch {

        alert("Ошибка чтения данных.");

    }

}



// =====================================================
// Горячая клавиша Ctrl + S
// =====================================================

document.addEventListener("keydown", event => {

    if (

        event.ctrlKey &&

        event.key.toLowerCase() === "s"

    ) {

        event.preventDefault();

        saveData();

    }

});



// =====================================================
// Горячая клавиша Ctrl + C
// (если курсор не в поле ввода)
// =====================================================

document.addEventListener("keydown", event => {

    if (

        event.ctrlKey &&

        event.shiftKey &&

        event.key.toLowerCase() === "c"

    ) {

        event.preventDefault();

        copyBtn.click();

    }

});



// =====================================================
// После загрузки страницы
// =====================================================

window.addEventListener("load", () => {

    refresh();

});

// =====================================================
// Предпросмотр изображений
// =====================================================

function createImagePreview(input) {

    let preview = input.parentElement.querySelector(".image-preview");

    if (!preview) {

        preview = document.createElement("img");

        preview.className = "image-preview";

        preview.style.maxWidth = "180px";
        preview.style.marginTop = "10px";
        preview.style.borderRadius = "8px";
        preview.style.display = "none";

        input.parentElement.appendChild(preview);

    }

    if (input.value.trim() === "") {

        preview.style.display = "none";

        preview.removeAttribute("src");

        return;

    }

    preview.src = input.value;

    preview.style.display = "block";

    preview.onerror = function () {

        preview.style.display = "none";

    };

}

function updateAllPreviews() {

    document
        .querySelectorAll(".image-link")
        .forEach(input => {

            createImagePreview(input);

        });

}



// =====================================================
// Предпросмотр доказательств
// =====================================================

function createProofPreview(input) {

    let preview = input.parentElement.querySelector(".proof-preview");

    if (!preview) {

        preview = document.createElement("img");

        preview.className = "proof-preview";

        preview.style.maxWidth = "180px";
        preview.style.marginTop = "10px";
        preview.style.borderRadius = "8px";
        preview.style.display = "none";

        input.parentElement.appendChild(preview);

    }

    if (input.value.trim() === "") {

        preview.style.display = "none";

        preview.removeAttribute("src");

        return;

    }

    preview.src = input.value;

    preview.style.display = "block";

    preview.onerror = function () {

        preview.style.display = "none";

    };

}



// =====================================================
// Обновить все доказательства
// =====================================================

function updateAllProofs() {

    document
        .querySelectorAll(".proof-link")
        .forEach(input => {

            createProofPreview(input);

        });

}



// =====================================================
// Полное обновление интерфейса
// =====================================================

function fullRefresh() {

    refresh();

    updateAllPreviews();

    updateAllProofs();

}



// =====================================================
// Следим за всеми ссылками
// =====================================================

document.addEventListener("input", event => {

    const target = event.target;

    if (target.classList.contains("image-link")) {

        createImagePreview(target);

    }

    if (target.classList.contains("proof-link")) {

        createProofPreview(target);

    }

});



// =====================================================
// Клик по картинке
// =====================================================

document.addEventListener("click", event => {

    if (

        event.target.classList.contains("image-preview") ||

        event.target.classList.contains("proof-preview")

    ) {

        window.open(event.target.src, "_blank");

    }

});



// =====================================================
// Финальная инициализация
// =====================================================

window.addEventListener("load", () => {

    updateAllPreviews();

    updateAllProofs();

    refresh();

});

// =====================================================
// Быстрый переход к BBCode
// =====================================================

function scrollToOutput() {

    output.scrollIntoView({

        behavior: "smooth",

        block: "start"

    });

}



// =====================================================
// После генерации можно сразу прокрутить
// =====================================================

generateBtn.addEventListener("click", () => {

    setTimeout(() => {

        scrollToOutput();

    }, 150);

});



// =====================================================
// Количество работ в разделе
// =====================================================

function countWorks(section) {

    let count = 0;

    section
        .querySelectorAll(".image-link")
        .forEach(input => {

            if (input.value.trim() !== "")
                count++;

        });

    return count;

}



// =====================================================
// Статистика
// =====================================================

function getStatistics() {

    const sections =
        document.querySelectorAll(".report-section");

    let works = 0;

    sections.forEach(section => {

        works += countWorks(section);

    });

    return {

        sections: sections.length,

        works: works

    };

}



// =====================================================
// Консольная информация
// =====================================================

function logStatistics() {

    const stats = getStatistics();

    console.log(

        "Разделов:",

        stats.sections,

        "Работ:",

        stats.works

    );

}



// =====================================================
// Перед сохранением
// =====================================================

window.addEventListener("beforeunload", () => {

    saveData();

});



// =====================================================
// Автообновление статистики
// =====================================================

document.addEventListener("input", () => {

    logStatistics();

});



// =====================================================
// Полная генерация
// =====================================================

function generateEverything() {

    refresh();

    autoGenerate();

    updateAllPreviews();

    updateAllProofs();

}



// =====================================================
// Первый запуск
// =====================================================

window.addEventListener("DOMContentLoaded", () => {

    if (

        sectionsContainer.children.length === 0

    ) {

        createSection({

            title: "",

            works: []

        });

    }

    generateEverything();

});



// =====================================================
// Конец файла
// =====================================================

console.log(

    "CW Art Report Generator успешно загружен."

);
