const STORAGE_KEYS = {
    students: 'saep_alunos',
    records: 'saep_registros',
    course: 'saep_curso',
    courseConfig: 'saep_course_config'  // config importada via Excel sobrescreve config.js
};

const DEFAULT_COLORS = {
    verde: '#22c55e',
    azul: '#3b82f6',
    amarelo: '#eab308',
    vermelho: '#ef4444'
};

const COLOR_CONFIG =
    typeof SAEP_CONFIG !== 'undefined' && SAEP_CONFIG.cores
        ? SAEP_CONFIG.cores
        : DEFAULT_COLORS;

// Prioridade: 1) config importada via Excel (localStorage), 2) config.js
function loadCourseConfig() {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.courseConfig);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (_) { /* fallback */ }

    return (typeof SAEP_CONFIG !== 'undefined' && SAEP_CONFIG.cursos)
        ? SAEP_CONFIG.cursos
        : {};
}

const COURSE_CONFIG = loadCourseConfig();

const WorkbookSheetAliases = {
    summary: [
        'Desempenho Individual - Resumo',
        'Desemp. Individual - Resumo',
        'Desempenho individual - resumo'
    ],
    records: [
        'Desemp. Ind. por Registro',
        'Desempenho Individual por Registro',
        'Desempenho Ind. por Registro',
        'Desemp Individual por Registro'
    ]
};

const SummaryColumnAliases = {
    studentName: ['Aluno'],
    registration: ['Matrícula', 'Matricula'],
    performance: ['Desempenho'],
    correctAnswers: ['Acertos'],
    wrongAnswers: ['Erros'],
    executionTime: ['Tempo de realização', 'Tempo de Realizacao', 'Tempo'],
    proficiency: [
        'Proficiência',
        'Proficiencia',
        'Proficiência média',
        'Proficiencia media',
        'Escala de proficiência',
        'Escala de proficiencia'
    ]
};

const RecordColumnAliases = {
    studentName: ['Aluno'],
    registration: ['Matrícula', 'Matricula'],
    capacity: ['Capacidade'],
    knowledge: ['Conhecimento'],
    answer: ['Marcação respondente', 'Marcacao respondente', 'Respondente'],
    answerKey: ['Gabarito']
};