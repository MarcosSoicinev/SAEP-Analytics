function findWorksheetByPossibleNames(workbook, possibleNames) {
    const worksheetNames = workbook.SheetNames || [];
    const normalizedNameMap = new Map(
        worksheetNames.map((worksheetName) => [
            normalizeHeaderName(worksheetName),
            worksheetName
        ])
    );

    for (const possibleName of possibleNames) {
        const foundWorksheetName = normalizedNameMap.get(normalizeHeaderName(possibleName));

        if (foundWorksheetName) {
            return workbook.Sheets[foundWorksheetName];
        }
    }

    return null;
}

function getColumnValue(rowData, possibleColumnNames) {
    const normalizedColumnMap = new Map(
        Object.entries(rowData).map(([columnName, columnValue]) => [
            normalizeHeaderName(columnName),
            columnValue
        ])
    );

    for (const possibleColumnName of possibleColumnNames) {
        const foundValue = normalizedColumnMap.get(normalizeHeaderName(possibleColumnName));

        if (foundValue !== undefined) {
            return foundValue;
        }
    }

    return undefined;
}

function buildStudentSummary(summaryRow) {
    const studentSummary = {
        nome: normalizeText(getColumnValue(summaryRow, SummaryColumnAliases.studentName)),
        matricula: normalizeText(getColumnValue(summaryRow, SummaryColumnAliases.registration)),
        desempenho: parseNumber(getColumnValue(summaryRow, SummaryColumnAliases.performance)),
        acertos: Number(getColumnValue(summaryRow, SummaryColumnAliases.correctAnswers)) || 0,
        erros: Number(getColumnValue(summaryRow, SummaryColumnAliases.wrongAnswers)) || 0,
        tempo: normalizeText(getColumnValue(summaryRow, SummaryColumnAliases.executionTime)),
        proficiencia: parseNumber(getColumnValue(summaryRow, SummaryColumnAliases.proficiency))
    };

    return {
        ...studentSummary,
        nivelSAEP: getStudentSaepLevel(studentSummary)
    };
}

function buildAnswerRecord(recordRow) {
    const givenAnswer = normalizeText(getColumnValue(recordRow, RecordColumnAliases.answer));
    const correctAnswer = normalizeText(getColumnValue(recordRow, RecordColumnAliases.answerKey));

    return {
        aluno: normalizeText(getColumnValue(recordRow, RecordColumnAliases.studentName)),
        matricula: normalizeText(getColumnValue(recordRow, RecordColumnAliases.registration)),
        cap: parseCapacityCode(getColumnValue(recordRow, RecordColumnAliases.capacity)),
        conhecimento: normalizeText(getColumnValue(recordRow, RecordColumnAliases.knowledge)),
        acertou: givenAnswer === correctAnswer
    };
}

function validateImportedSpreadsheetData(studentSummaries, answerRecords) {
    if (!Array.isArray(studentSummaries) || !studentSummaries.length) {
        throw new Error('Nenhum aluno válido foi encontrado na aba de resumo.');
    }

    if (!Array.isArray(answerRecords) || !answerRecords.length) {
        throw new Error('Nenhum registro válido foi encontrado na aba por registro.');
    }
}

function readSpreadsheetData(fileBuffer) {
    const workbook = XLSX.read(fileBuffer, { type: 'array' });

    const summaryWorksheet = findWorksheetByPossibleNames(workbook, WorkbookSheetAliases.summary);
    const recordsWorksheet = findWorksheetByPossibleNames(workbook, WorkbookSheetAliases.records);

    if (!summaryWorksheet || !recordsWorksheet) {
        throw new Error('As abas esperadas não foram encontradas.');
    }

    const rawSummaryRows = XLSX.utils.sheet_to_json(summaryWorksheet, {
        range: 8,
        defval: ''
    });

    const rawRecordRows = XLSX.utils.sheet_to_json(recordsWorksheet, {
        range: 4,
        defval: ''
    });

    const studentSummaries = rawSummaryRows
        .map(buildStudentSummary)
        .filter((studentSummary) => studentSummary.nome);

    const answerRecords = rawRecordRows
        .map(buildAnswerRecord)
        .filter(
            (answerRecord) =>
                answerRecord.aluno &&
                answerRecord.cap &&
                answerRecord.cap !== 'Cundefined' &&
                answerRecord.cap !== 'Cnull'
        );

    validateImportedSpreadsheetData(studentSummaries, answerRecords);

    return {
        studentSummaries,
        answerRecords
    };
}