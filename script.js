// Configuração da API
const API_BASE_URL = 'http://localhost:5000/api';

// Elementos DOM
const uploadBox = document.getElementById('uploadBox');
const fileInput = document.getElementById('fileInput');
const processingOptions = document.getElementById('processingOptions');
const processBtn = document.getElementById('processBtn');
const results = document.getElementById('results');
const validationReport = document.getElementById('validationReport');
const processedData = document.getElementById('processedData');
const downloadBtn = document.getElementById('downloadBtn');

// Variável para armazenar dados do arquivo
let currentFile = null;
let processedFileData = null;

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    addSmoothScrolling();
});

function initializeEventListeners() {
    // Upload de arquivo
    uploadBox.addEventListener('click', () => fileInput.click());
    uploadBox.addEventListener('dragover', handleDragOver);
    uploadBox.addEventListener('drop', handleDrop);
    fileInput.addEventListener('change', handleFileSelect);
    
    // Processamento
    processBtn.addEventListener('click', processFile);
    
    // Download
    downloadBtn.addEventListener('click', downloadProcessedFile);
}

// Funções de upload
function handleDragOver(e) {
    e.preventDefault();
    uploadBox.style.borderColor = '#ff6b6b';
    uploadBox.style.backgroundColor = '#f8f9fa';
}

function handleDrop(e) {
    e.preventDefault();
    uploadBox.style.borderColor = '#667eea';
    uploadBox.style.backgroundColor = 'white';
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

function handleFile(file) {
    if (!file.name.toLowerCase().endsWith('.csv')) {
        alert('Por favor, selecione um arquivo CSV válido.');
        return;
    }
    
    currentFile = file;
    uploadBox.innerHTML = `
        <i class="fas fa-file-csv"></i>
        <p><strong>${file.name}</strong></p>
        <p>Tamanho: ${formatFileSize(file.size)}</p>
    `;
    
    processingOptions.style.display = 'block';
    processingOptions.classList.add('fade-in');
    results.style.display = 'none';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Função de processamento
async function processFile() {
    if (!currentFile) {
        alert('Por favor, selecione um arquivo primeiro.');
        return;
    }
    
    const options = {
        removeDuplicates: document.getElementById('removeDuplicates').checked,
        handleNulls: document.getElementById('handleNulls').checked,
        standardizeText: document.getElementById('standardizeText').checked,
        validateFormats: document.getElementById('validateFormats').checked
    };
    
    processBtn.textContent = 'Processando...';
    processBtn.classList.add('processing');
    processBtn.disabled = true;
    
    try {
        // Simular processamento (em produção, seria uma chamada real para a API)
        await simulateProcessing(currentFile, options);
        
        results.style.display = 'block';
        results.classList.add('fade-in');
        results.scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('Erro no processamento:', error);
        alert('Erro ao processar o arquivo. Tente novamente.');
    } finally {
        processBtn.textContent = 'Processar Dados';
        processBtn.classList.remove('processing');
        processBtn.disabled = false;
    }
}

// Simulação de processamento (para demo)
async function simulateProcessing(file, options) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simular leitura do arquivo
            const reader = new FileReader();
            reader.onload = function(e) {
                const csvData = e.target.result;
                const lines = csvData.split('\n').filter(line => line.trim());
                
                // Simular análise
                const report = generateMockReport(lines, options);
                const processedCsv = generateMockProcessedData(lines, options);
                
                displayResults(report, processedCsv);
                resolve();
            };
            reader.readAsText(file);
        }, 2000); // Simular 2 segundos de processamento
    });
}

function generateMockReport(lines, options) {
    const totalRows = lines.length - 1; // Excluir cabeçalho
    const duplicatesFound = Math.floor(totalRows * 0.1); // 10% duplicatas
    const nullsFound = Math.floor(totalRows * 0.05); // 5% nulos
    const formatErrors = Math.floor(totalRows * 0.02); // 2% erros de formato
    
    return {
        totalRows: totalRows,
        duplicatesFound: options.removeDuplicates ? duplicatesFound : 0,
        nullsHandled: options.handleNulls ? nullsFound : 0,
        formatErrors: options.validateFormats ? formatErrors : 0,
        finalRows: totalRows - (options.removeDuplicates ? duplicatesFound : 0)
    };
}

function generateMockProcessedData(lines, options) {
    // Simular dados processados
    let processedLines = [...lines];
    
    if (options.removeDuplicates) {
        // Simular remoção de duplicatas
        processedLines = processedLines.slice(0, -Math.floor(lines.length * 0.1));
    }
    
    return processedLines.join('\n');
}

function displayResults(report, processedCsv) {
    // Exibir relatório
    validationReport.innerHTML = `
        <div class="report-stats">
            <div class="stat-item">
                <strong>Linhas originais:</strong> ${report.totalRows}
            </div>
            <div class="stat-item">
                <strong>Duplicatas removidas:</strong> ${report.duplicatesFound}
            </div>
            <div class="stat-item">
                <strong>Valores nulos tratados:</strong> ${report.nullsHandled}
            </div>
            <div class="stat-item">
                <strong>Erros de formato corrigidos:</strong> ${report.formatErrors}
            </div>
            <div class="stat-item">
                <strong>Linhas finais:</strong> ${report.finalRows}
            </div>
        </div>
    `;
    
    // Exibir preview dos dados
    const previewLines = processedCsv.split('\n').slice(0, 6); // Primeiras 5 linhas + cabeçalho
    processedData.innerHTML = `
        <div class="data-preview">
            <h5>Preview dos dados limpos:</h5>
            <pre>${previewLines.join('\n')}</pre>
            ${processedCsv.split('\n').length > 6 ? '<p><em>... e mais linhas</em></p>' : ''}
        </div>
    `;
    
    // Armazenar dados para download
    processedFileData = processedCsv;
}

// Função de download
function downloadProcessedFile() {
    if (!processedFileData) {
        alert('Nenhum arquivo processado disponível para download.');
        return;
    }
    
    const blob = new Blob([processedFileData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentFile.name.replace('.csv', '')}_limpo.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Smooth scrolling para navegação
function addSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Animações de entrada
function observeElements() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    });
    
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
}

// Inicializar observador quando a página carregar
document.addEventListener('DOMContentLoaded', observeElements);

// Adicionar estilos CSS para o relatório
const reportStyles = `
    .report-stats {
        display: grid;
        gap: 1rem;
    }
    
    .stat-item {
        padding: 0.5rem;
        background: #f8f9fa;
        border-radius: 5px;
        border-left: 4px solid #667eea;
    }
    
    .data-preview {
        max-height: 300px;
        overflow-y: auto;
    }
    
    .data-preview pre {
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 5px;
        font-size: 0.9rem;
        overflow-x: auto;
    }
    
    .data-preview h5 {
        margin-bottom: 1rem;
        color: #333;
    }
`;

// Adicionar estilos ao head
const styleSheet = document.createElement('style');
styleSheet.textContent = reportStyles;
document.head.appendChild(styleSheet);

