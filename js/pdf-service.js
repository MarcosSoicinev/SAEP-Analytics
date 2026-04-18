async function captureStudentReportCanvas() {
    const printArea = getElementByIdOrNull('boletimPrintArea');

    if (!printArea) {
        throw new Error('Área do boletim não encontrada.');
    }

    return html2canvas(printArea, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
    });
}

function addCanvasToLandscapePdf(pdfDocument, canvas) {
    const imageData = canvas.toDataURL('image/png');

    const pageWidth = 297;
    const pageHeight = 210;
    const margin = 8;

    const usableWidth = pageWidth - margin * 2;
    const usableHeight = pageHeight - margin * 2;

    const widthRatio = usableWidth / canvas.width;
    const heightRatio = usableHeight / canvas.height;
    const renderRatio = Math.min(widthRatio, heightRatio);

    const renderWidth = canvas.width * renderRatio;
    const renderHeight = canvas.height * renderRatio;

    const positionX = (pageWidth - renderWidth) / 2;
    const positionY = (pageHeight - renderHeight) / 2;

    pdfDocument.addImage(imageData, 'PNG', positionX, positionY, renderWidth, renderHeight);
}

async function generateStudentVisualPdf(studentSummary) {
    if (!studentSummary) {
        alert('Selecione um aluno antes de gerar o PDF.');
        return;
    }

    const { jsPDF } = window.jspdf;
    const buttonElement = getElementByIdOrNull('btnPdfAluno');
    const originalButtonHtml = setButtonLoadingState(
        buttonElement,
        '<i class="fa-solid fa-spinner fa-spin text-red-600"></i><span>Gerando PDF...</span>'
    );

    try {
        const reportCanvas = await captureStudentReportCanvas();
        const pdfDocument = new jsPDF('landscape', 'mm', 'a4');

        addCanvasToLandscapePdf(pdfDocument, reportCanvas);
        pdfDocument.save(`boletim_${sanitizeFileName(studentSummary.nome)}.pdf`);
    } catch (error) {
        console.error(error);
        alert('Erro ao gerar o PDF do aluno.');
    } finally {
        restoreButtonState(buttonElement, originalButtonHtml);
    }
}

function drawPdfHeader(pdfDocument, title, subtitle = '') {
    pdfDocument.setFillColor(79, 70, 229);
    pdfDocument.rect(0, 0, 297, 22, 'F');

    pdfDocument.setTextColor(255, 255, 255);
    pdfDocument.setFont('helvetica', 'bold');
    pdfDocument.setFontSize(20);
    pdfDocument.text(title, 14, 12);

    if (subtitle) {
        pdfDocument.setFont('helvetica', 'normal');
        pdfDocument.setFontSize(10);
        pdfDocument.text(subtitle, 14, 18);
    }

    pdfDocument.setTextColor(15, 23, 42);
}

function drawPdfFooter(pdfDocument, footerLabel = 'SAEP Analytics') {
    const totalPages = pdfDocument.internal.getNumberOfPages();

    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
        pdfDocument.setPage(pageNumber);
        pdfDocument.setDrawColor(226, 232, 240);
        pdfDocument.line(14, 203, 283, 203);
        pdfDocument.setFont('helvetica', 'normal');
        pdfDocument.setFontSize(8);
        pdfDocument.setTextColor(100, 116, 139);
        pdfDocument.text(footerLabel, 14, 208);
        pdfDocument.text(`Página ${pageNumber} de ${totalPages}`, 260, 208);
    }

    pdfDocument.setTextColor(15, 23, 42);
}

function drawPdfInfoCard(
    pdfDocument,
    positionX,
    positionY,
    width,
    height,
    title,
    value,
    color = [79, 70, 229]
) {
    pdfDocument.setFillColor(248, 250, 252);
    pdfDocument.setDrawColor(226, 232, 240);
    pdfDocument.roundedRect(positionX, positionY, width, height, 3, 3, 'FD');

    pdfDocument.setFont('helvetica', 'bold');
    pdfDocument.setFontSize(8);
    pdfDocument.setTextColor(100, 116, 139);
    pdfDocument.text(String(title).toUpperCase(), positionX + 4, positionY + 6);

    pdfDocument.setFont('helvetica', 'bold');
    pdfDocument.setFontSize(16);
    pdfDocument.setTextColor(color[0], color[1], color[2]);
    pdfDocument.text(String(value), positionX + 4, positionY + 15);

    pdfDocument.setTextColor(15, 23, 42);
}

function drawPdfSectionTitle(pdfDocument, title, positionY) {
    pdfDocument.setFillColor(238, 242, 255);
    pdfDocument.roundedRect(14, positionY - 5, 269, 8, 2, 2, 'F');

    pdfDocument.setFont('helvetica', 'bold');
    pdfDocument.setFontSize(11);
    pdfDocument.setTextColor(55, 48, 163);
    pdfDocument.text(title, 16, positionY);

    pdfDocument.setTextColor(15, 23, 42);
}

function buildCapacityTableForPdf(studentName) {
    const capacityPerformance = calculateStudentCapacityPerformance(studentName);

    return capacityPerformance.labels.map((capacityCode, index) => [
        capacityCode,
        `${capacityPerformance.values[index]}%`,
        getStudentSaepLevel(capacityPerformance.values[index])
    ]);
}

function buildKnowledgeTableForPdf(studentName) {
    const knowledgePerformance = calculateStudentKnowledgePerformance(studentName);

    return knowledgePerformance.labels.map((knowledgeName, index) => [
        knowledgeName,
        `${knowledgePerformance.values[index]}%`,
        getStudentSaepLevel(knowledgePerformance.values[index])
    ]);
}

function getPdfLevelColor(saepLevel) {
    if (saepLevel === 'Avançado') {
        return [22, 163, 74];
    }

    if (saepLevel === 'Adequado') {
        return [37, 99, 235];
    }

    if (saepLevel === 'Básico') {
        return [234, 179, 8];
    }

    return [239, 68, 68];
}

function buildStudentDiagnosisSummaryForPdf(studentSummary) {
    const capacityPerformance = calculateStudentCapacityPerformance(studentSummary.nome);
    const knowledgePerformance = calculateStudentKnowledgePerformance(studentSummary.nome);

    const capacityExtremes = getPerformanceExtremes(
        capacityPerformance.labels,
        capacityPerformance.values
    );

    const strongestCapacity = capacityExtremes
        ? `${capacityExtremes.best.label} (${capacityExtremes.best.value}%)`
        : '--';

    const weakestCapacity = capacityExtremes
        ? `${capacityExtremes.worst.label} (${capacityExtremes.worst.value}%)`
        : '--';

    const knowledgeExtremes = getPerformanceExtremes(
        knowledgePerformance.labels,
        knowledgePerformance.values
    );

    const weakestKnowledge = knowledgeExtremes
        ? `${knowledgeExtremes.worst.label} (${knowledgeExtremes.worst.value}%)`
        : '--';

    return {
        strongestCapacity,
        weakestCapacity,
        weakestKnowledge
    };
}

async function generateClassroomVisualPdf(orderedStudents) {
    if (!orderedStudents || !orderedStudents.length) {
        alert('Nenhum aluno disponível para gerar o PDF da turma.');
        return;
    }

    const { jsPDF } = window.jspdf;
    const pdfDocument = new jsPDF('landscape', 'mm', 'a4');
    const buttonElement = getElementByIdOrNull('btnPdfTurma');
    const originalButtonHtml = setButtonLoadingState(
        buttonElement,
        '<i class="fa-solid fa-spinner fa-spin text-indigo-600"></i><span>Gerando PDF da turma...</span>'
    );

    try {
        orderedStudents.forEach((studentSummary, index) => {
            if (index > 0) {
                pdfDocument.addPage('a4', 'landscape');
            }

            const saepLevel = studentSummary.nivelSAEP || getStudentSaepLevel(studentSummary);
            const levelColor = getPdfLevelColor(saepLevel);
            const diagnosisSummary = buildStudentDiagnosisSummaryForPdf(studentSummary);

            drawPdfHeader(pdfDocument, 'Boletim da Turma', 'Relatório individual consolidado');

            pdfDocument.setFont('helvetica', 'bold');
            pdfDocument.setFontSize(16);
            pdfDocument.text(studentSummary.nome, 14, 32);

            pdfDocument.setFont('helvetica', 'normal');
            pdfDocument.setFontSize(10);
            pdfDocument.setTextColor(71, 85, 105);
            pdfDocument.text(`Matrícula: ${studentSummary.matricula || '--'}`, 14, 38);
            pdfDocument.setTextColor(15, 23, 42);

            drawPdfInfoCard(
                pdfDocument,
                14,
                44,
                40,
                18,
                'Desempenho',
                `${studentSummary.desempenho.toFixed(1)}%`,
                [79, 70, 229]
            );
            drawPdfInfoCard(pdfDocument, 58, 44, 52, 18, 'Nível SAEP', saepLevel, levelColor);
            drawPdfInfoCard(pdfDocument, 114, 44, 34, 18, 'Acertos', studentSummary.acertos, [22, 163, 74]);
            drawPdfInfoCard(pdfDocument, 152, 44, 34, 18, 'Erros', studentSummary.erros, [220, 38, 38]);
            drawPdfInfoCard(pdfDocument, 190, 44, 40, 18, 'Tempo', studentSummary.tempo || '-', [217, 119, 6]);

            drawPdfSectionTitle(pdfDocument, 'Diagnóstico pedagógico', 72);

            pdfDocument.setFont('helvetica', 'normal');
            pdfDocument.setFontSize(10);

            const diagnosisText = [
                `Interpretação: ${getLevelDescription(saepLevel)}`,
                `Ponto mais forte em capacidade: ${diagnosisSummary.strongestCapacity}`,
                `Ponto mais crítico em capacidade: ${diagnosisSummary.weakestCapacity}`,
                `Conhecimento que mais exige reforço: ${diagnosisSummary.weakestKnowledge}`
            ].join('\n\n');

            const wrappedDiagnosisText = pdfDocument.splitTextToSize(diagnosisText, 265);
            pdfDocument.text(wrappedDiagnosisText, 16, 80);

            let currentY = 80 + wrappedDiagnosisText.length * 5 + 6;

            drawPdfSectionTitle(pdfDocument, 'Desempenho por capacidade', currentY);
            currentY += 4;

            pdfDocument.autoTable({
                startY: currentY,
                head: [['Capacidade', 'Desempenho', 'Nível']],
                body: buildCapacityTableForPdf(studentSummary.nome),
                theme: 'grid',
                styles: {
                    fontSize: 9,
                    cellPadding: 3,
                    textColor: [15, 23, 42],
                    lineColor: [226, 232, 240],
                    lineWidth: 0.2
                },
                headStyles: {
                    fillColor: [79, 70, 229],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                },
                alternateRowStyles: {
                    fillColor: [248, 250, 252]
                },
                margin: { left: 14, right: 14 },
                tableWidth: 125
            });

            pdfDocument.autoTable({
                startY: currentY,
                head: [['Conhecimento', 'Desempenho', 'Nível']],
                body: buildKnowledgeTableForPdf(studentSummary.nome),
                theme: 'grid',
                styles: {
                    fontSize: 8,
                    cellPadding: 2.5,
                    textColor: [15, 23, 42],
                    lineColor: [226, 232, 240],
                    lineWidth: 0.2
                },
                headStyles: {
                    fillColor: [37, 99, 235],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                },
                alternateRowStyles: {
                    fillColor: [248, 250, 252]
                },
                margin: { left: 155, right: 14 },
                tableWidth: 128
            });
        });

        drawPdfFooter(pdfDocument, 'SAEP Analytics • Boletim da Turma');
        pdfDocument.save('boletim_turma_completa.pdf');
    } catch (error) {
        console.error(error);
        alert('Erro ao gerar o PDF da turma.');
    } finally {
        restoreButtonState(buttonElement, originalButtonHtml);
    }
}