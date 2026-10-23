// CW Art Report Generator — обновлённая версия
"use strict";

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
const visualReportContent = document.getElementById("visualReportContent");
const sectionTemplate = document.getElementById("sectionTemplate");
const workTemplate = document.getElementById("workTemplate");
const STORAGE_KEY = "cwArtReportGenerator";

const SECTION_INFO = {
    "Предмет": {
        heading: "Предмет",
        one: "предмет",
        few: "предмета",
        many: "предметов",
        lineBreakEveryTwo: false,
        original: false
    },
    "Медаль": {
        heading: "Медаль",
        one: "медаль",
        few: "медали",
        many: "медалей",
        lineBreakEveryTwo: false,
        original: false
    },
    "Костюм актера": {
        heading: "Костюм актера",
        one: "костюм актера",
        few: "костюма актера",
        many: "костюмов актеров",
        lineBreakEveryTwo: false,
        original: false
    },
    "Костюм бота": {
        heading: "Костюм бота",
        one: "костюм бота",
        few: "костюма бота",
        many: "костюмов ботов",
        lineBreakEveryTwo: false,
        original: false
    },
    "Фон": {
        heading: "Фон",
        one: "фон",
        few: "фона",
        many: "фонов",
        lineBreakEveryTwo: true,
        original: true
    },
    "Украшение фона": {
        heading: "Украшение фона",
        one: "украшение фона",
        few: "украшения фонов",
        many: "украшений фонов",
        lineBreakEveryTwo: false,
        original: true
    },
    "Шапка в блог": {
        heading: "Шапка в блог",
        one: "шапку в блог",
        few: "шапки в блоги",
        many: "шапок в блоги",
        lineBreakEveryTwo: false,
        original: false
    },
    "Иллюстрация": {
        heading: "Иллюстрация",
        one: "иллюстрацию",
        few: "иллюстрации",
        many: "иллюстраций",
        lineBreakEveryTwo: false,
        original: false
    }
};

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, ch => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[ch]));
}

// Позволяет вставлять прямую ссылку, BBCode или HTML-код с картинкой.
function extractImageUrl(value) {
    let text = String(value || "").trim();
    if (!text) return "";

    // Если вставлен HTML-код с <img src="...">
    let match = text.match(/<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/i);
    if (match) return cleanUrl(match[1]);

    // Если вставлен BBCode с изображением, в том числе внутри [url=...]
    match = text.match(/\[img(?:=[^\]]*)?\]\s*(https?:\/\/[^\s\[]+)\s*\[\/img\]/i);
    if (match) return cleanUrl(match[1]);

    // Если вставлен [url=адрес][img]адрес картинки[/img][/url]
    match = text.match(/\[url(?:=[^\]]*)?\]\s*\[img(?:=[^\]]*)?\]\s*(https?:\/\/[^\s\[]+)/i);
    if (match) return cleanUrl(match[1]);

    // Обычная ссылка — забираем первый URL из текста.
    match = text.match(/https?:\/\/[^\s"'<>[\]]+/i);
    if (match) return cleanUrl(match[0]);

    // На случай, если код BBCode был URL-кодирован браузером/полем.
    try {
        const decoded = decodeURIComponent(text);
        if (decoded !== text) return extractImageUrl(decoded);
    } catch (_) {}

    return text;
}

function cleanUrl(url) {
    return String(url || "").trim().replace(/[),.;]+$/, "");
}

function getSectionType(section) {
    return section.querySelector(".section-type").value;
}

function getSectionTitle(section) {
    const type = getSectionType(section);
    if (type === "custom") {
        return section.querySelector(".custom-title").value.trim();
    }
    return SECTION_INFO[type]?.heading || type;
}

function getSectionNounForms(section) {
    const type = getSectionType(section);
    if (type === "custom") {
        return {
            heading: section.querySelector(".custom-title").value.trim(),
            one: section.querySelector(".custom-singular").value.trim(),
            few: section.querySelector(".custom-plural").value.trim(),
            many: section.querySelector(".custom-plural").value.trim(),
            lineBreakEveryTwo: false,
            original: false
        };
    }
    return SECTION_INFO[type] || null;
}

function getCountForm(count, forms) {
    const lastTwo = count % 100;
    const last = count % 10;
    if (lastTwo >= 11 && lastTwo <= 14) return forms.many;
    if (last === 1) return forms.one;
    if (last >= 2 && last <= 4) return forms.few;
    return forms.many;
}

function createSection(data = null) {
    const section = sectionTemplate.content.firstElementChild.cloneNode(true);
    const typeSelect = section.querySelector(".section-type");
    const customFields = section.querySelector(".custom-section-fields");
    const customTitle = section.querySelector(".custom-title");
    const customSingular = section.querySelector(".custom-singular");
    const customPlural = section.querySelector(".custom-plural");
    const worksContainer = section.querySelector(".works-container");

    if (data) {
        const oldTitle = data.title || "";
        if (data.type && [...typeSelect.options].some(o => o.value === data.type)) {
            typeSelect.value = data.type;
        } else if ([...typeSelect.options].some(o => o.value === oldTitle)) {
            typeSelect.value = oldTitle;
        } else if (oldTitle) {
            typeSelect.value = "custom";
            customTitle.value = oldTitle;
            customSingular.value = data.customSingular || oldTitle.toLowerCase();
            customPlural.value = data.customPlural || oldTitle.toLowerCase();
        }
        customTitle.value = data.customTitle ?? customTitle.value;
        customSingular.value = data.customSingular ?? customSingular.value;
        customPlural.value = data.customPlural ?? customPlural.value;
    }

    function updateSectionControls() {
        const isCustom = typeSelect.value === "custom";
        customFields.hidden = !isCustom;
        section.querySelectorAll(".original-field").forEach(field => {
            field.hidden = !(SECTION_INFO[typeSelect.value]?.original);
        });
        section.querySelectorAll(".work-card").forEach(work => {
            const originalField = work.querySelector(".original-field");
            if (originalField) originalField.hidden = !SECTION_INFO[typeSelect.value]?.original;
        });
        refresh();
    }

    typeSelect.addEventListener("change", () => {
        updateSectionControls();
        saveData();
    });

    [customTitle, customSingular, customPlural].forEach(input => {
        input.addEventListener("input", refreshAndSave);
    });

    section.querySelector(".add-work").addEventListener("click", () => {
        createWork(worksContainer);
        updateWorkNumbers(worksContainer);
        refreshAndSave();
    });

    section.querySelector(".delete-section").addEventListener("click", () => {
        if (!confirm("Удалить раздел вместе со всеми работами?")) return;
        section.remove();
        refreshAndSave();
    });

    if (data?.works?.length) {
        data.works.forEach(work => createWork(worksContainer, work, typeSelect.value));
    } else {
        createWork(worksContainer, null, typeSelect.value);
    }

    sectionsContainer.appendChild(section);
    updateWorkNumbers(worksContainer);
    updateSectionControls();
    return section;
}

function createWork(container, data = null, sectionType = "") {
    const work = workTemplate.content.firstElementChild.cloneNode(true);
    const imageInput = work.querySelector(".image-link");
    const proofInput = work.querySelector(".proof-link");
    const originalInput = work.querySelector(".original-link");
    const originalField = work.querySelector(".original-field");
    const previewWrap = work.querySelector(".image-preview-wrap");

    if (data) {
        imageInput.value = data.image || "";
        proofInput.value = data.proof || "";
        originalInput.value = data.original || "";
    }
    originalField.hidden = !SECTION_INFO[sectionType]?.original;

    function updatePreview() {
        previewWrap.innerHTML = "";
        const url = extractImageUrl(imageInput.value);
        if (!url || !/^https?:\/\//i.test(url)) return;
        const img = document.createElement("img");
        img.className = "image-preview";
        img.src = url;
        img.alt = "Предпросмотр работы";
        img.style.cssText = "display:block;max-width:180px;max-height:180px;object-fit:contain;margin-top:10px;border-radius:8px;";
        img.onerror = () => { img.remove(); };
        img.addEventListener("click", () => window.open(url, "_blank", "noopener"));
        img.style.cursor = "pointer";
        previewWrap.appendChild(img);
    }

    [imageInput, proofInput, originalInput].forEach(input => input.addEventListener("input", () => {
        updatePreview();
        refreshAndSave();
    }));

    work.querySelector(".delete-work").addEventListener("click", () => {
        if (!confirm("Удалить эту работу?")) return;
        work.remove();
        updateWorkNumbers(container);
        refreshAndSave();
    });

    container.appendChild(work);
    updatePreview();
    return work;
}

function updateWorkNumbers(container) {
    container.querySelectorAll(".work-card").forEach((work, index) => {
        work.querySelector(".work-number").textContent = `Работа № ${index + 1}`;
    });
}

function collectData() {
    const sections = [...sectionsContainer.querySelectorAll(".report-section")].map(section => ({
        type: getSectionType(section),
        title: getSectionTitle(section),
        customTitle: section.querySelector(".custom-title").value.trim(),
        customSingular: section.querySelector(".custom-singular").value.trim(),
        customPlural: section.querySelector(".custom-plural").value.trim(),
        works: [...section.querySelectorAll(".work-card")].map(work => ({
            image: work.querySelector(".image-link").value.trim(),
            proof: work.querySelector(".proof-link").value.trim(),
            original: work.querySelector(".original-link").value.trim()
        }))
    }));

    return {
        artistId: artistIdInput.value.trim(),
        faction: factionInput.value.trim(),
        sections
    };
}

function getFilledWorks(section) {
    return section.works
        .map(work => ({ ...work, image: extractImageUrl(work.image) }))
        .filter(work => work.image);
}

function buildDescription(data) {
    const parts = [];
    data.sections.forEach(section => {
        const works = getFilledWorks(section);
        if (!works.length) return;
        const forms = section.type === "custom"
            ? { one: section.customSingular, few: section.customPlural, many: section.customPlural }
            : SECTION_INFO[section.type];
        if (!forms || !forms.one || !forms.few || !forms.many) return;
        parts.push(`${works.length} ${getCountForm(works.length, forms)}`);
    });
    if (parts.length <= 1) return parts.join("");
    return parts.slice(0, -1).join(", ") + " и " + parts[parts.length - 1];
}

function getReportDescription(data) {
    const description = buildDescription(data);
    descriptionInput.value = description;
    return description;
}

function generateBBCode(data) {
    const description = getReportDescription(data);
    if (!data.artistId && !data.faction && !description) return "";

    let bb = `[link${data.artistId}] (${data.artistId}) нарисовал в ${data.faction}`;
    if (description) bb += ` ${description}`;
    bb += `. Прошу выдать баллы за работу:\n\n`;

    data.sections.forEach(section => {
        const works = getFilledWorks(section);
        if (!works.length) return;
        const title = section.type === "custom" ? section.customTitle : (SECTION_INFO[section.type]?.heading || section.title);
        if (!title) return;

        bb += `[center][b]${title}:[/b][/center]\n\n`;
        const forms = section.type === "custom" ? null : SECTION_INFO[section.type];
        const twoPerRow = !!forms?.lineBreakEveryTwo;

        if (twoPerRow) {
            bb += "[center][table]";
            for (let i = 0; i < works.length; i += 2) {
                bb += "[tr]";
                works.slice(i, i + 2).forEach((work, offset) => {
                    bb += makeWorkCell(work, i + offset + 1);
                });
                bb += "[/tr]";
            }
            bb += "[/table][/center]\n\n";
        } else {
            bb += "[center][table][tr]";
            works.forEach((work, index) => { bb += makeWorkCell(work, index + 1); });
            bb += "[/tr][/table][/center]\n\n";
        }
    });
    return bb.trim();
}

function makeWorkCell(work, number) {
    let cell = `[td]${number}. [img]${work.image}[/img]\n\n[url]${work.image}[/url]`;
    if (work.original) cell += `\n\nОригинал: [url]${work.original}[/url]`;
    if (work.proof) cell += `\n\nДоказательство: [url]${work.proof}[/url]`;
    return cell + "[/td]";
}

function generateVisualReport(data) {
    const description = getReportDescription(data);
    let html = `<div class="visual-report-intro"><b>[link${escapeHTML(data.artistId)}]</b> (${escapeHTML(data.artistId)}) нарисовал в <b>${escapeHTML(data.faction)}</b>${description ? " " + escapeHTML(description) : ""}. Прошу выдать баллы за работу:</div>`;

    data.sections.forEach(section => {
        const works = getFilledWorks(section);
        if (!works.length) return;
        const title = section.type === "custom" ? section.customTitle : (SECTION_INFO[section.type]?.heading || section.title);
        if (!title) return;
        html += `<h3 class="visual-section-title">${escapeHTML(title)}</h3><div class="visual-works-grid ${section.type === "Фон" ? "background-works-grid" : ""}">`;
        works.forEach((work, index) => {
            const imageUrl = work.image;
            html += `<article class="visual-work-card">
                <b>${index + 1}.</b>
                <a href="${escapeHTML(imageUrl)}" target="_blank" rel="noopener noreferrer">
                    <img src="${escapeHTML(imageUrl)}" alt="Работа ${index + 1}" onerror="this.style.display='none';this.nextElementSibling.hidden=false">
                </a>
                <p class="preview-image-error" hidden>Изображение не удалось загрузить. Проверь ссылку.</p>`;
            if (work.original) html += `<p><b>Оригинал:</b> <a href="${escapeHTML(work.original)}" target="_blank" rel="noopener noreferrer">Открыть</a></p>`;
            if (work.proof) html += `<p><b>Доказательство:</b> <a href="${escapeHTML(work.proof)}" target="_blank" rel="noopener noreferrer">Открыть</a></p>`;
            html += `</article>`;
        });
        html += `</div>`;
    });
    visualReportContent.innerHTML = html;
}

function refresh() {
    const data = collectData();
    output.value = generateBBCode(data);
    generateVisualReport(data);
}

function refreshAndSave() {
    refresh();
    saveData();
}

function saveData() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(collectData()));
    } catch (error) {
        console.warn("Не удалось сохранить отчёт:", error);
    }
}

function loadData() {
    let saved;
    try {
        saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return false;
        const data = JSON.parse(saved);
        artistIdInput.value = data.artistId || "";
        factionInput.value = data.faction || "Клан Падающей Воды";
        sectionsContainer.innerHTML = "";
        (data.sections || []).forEach(section => createSection(section));
        return true;
    } catch (error) {
        console.warn("Не удалось загрузить сохранённый отчёт:", error);
        return false;
    }
}

function clearAll() {
    if (!confirm("Удалить весь отчёт и сохранённые данные?")) return;
    artistIdInput.value = "";
    factionInput.value = "Клан Падающей Воды";
    descriptionInput.value = "";
    sectionsContainer.innerHTML = "";
    localStorage.removeItem(STORAGE_KEY);
    createSection();
    refreshAndSave();
}

function validateInputs() {
    let valid = true;
    [artistIdInput, factionInput].forEach(input => {
        input.style.borderColor = input.value.trim() ? "" : "#e74c3c";
        if (!input.value.trim()) valid = false;
    });
    sectionsContainer.querySelectorAll(".image-link").forEach(input => {
        const isRequired = !!input.value.trim();
        input.style.borderColor = isRequired ? "" : "";
    });
    return valid;
}

addSectionBtn.addEventListener("click", () => {
    createSection();
    refreshAndSave();
});

generateBtn.addEventListener("click", () => {
    refresh();
    output.scrollIntoView({ behavior: "smooth", block: "start" });
});

copyBtn.addEventListener("click", async () => {
    refresh();
    try {
        await navigator.clipboard.writeText(output.value);
        const old = copyBtn.textContent;
        copyBtn.textContent = "✔ Скопировано";
        setTimeout(() => { copyBtn.textContent = old; }, 1500);
    } catch (_) {
        output.focus();
        output.select();
        alert("Автоматическое копирование недоступно. BBCode выделен — скопируй его вручную.");
    }
});

downloadBtn.addEventListener("click", () => {
    refresh();
    const blob = new Blob([output.value], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Report_${artistIdInput.value || "report"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
});

clearBtn.addEventListener("click", clearAll);

[artistIdInput, factionInput].forEach(input => input.addEventListener("input", refreshAndSave));
window.addEventListener("beforeunload", saveData);

window.addEventListener("DOMContentLoaded", () => {
    const hadSavedData = loadData();
    if (!hadSavedData && !sectionsContainer.children.length) createSection();
    if (!factionInput.value.trim()) factionInput.value = "Клан Падающей Воды";
    refresh();
});

console.log("CW Art Report Generator успешно загружен.");
