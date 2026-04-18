function getSavedCourseKey() {
    return localStorage.getItem(STORAGE_KEYS.course) || '';
}

function saveSelectedCourse(courseKey) {
    localStorage.setItem(STORAGE_KEYS.course, courseKey);
}

function clearStoredSpreadsheetData() {
    localStorage.removeItem(STORAGE_KEYS.students);
    localStorage.removeItem(STORAGE_KEYS.records);
}

function saveSpreadsheetDataToStorage() {
    localStorage.setItem(STORAGE_KEYS.students, JSON.stringify(ApplicationState.studentSummaries));
    localStorage.setItem(STORAGE_KEYS.records, JSON.stringify(ApplicationState.answerRecords));
}

function loadSpreadsheetDataFromStorage() {
    ApplicationState.studentSummaries =
        JSON.parse(localStorage.getItem(STORAGE_KEYS.students)) || [];
    ApplicationState.answerRecords =
        JSON.parse(localStorage.getItem(STORAGE_KEYS.records)) || [];
}
function saveImportedCourseConfig(courseConfigObject) {
    localStorage.setItem(STORAGE_KEYS.courseConfig, JSON.stringify(courseConfigObject));
}

function clearImportedCourseConfig() {
    localStorage.removeItem(STORAGE_KEYS.courseConfig);
}
