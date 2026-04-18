function isDashboardPage() {
    return Boolean(getElementByIdOrNull('kpi-media'));
}

function isStudentPage() {
    return Boolean(getElementByIdOrNull('studentSelector'));
}

function initializeApplication() {
    loadSpreadsheetDataFromStorage();
    populateCourseSelector();
    configureSpreadsheetUpload();
    configureCourseConfigUpload();

    if (isDashboardPage()) {
        initializeDashboardPage();
    }

    if (isStudentPage()) {
        initializeStudentPage();
    }
}

window.onload = initializeApplication;