function getElementByIdOrNull(elementId) {
    return document.getElementById(elementId);
}

function setTextContentIfElementExists(elementId, value) {
    const element = getElementByIdOrNull(elementId);

    if (!element) {
        return;
    }

    element.innerText = value;
}

function setHtmlContentIfElementExists(elementId, htmlContent) {
    const element = getElementByIdOrNull(elementId);

    if (!element) {
        return;
    }

    element.innerHTML = htmlContent;
}

function normalizeText(value) {
    return String(value ?? '').trim();
}

function normalizeHeaderName(headerName) {
    return String(headerName ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
}

function parseNumber(value) {
    if (value === null || value === undefined || value === '') {
        return 0;
    }

    if (typeof value === 'number') {
        // Planilha pode exportar desempenho como decimal (0.725 = 72.5%)
        if (value > 0 && value <= 1) {
            return parseFloat((value * 100).toFixed(2));
        }
        return value;
    }

    const stringValue = String(value).trim();
    const parsedNumber = parseFloat(stringValue.replace('%', '').replace(',', '.')) || 0;

    // Detecta decimal puro sem símbolo de % (ex: "0.725" → 72.5)
    if (!stringValue.includes('%') && parsedNumber > 0 && parsedNumber <= 1) {
        return parseFloat((parsedNumber * 100).toFixed(2));
    }

    return parsedNumber;
}

function parseCapacityCode(rawValue) {
    if (rawValue === null || rawValue === undefined || rawValue === '') {
        return '';
    }

    const normalizedValue = String(rawValue).trim().toLowerCase();

    if (!normalizedValue || normalizedValue.includes('undefined') || normalizedValue.includes('null')) {
        return '';
    }

    return `C${String(rawValue).trim().replace('.0', '')}`;
}

function sanitizeFileName(fileName) {
    return String(fileName || 'arquivo')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '_');
}

function convertTimeToMinutes(timeValue) {
    if (!timeValue) {
        return NaN;
    }

    const normalizedValue = String(timeValue).trim();

    if (/^\d+$/.test(normalizedValue)) {
        return Number(normalizedValue);
    }

    const timeMatch = normalizedValue.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);

    if (!timeMatch) {
        return NaN;
    }

    const hours = Number(timeMatch[1]) || 0;
    const minutes = Number(timeMatch[2]) || 0;
    const seconds = Number(timeMatch[3]) || 0;

    return hours * 60 + minutes + seconds / 60;
}

function calculateAverageTime(timeValues) {
    const validTimesInMinutes = timeValues
        .map(convertTimeToMinutes)
        .filter((minutes) => !Number.isNaN(minutes) && minutes > 0);

    if (!validTimesInMinutes.length) {
        return '0m';
    }

    const totalMinutes = validTimesInMinutes.reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0
    );

    const averageMinutes = totalMinutes / validTimesInMinutes.length;

    return `${Math.round(averageMinutes)}m`;
}

function setButtonLoadingState(buttonElement, loadingHtml) {
    if (!buttonElement) {
        return null;
    }

    const originalHtml = buttonElement.innerHTML;
    buttonElement.disabled = true;
    buttonElement.innerHTML = loadingHtml;

    return originalHtml;
}

function restoreButtonState(buttonElement, originalHtml) {
    if (!buttonElement) {
        return;
    }

    buttonElement.disabled = false;
    buttonElement.innerHTML = originalHtml;
}