function updateApplicationData(studentSummaries, answerRecords) {
    clearStoredSpreadsheetData();

    ApplicationState.studentSummaries = studentSummaries;
    ApplicationState.answerRecords = answerRecords;

    saveSpreadsheetDataToStorage();
}

function handleSpreadsheetUpload(file) {
    if (!file) {
        return;
    }

    const fileReader = new FileReader();

    fileReader.onload = function handleFileLoad(event) {
        try {
            const fileBuffer = new Uint8Array(event.target.result);
            const { studentSummaries, answerRecords } = readSpreadsheetData(fileBuffer);

            updateApplicationData(studentSummaries, answerRecords);
            location.reload();
        } catch (error) {
            console.error(error);
            alert(`Erro ao ler a planilha: ${error.message}`);
        }
    };

    fileReader.readAsArrayBuffer(file);
}

function configureSpreadsheetUpload() {
    const uploadInput = getElementByIdOrNull('uploadPlanilha');

    if (!uploadInput) {
        return;
    }

    uploadInput.addEventListener('change', function handleUploadChange(event) {
        const selectedFile = event.target.files[0];
        handleSpreadsheetUpload(selectedFile);
    });
}

function configurePdfButtons(orderedStudents) {
    const studentPdfButton = getElementByIdOrNull('btnPdfAluno');
    const classroomPdfButton = getElementByIdOrNull('btnPdfTurma');

    if (studentPdfButton) {
        studentPdfButton.addEventListener('click', async () => {
            if (!ApplicationState.selectedStudent) {
                alert('Selecione um aluno antes de gerar o PDF.');
                return;
            }

            await generateStudentVisualPdf(ApplicationState.selectedStudent);
        });
    }

    if (classroomPdfButton) {
        classroomPdfButton.addEventListener('click', async () => {
            await generateClassroomVisualPdf(orderedStudents);
        });
    }
}

function configurePrintButton() {
    const printButton = getElementByIdOrNull('btnPrintBoletim');

    if (!printButton) {
        return;
    }

    printButton.addEventListener('click', () => {
        if (!ApplicationState.selectedStudent) {
            alert('Selecione um aluno antes de imprimir o boletim.');
            return;
        }

        window.print();
    });
}
/* =========================
   IMPORTAÇÃO DE CONFIGURAÇÃO
========================= */

function readCourseConfigFromExcel(fileBuffer) {
    const workbook = XLSX.read(fileBuffer, { type: 'array' });
    const importedConfig = {};

    workbook.SheetNames.forEach((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

        if (rows.length < 2) return;

        // Linha 0: cabeçalho — ignorado
        // Cada linha: [chave_curso, nome_curso, abaixo, basico, adequado, codigo_cap, nome_cap, diagnostico]
        // Formato definido no template
        const courseKey = normalizeHeaderName(sheetName).replace(/\s+/g, '_');

        let nomeCurso = '';
        const escala = {};
        const capacidades = {};
        const diagnosticos = {};

        rows.forEach((row, index) => {
            if (index === 0) return; // cabeçalho

            const tipo = normalizeText(row[0]);
            const valor1 = normalizeText(row[1]);
            const valor2 = normalizeText(row[2]);

            if (tipo === 'nome') {
                nomeCurso = valor1;
            } else if (tipo === 'abaixo') {
                escala.abaixo = Number(valor1) || 400;
            } else if (tipo === 'basico') {
                escala.basico = Number(valor1) || 500;
            } else if (tipo === 'adequado') {
                escala.adequado = Number(valor1) || 650;
            } else if (tipo.startsWith('c') && tipo.length <= 3) {
                const capCode = tipo.toUpperCase();
                if (valor1) capacidades[capCode] = valor1;
                if (valor2) diagnosticos[capCode] = valor2;
            }
        });

        if (nomeCurso) {
            importedConfig[courseKey] = {
                nome: nomeCurso,
                escala: Object.keys(escala).length ? escala : { abaixo: 400, basico: 500, adequado: 650 },
                capacidades,
                diagnosticos
            };
        }
    });

    if (!Object.keys(importedConfig).length) {
        throw new Error('Nenhum curso válido encontrado no arquivo de configuração.');
    }

    return importedConfig;
}

function handleCourseConfigUpload(file) {
    if (!file) return;

    const fileReader = new FileReader();

    fileReader.onload = function handleConfigLoad(event) {
        try {
            const fileBuffer = new Uint8Array(event.target.result);
            const importedConfig = readCourseConfigFromExcel(fileBuffer);

            saveImportedCourseConfig(importedConfig);
            alert(`Configuração importada com sucesso! ${Object.keys(importedConfig).length} curso(s) carregado(s). A página será recarregada.`);
            location.reload();
        } catch (error) {
            console.error(error);
            alert(`Erro ao importar configuração: ${error.message}`);
        }
    };

    fileReader.readAsArrayBuffer(file);
}

function configureCourseConfigUpload() {
    const uploadInput = getElementByIdOrNull('uploadConfig');
    if (!uploadInput) return;

    uploadInput.addEventListener('change', function handleConfigChange(event) {
        handleCourseConfigUpload(event.target.files[0]);
    });
}
