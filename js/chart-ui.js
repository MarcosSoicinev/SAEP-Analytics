function destroyChartIfExists(chartInstance) {
    if (chartInstance) {
        chartInstance.destroy();
    }
}

function renderHorizontalBarChart(canvasId, labels, values, datasetLabel) {
    const canvasElement = getElementByIdOrNull(canvasId);

    if (!canvasElement) {
        return null;
    }

    const barColors = values.map((value) => getLevelColor(getStudentSaepLevel(value)));

    return new Chart(canvasElement, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: datasetLabel,
                    data: values,
                    backgroundColor: barColors,
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    min: 0,
                    max: 100,
                    ticks: {
                        callback: (value) => `${value}%`
                    }
                }
            }
        }
    });
}