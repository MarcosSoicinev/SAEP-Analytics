function getStudentInitials(studentName) {
    const nameParts = studentName.split(' ').filter(Boolean);

    if (nameParts.length >= 2) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }

    return (nameParts[0]?.slice(0, 2) || '--').toUpperCase();
}

function updateStudentHeader(studentSummary) {
    const saepLevel = studentSummary.nivelSAEP || getStudentSaepLevel(studentSummary);
    const levelColor = getLevelColor(saepLevel);

    setTextContentIfElementExists('initials', getStudentInitials(studentSummary.nome));
    setTextContentIfElementExists('studentName', studentSummary.nome);
    setTextContentIfElementExists('regNumber', studentSummary.matricula || '--');
    setTextContentIfElementExists('hits', studentSummary.acertos);
    setTextContentIfElementExists('misses', studentSummary.erros);
    setTextContentIfElementExists('time', studentSummary.tempo || '-');
    setTextContentIfElementExists('statusLabel', saepLevel);

    const scoreElement = getElementByIdOrNull('totalScore');
    const statusElement = getElementByIdOrNull('statusLabel');
    const headerElement = getElementByIdOrNull('studentHeader');

    if (scoreElement) {
        scoreElement.innerText = `${studentSummary.desempenho.toFixed(1)}%`;
        scoreElement.style.color = levelColor;
    }

    if (statusElement) {
        statusElement.style.color = levelColor;
    }

    if (headerElement) {
        headerElement.style.borderLeftColor = levelColor;
    }
}

function renderStudentPedagogicalDiagnosis(
    studentSummary,
    capacityPerformance,
    knowledgePerformance
) {
    const diagnosisTextElement = getElementByIdOrNull('diagnosticText');
    const diagnosisBoxElement = getElementByIdOrNull('diagnosticBox');

    if (!diagnosisTextElement || !diagnosisBoxElement) {
        return;
    }

    const saepLevel = studentSummary.nivelSAEP || getStudentSaepLevel(studentSummary);
    const levelColor = getLevelColor(saepLevel);

    diagnosisBoxElement.style.borderLeftColor = levelColor;

    if (!capacityPerformance.labels.length) {
        diagnosisTextElement.innerHTML =
            'Não foi possível gerar diagnóstico pedagógico para este aluno.';
        return;
    }

    const capacityExtremes = getPerformanceExtremes(
        capacityPerformance.labels,
        capacityPerformance.values
    );

    const weakestKnowledgeIndex = knowledgePerformance.labels.length
        ? knowledgePerformance.labels.length - 1
        : -1;

    const weakestKnowledgeText =
        weakestKnowledgeIndex >= 0
            ? `${knowledgePerformance.labels[weakestKnowledgeIndex]} (${knowledgePerformance.values[weakestKnowledgeIndex]}%)`
            : 'Não identificado';

    const selectedCourseName = getSelectedCourseConfig()?.nome || '';
    const pedagogicalGuidance = getCapacityPedagogicalGuidance(capacityExtremes.worst.label);

    diagnosisTextElement.innerHTML = `
        ${selectedCourseName ? `<strong>Curso:</strong> ${selectedCourseName}.<br><br>` : ''}
        <strong>Nível SAEP:</strong> ${saepLevel}.<br><br>
        <strong>Interpretação:</strong> ${getLevelDescription(saepLevel)}<br><br>
        <strong>Ponto mais forte em capacidade:</strong> ${capacityExtremes.best.label} — ${getCapacityDisplayName(capacityExtremes.best.label)} (${capacityExtremes.best.value}%).<br>
        <strong>Ponto mais crítico em capacidade:</strong> ${capacityExtremes.worst.label} — ${getCapacityDisplayName(capacityExtremes.worst.label)} (${capacityExtremes.worst.value}%).<br><br>
        <strong>Orientação pedagógica prioritária:</strong> ${pedagogicalGuidance}<br><br>
        <strong>Conhecimento que mais exige reforço:</strong> ${weakestKnowledgeText}.
    `;
}

function renderStudentCharts(studentSummary) {
    const capacityPerformance = calculateStudentCapacityPerformance(studentSummary.nome);
    const knowledgePerformance = calculateStudentKnowledgePerformance(studentSummary.nome);

    destroyChartIfExists(ApplicationState.charts.capacityChart);
    destroyChartIfExists(ApplicationState.charts.knowledgeChart);

    ApplicationState.charts.capacityChart = renderHorizontalBarChart(
        'studentCapChart',
        capacityPerformance.labels,
        capacityPerformance.values,
        'Desempenho por Capacidade'
    );

    ApplicationState.charts.knowledgeChart = renderHorizontalBarChart(
        'studentKnowledgeChart',
        knowledgePerformance.labels,
        knowledgePerformance.values,
        'Desempenho por Conhecimento'
    );

    renderStudentPedagogicalDiagnosis(
        studentSummary,
        capacityPerformance,
        knowledgePerformance
    );
}

function renderSelectedStudent(studentSummary) {
    const studentHeaderElement = getElementByIdOrNull('studentHeader');

    if (!studentHeaderElement) {
        return;
    }

    ApplicationState.selectedStudent = studentSummary;

    updateStudentHeader(studentSummary);
    renderStudentCharts(studentSummary);
}

function populateStudentSelector(students) {
    const studentSelector = getElementByIdOrNull('studentSelector');

    if (!studentSelector) {
        return;
    }

    if (!ApplicationState.studentSummaries.length) {
        studentSelector.innerHTML = '<option value="">Faça o upload da planilha primeiro...</option>';
        return;
    }

    studentSelector.innerHTML = '<option value="">Selecione um estudante...</option>';

    students.forEach((studentSummary, index) => {
        studentSelector.innerHTML += `<option value="${index}">${studentSummary.nome}</option>`;
    });

    // Atribuição direta evita acúmulo de listeners em chamadas repetidas
    studentSelector.onchange = function handleStudentChange() {
        if (this.value === '') {
            return;
        }

        renderSelectedStudent(students[this.value]);
    };
}

function initializeStudentPage() {
    const studentSelector = getElementByIdOrNull('studentSelector');

    if (!studentSelector) {
        return;
    }

    const orderedStudents = getOrderedStudentsByName();

    populateStudentSelector(orderedStudents);
    configurePdfButtons(orderedStudents);
    configurePrintButton();
}