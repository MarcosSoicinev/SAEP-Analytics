function renderGeneralKpis() {
    if (!ApplicationState.studentSummaries.length) {
        return;
    }

    const totalStudents = ApplicationState.studentSummaries.length;
    const averagePerformance =
        ApplicationState.studentSummaries.reduce(
            (accumulator, studentSummary) => accumulator + studentSummary.desempenho,
            0
        ) / totalStudents;

    const approvedStudentsCount = ApplicationState.studentSummaries.filter((studentSummary) => {
        const saepLevel = studentSummary.nivelSAEP || getStudentSaepLevel(studentSummary);
        return saepLevel === 'Adequado' || saepLevel === 'Avançado';
    }).length;

    const performances = ApplicationState.studentSummaries.map(
        (studentSummary) => Number(studentSummary.desempenho) || 0
    );

    const bestPerformance = Math.max(...performances);
    const worstPerformance = Math.min(...performances);
    const averageTime = calculateAverageTime(
        ApplicationState.studentSummaries.map((studentSummary) => studentSummary.tempo)
    );

    setTextContentIfElementExists('kpi-media', `${averagePerformance.toFixed(1)}%`);
    setTextContentIfElementExists('kpi-alunos', totalStudents);
    setTextContentIfElementExists(
        'kpi-aprovacao',
        `${((approvedStudentsCount / totalStudents) * 100).toFixed(0)}%`
    );
    setTextContentIfElementExists('kpi-tempo', averageTime);
    setTextContentIfElementExists('kpi-melhor', `${bestPerformance.toFixed(1)}%`);
    setTextContentIfElementExists('kpi-pior', `${worstPerformance.toFixed(1)}%`);
}

function buildKnowledgeHighlightsHtml(knowledgeEntries) {
    return knowledgeEntries
        .map(({ name, performance }) => {
            const knowledgeColor = getLevelColor(getStudentSaepLevel(performance));

            return `
                <div style="display:flex; justify-content:space-between; gap:12px; font-size:12px; margin-top:6px;">
                    <span style="color:#334155; line-height:1.35;">${name}</span>
                    <span style="color:${knowledgeColor}; font-weight:700; white-space:nowrap;">${performance}%</span>
                </div>
            `;
        })
        .join('');
}

function renderCapacityCards(classroomAnalysis) {
    const container = getElementByIdOrNull('containerCapacidades');

    if (!container) {
        return;
    }

    const { sortedCapacityCodes, performanceByCapacity } = classroomAnalysis;

    if (!sortedCapacityCodes.length) {
        container.innerHTML = `
            <div class="capacity-card">
                <div class="capacity-name">Nenhuma capacidade válida encontrada na planilha.</div>
            </div>
        `;
        return;
    }

    container.innerHTML = sortedCapacityCodes
        .map((capacityCode) => {
            const capacityMetrics = performanceByCapacity[capacityCode];
            const capacityPerformance = Number(
                ((capacityMetrics.acertos / capacityMetrics.total) * 100).toFixed(1)
            );
            const saepLevel = getStudentSaepLevel(capacityPerformance);
            const levelColor = getLevelColor(saepLevel);

            const topKnowledgeEntries = Object.entries(capacityMetrics.conhecimentos)
                .map(([knowledgeName, knowledgeMetrics]) => ({
                    name: knowledgeName,
                    performance: Number(
                        ((knowledgeMetrics.acertos / knowledgeMetrics.total) * 100).toFixed(1)
                    )
                }))
                .sort((firstKnowledge, secondKnowledge) => secondKnowledge.performance - firstKnowledge.performance)
                .slice(0, 6);

            return `
                <div class="capacity-card">
                    <div class="capacity-top">
                        <div class="capacity-left">
                            <div class="capacity-badge" style="color:${levelColor}">
                                ${capacityCode}
                            </div>
                            <div class="capacity-name">${getCapacityDisplayName(capacityCode)}</div>
                        </div>
                        <span class="capacity-percent" style="color:${levelColor}">
                            ${capacityPerformance}%
                        </span>
                    </div>

                    <div class="progress-track">
                        <div class="progress-fill" style="width:${capacityPerformance}%; background-color:${levelColor}"></div>
                    </div>

                    <div style="margin-top:10px; border-top:1px solid #e2e8f0; padding-top:8px;">
                        ${buildKnowledgeHighlightsHtml(topKnowledgeEntries)}
                    </div>
                </div>
            `;
        })
        .join('');
}

function buildRankingTableHeader(sortedCapacityCodes) {
    const capacityHeaders = sortedCapacityCodes
        .map((capacityCode) => `<th class="p-3 border-b text-center">${capacityCode}</th>`)
        .join('');

    return `
        <tr class="table-header">
            <th class="p-3 border-b text-left">Aluno</th>
            ${capacityHeaders}
            <th class="p-3 border-b text-center bg-indigo-50">Nível</th>
        </tr>
    `;
}

function buildRankingTableRows(classroomAnalysis) {
    const { sortedCapacityCodes, studentCapacityPerformance } = classroomAnalysis;

    return [...ApplicationState.studentSummaries]
        .sort((firstStudent, secondStudent) => secondStudent.desempenho - firstStudent.desempenho)
        .map((studentSummary) => {
            const saepLevel = studentSummary.nivelSAEP || getStudentSaepLevel(studentSummary);
            const levelColor = getLevelColor(saepLevel);

            const capacityColumnsHtml = sortedCapacityCodes
                .map((capacityCode) => {
                    const capacityMetrics =
                        studentCapacityPerformance[studentSummary.nome]?.[capacityCode];

                    const capacityPerformance = capacityMetrics
                        ? Number(((capacityMetrics.acertos / capacityMetrics.total) * 100).toFixed(0))
                        : 0;

                    const capacityColor = getLevelColor(getStudentSaepLevel(capacityPerformance));

                    return `
                        <td class="p-3 text-center font-bold text-xs" style="color:${capacityColor}">
                            ${capacityPerformance}%
                        </td>
                    `;
                })
                .join('');

            return `
                <tr class="border-b hover:bg-gray-50">
                    <td class="p-3 font-semibold text-gray-700 text-xs">${studentSummary.nome}</td>
                    ${capacityColumnsHtml}
                    <td class="p-3 text-center font-black text-white text-xs" style="background-color:${levelColor}">
                        ${saepLevel}
                    </td>
                </tr>
            `;
        })
        .join('');
}

function renderRankingMatrix(classroomAnalysis) {
    const tableHead = getElementByIdOrNull('tabelaCabecalho');
    const tableBody = getElementByIdOrNull('tabelaRanking');

    if (!tableHead || !tableBody) {
        return;
    }

    tableHead.innerHTML = buildRankingTableHeader(classroomAnalysis.sortedCapacityCodes);
    tableBody.innerHTML = buildRankingTableRows(classroomAnalysis);
}

function initializeDashboardPage() {
    if (!ApplicationState.studentSummaries.length) {
        return;
    }

    const classroomAnalysis = buildClassroomAnalysisStructures();

    renderGeneralKpis();
    renderCapacityCards(classroomAnalysis);

    setTimeout(() => {
        renderRankingMatrix(classroomAnalysis);
    }, 50);
}