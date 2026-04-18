function getSelectedCourseConfig() {
    return COURSE_CONFIG[getSavedCourseKey()] || null;
}

function populateCourseSelector() {
    const courseSelectors = document.querySelectorAll('#courseSelector');

    if (!courseSelectors.length) {
        return;
    }

    const savedCourseKey = getSavedCourseKey();

    courseSelectors.forEach((courseSelector) => {
        courseSelector.innerHTML = '<option value="">Selecione o curso...</option>';

        Object.entries(COURSE_CONFIG).forEach(([courseKey, courseConfig]) => {
            const optionElement = document.createElement('option');
            optionElement.value = courseKey;
            optionElement.textContent = courseConfig.nome;

            if (courseKey === savedCourseKey) {
                optionElement.selected = true;
            }

            courseSelector.appendChild(optionElement);
        });

        courseSelector.addEventListener('change', function handleCourseChange() {
            if (this.value) {
                saveSelectedCourse(this.value);
            }
        });
    });
}

function getCapacityDisplayName(capacityCode) {
    const selectedCourseConfig = getSelectedCourseConfig();

    if (
        selectedCourseConfig &&
        selectedCourseConfig.capacidades &&
        selectedCourseConfig.capacidades[capacityCode]
    ) {
        return selectedCourseConfig.capacidades[capacityCode];
    }

    return `Capacidade ${capacityCode.replace('C', '')}`;
}

function getCapacityPedagogicalGuidance(capacityCode) {
    const selectedCourseConfig = getSelectedCourseConfig();

    if (
        selectedCourseConfig &&
        selectedCourseConfig.diagnosticos &&
        selectedCourseConfig.diagnosticos[capacityCode]
    ) {
        return selectedCourseConfig.diagnosticos[capacityCode];
    }

    return 'Necessita reforço pedagógico direcionado nesta capacidade.';
}

function getCourseScale() {
    const courseConfig = getSelectedCourseConfig();
    if (courseConfig && courseConfig.escala) {
        return courseConfig.escala;
    }
    // Fallback para escala padrão caso nenhum curso esteja selecionado
    return { abaixo: 400, basico: 500, adequado: 650 };
}

function getLevelByProficiency(proficiency) {
    const scale = getCourseScale();

    if (proficiency < scale.abaixo) {
        return 'Abaixo do Básico';
    }

    if (proficiency < scale.basico) {
        return 'Básico';
    }

    if (proficiency < scale.adequado) {
        return 'Adequado';
    }

    return 'Avançado';
}

function getLevelByPerformance(performance) {
    if (performance < 40) {
        return 'Abaixo do Básico';
    }

    if (performance < 60) {
        return 'Básico';
    }

    if (performance < 80) {
        return 'Adequado';
    }

    return 'Avançado';
}

function getStudentSaepLevel(studentOrScore) {
    if (typeof studentOrScore === 'object' && studentOrScore !== null) {
        const proficiency = Number(studentOrScore.proficiencia);

        if (!Number.isNaN(proficiency) && proficiency > 0) {
            return getLevelByProficiency(proficiency);
        }

        const performance = Number(studentOrScore.desempenho) || 0;
        return getLevelByPerformance(performance);
    }

    return getLevelByPerformance(Number(studentOrScore) || 0);
}

function getLevelColor(level) {
    if (level === 'Avançado') {
        return COLOR_CONFIG.verde;
    }

    if (level === 'Adequado') {
        return COLOR_CONFIG.azul;
    }

    if (level === 'Básico') {
        return COLOR_CONFIG.amarelo;
    }

    return COLOR_CONFIG.vermelho;
}

function getLevelDescription(level) {
    if (level === 'Avançado') {
        return 'O estudante demonstra domínio ampliado das capacidades avaliadas.';
    }

    if (level === 'Adequado') {
        return 'O estudante demonstra domínio satisfatório das capacidades avaliadas.';
    }

    if (level === 'Básico') {
        return 'O estudante apresenta domínio parcial das capacidades avaliadas e precisa consolidar fundamentos.';
    }

    return 'O estudante apresenta domínio insuficiente das capacidades avaliadas e necessita de retomada intensiva.';
}

function buildClassroomAnalysisStructures() {
    const capacityCodeSet = new Set();
    const performanceByCapacity = {};
    const studentCapacityPerformance = {};

    ApplicationState.answerRecords.forEach((answerRecord) => {
        if (!answerRecord.cap || answerRecord.cap === 'Cundefined' || answerRecord.cap === 'Cnull') {
            return;
        }

        capacityCodeSet.add(answerRecord.cap);

        if (!performanceByCapacity[answerRecord.cap]) {
            performanceByCapacity[answerRecord.cap] = {
                total: 0,
                acertos: 0,
                conhecimentos: {}
            };
        }

        performanceByCapacity[answerRecord.cap].total += 1;

        if (answerRecord.acertou) {
            performanceByCapacity[answerRecord.cap].acertos += 1;
        }

        const knowledgeName = answerRecord.conhecimento || 'Não identificado';

        if (!performanceByCapacity[answerRecord.cap].conhecimentos[knowledgeName]) {
            performanceByCapacity[answerRecord.cap].conhecimentos[knowledgeName] = {
                total: 0,
                acertos: 0
            };
        }

        performanceByCapacity[answerRecord.cap].conhecimentos[knowledgeName].total += 1;

        if (answerRecord.acertou) {
            performanceByCapacity[answerRecord.cap].conhecimentos[knowledgeName].acertos += 1;
        }

        if (!studentCapacityPerformance[answerRecord.aluno]) {
            studentCapacityPerformance[answerRecord.aluno] = {};
        }

        if (!studentCapacityPerformance[answerRecord.aluno][answerRecord.cap]) {
            studentCapacityPerformance[answerRecord.aluno][answerRecord.cap] = {
                total: 0,
                acertos: 0
            };
        }

        studentCapacityPerformance[answerRecord.aluno][answerRecord.cap].total += 1;

        if (answerRecord.acertou) {
            studentCapacityPerformance[answerRecord.aluno][answerRecord.cap].acertos += 1;
        }
    });

    const sortedCapacityCodes = [...capacityCodeSet].sort((firstCode, secondCode) =>
        firstCode.localeCompare(secondCode, undefined, { numeric: true })
    );

    return {
        sortedCapacityCodes,
        performanceByCapacity,
        studentCapacityPerformance
    };
}

function getOrderedStudentsByName() {
    return [...ApplicationState.studentSummaries].sort((firstStudent, secondStudent) =>
        firstStudent.nome.localeCompare(secondStudent.nome, 'pt-BR')
    );
}

function calculateStudentCapacityPerformance(studentName) {
    const studentRecords = ApplicationState.answerRecords.filter(
        (answerRecord) =>
            answerRecord.aluno === studentName &&
            answerRecord.cap &&
            answerRecord.cap !== 'Cundefined' &&
            answerRecord.cap !== 'Cnull'
    );

    const capacityAccumulator = {};

    studentRecords.forEach((answerRecord) => {
        if (!capacityAccumulator[answerRecord.cap]) {
            capacityAccumulator[answerRecord.cap] = {
                acertos: 0,
                total: 0
            };
        }

        capacityAccumulator[answerRecord.cap].total += 1;

        if (answerRecord.acertou) {
            capacityAccumulator[answerRecord.cap].acertos += 1;
        }
    });

    const labels = Object.keys(capacityAccumulator).sort((firstCode, secondCode) =>
        firstCode.localeCompare(secondCode, undefined, { numeric: true })
    );

    const values = labels.map((capacityCode) =>
        Number(
            (
                (capacityAccumulator[capacityCode].acertos /
                    capacityAccumulator[capacityCode].total) *
                100
            ).toFixed(1)
        )
    );

    return {
        labels,
        values
    };
}

function calculateStudentKnowledgePerformance(studentName) {
    const studentRecords = ApplicationState.answerRecords.filter(
        (answerRecord) => answerRecord.aluno === studentName && answerRecord.conhecimento
    );

    const knowledgeAccumulator = {};

    studentRecords.forEach((answerRecord) => {
        const knowledgeName = answerRecord.conhecimento || 'Não identificado';

        if (!knowledgeAccumulator[knowledgeName]) {
            knowledgeAccumulator[knowledgeName] = {
                acertos: 0,
                total: 0
            };
        }

        knowledgeAccumulator[knowledgeName].total += 1;

        if (answerRecord.acertou) {
            knowledgeAccumulator[knowledgeName].acertos += 1;
        }
    });

    const topKnowledgeEntries = Object.entries(knowledgeAccumulator)
        .map(([knowledgeName, metrics]) => ({
            name: knowledgeName,
            performance: Number(((metrics.acertos / metrics.total) * 100).toFixed(1))
        }))
        .sort((firstKnowledge, secondKnowledge) => secondKnowledge.performance - firstKnowledge.performance)
        .slice(0, 12);

    return {
        labels: topKnowledgeEntries.map((entry) => entry.name),
        values: topKnowledgeEntries.map((entry) => entry.performance)
    };
}

function getPerformanceExtremes(labels, values) {
    if (!labels.length || !values.length) {
        return null;
    }

    let bestIndex = 0;
    let worstIndex = 0;

    values.forEach((value, index) => {
        if (value > values[bestIndex]) {
            bestIndex = index;
        }

        if (value < values[worstIndex]) {
            worstIndex = index;
        }
    });

    return {
        best: {
            label: labels[bestIndex],
            value: values[bestIndex]
        },
        worst: {
            label: labels[worstIndex],
            value: values[worstIndex]
        }
    };
}