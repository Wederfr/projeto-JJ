document.addEventListener('DOMContentLoaded', () => {
    // Referências aos elementos HTML
    const formularioAtleta = document.getElementById('formulario-atleta');
    const listaAtletas = document.getElementById('lista-atletas');
    const btnSalvarAtleta = document.getElementById('btn-salvar-atleta');
    const atletaIdInput = document.getElementById('atleta-id');

    const nomeInput = document.getElementById('nome');
    const sexoInput = document.getElementById('sexo');
    const idadeInput = document.getElementById('idade');
    const pesoInput = document.getElementById('peso');
    const alturaInput = document.getElementById('altura');
    const faixaInput = document.getElementById('faixa');

    // Referências aos elementos HTML para chaveamento
    const btnGerarChaveamento = document.getElementById('btn-gerar-chaveamento');
    const chaveamentosContainer = document.getElementById('chaveamentos');
    const imprimirChaveamentoBtn = document.getElementById('imprimir-chaveamento');

    // URL base do nosso backend
    const API_URL = 'http://localhost:3000/atletas';

    // --- Funções de interação com o Backend ---

    async function carregarAtletas() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            const data = await response.json();
            const atletas = data.data;
            
            renderizarAtletas(atletas);
        } catch (error) {
            console.error('Erro ao carregar atletas:', error);
            alert('Não foi possível carregar os atletas. Verifique o servidor.');
        }
    }

    async function adicionarAtleta(atleta) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(atleta)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
            }
            await carregarAtletas();
        } catch (error) {
            console.error('Erro ao adicionar atleta:', error);
            alert(`Não foi possível adicionar o atleta: ${error.message}`);
        }
    }

    async function editarAtleta(id, atletaAtualizado) {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(atletaAtualizado)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
            }
            await carregarAtletas();
        } catch (error) {
            console.error('Erro ao editar atleta:', error);
            alert(`Não foi possível editar o atleta: ${error.message}`);
        }
    }

    async function excluirAtleta(id) {
        if (!confirm('Tem certeza que deseja excluir este atleta?')) {
            return;
        }
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
            }
            await carregarAtletas();
        } catch (error) {
            console.error('Erro ao excluir atleta:', error);
            alert(`Não foi possível excluir o atleta: ${error.message}`);
        }
    }

    // --- Funções de Renderização e UI ---

    function renderizarAtletas(atletas) {
        listaAtletas.innerHTML = '';
        if (atletas.length === 0) {
            listaAtletas.innerHTML = '<tr><td colspan="7">Nenhum atleta cadastrado ainda.</td></tr>';
            return;
        }
        atletas.forEach(atleta => {
            const row = listaAtletas.insertRow();
            row.dataset.id = atleta.id;
            row.innerHTML = `
                <td>${atleta.nome}</td>
                <td>${atleta.sexo}</td>
                <td>${atleta.idade}</td>
                <td>${atleta.peso}</td>
                <td>${atleta.altura}</td>
                <td>${atleta.faixa}</td>
                <td>
                    <button class="editar" data-id="${atleta.id}">✏️</button>
                    <button class="excluir" data-id="${atleta.id}">🗑️</button>
                </td>
            `;
        });
    }

    async function preencherFormularioParaEdicao(id) {
        try {
            const response = await fetch(`${API_URL}/${id}`);
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            const data = await response.json();
            const atleta = data.data;

            if (atleta) {
                nomeInput.value = atleta.nome;
                sexoInput.value = atleta.sexo;
                idadeInput.value = atleta.idade;
                pesoInput.value = atleta.peso;
                alturaInput.value = atleta.altura;
                faixaInput.value = atleta.faixa;
                atletaIdInput.value = atleta.id;
                btnSalvarAtleta.textContent = 'Atualizar Atleta';
            }
        } catch (error) {
            console.error('Erro ao carregar dados do atleta para edição:', error);
            alert('Não foi possível carregar os dados do atleta para edição.');
        }
    }

    function limparFormulario() {
        formularioAtleta.reset();
        atletaIdInput.value = '';
        btnSalvarAtleta.textContent = 'Adicionar Atleta';
    }

    // --- Funções Auxiliares para Lógica de Chaveamento ---

    function getFaixaOrder(faixa) {
        const order = {
            "Branca": 1, "Cinza": 2, "Amarela": 3, "Laranja": 4, "Verde": 5,
            "Azul": 6, "Roxa": 7, "Marrom": 8, "Preta": 9, "Vermelha": 10
        };
        return order[faixa] || 99;
    }

    function getIdadeCategoria(idade) {
        if (idade <= 15) return 'Kids';
        if (idade >= 16 && idade <= 17) return 'Juvenil';
        if (idade >= 18 && idade <= 29) return 'Adulto';
        if (idade >= 30 && idade <= 35) return 'Master 1';
        if (idade >= 36 && idade <= 40) return 'Master 2';
        return 'Master 3+';
    }

    function getPesoCategoria(peso, sexo) {
        if (sexo === 'Masculino') {
            if (peso <= 65) return 'Galo/Pluma (Masc)';
            if (peso <= 75) return 'Pena/Leve (Masc)';
            if (peso <= 85) return 'Médio/Meio-Pesado (Masc)';
            if (peso <= 95) return 'Pesado/Super Pesado (Masc)';
            return 'Pesadíssimo (Masc)';
        } else {
            if (peso <= 55) return 'Galo/Pluma (Fem)';
            if (peso <= 65) return 'Pena/Leve (Fem)';
            if (peso <= 75) return 'Médio/Meio-Pesado (Fem)';
            if (peso <= 85) return 'Pesado/Super Pesado (Fem)';
            return 'Pesadíssimo (Fem)';
        }
    }
    
    // --- FUNÇÃO CENTRAL DE GERAÇÃO DOS CONFRONTOS (Retorna os dados, não o HTML) ---
    async function gerarConfrontos() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            const data = await response.json();
            let atletas = data.data;

            if (atletas.length < 2) {
                return {
                    message: 'Pelo menos dois atletas são necessários para gerar um chaveamento.',
                    groups: []
                };
            }

            const gruposChaveamento = [];
            let totalConfrontosGerados = 0;

            const atletasPorSexo = atletas.reduce((acc, atleta) => {
                const sexo = atleta.sexo;
                if (!acc[sexo]) acc[sexo] = [];
                acc[sexo].push(atleta);
                return acc;
            }, {});

            for (const sexo in atletasPorSexo) {
                let atletasGrupoSexo = atletasPorSexo[sexo];
                const atletasPorFaixa = atletasGrupoSexo.reduce((acc, atleta) => {
                    const faixa = atleta.faixa;
                    if (!acc[faixa]) acc[faixa] = [];
                    acc[faixa].push(atleta);
                    return acc;
                }, {});

                const faixasOrdenadas = Object.keys(atletasPorFaixa).sort((a, b) => getFaixaOrder(a) - getFaixaOrder(b));

                for (const faixa of faixasOrdenadas) {
                    let atletasGrupoFaixa = atletasPorFaixa[faixa];
                    const atletasPorIdade = atletasGrupoFaixa.reduce((acc, atleta) => {
                        const categoriaIdade = getIdadeCategoria(atleta.idade);
                        if (!acc[categoriaIdade]) acc[categoriaIdade] = [];
                        acc[categoriaIdade].push(atleta);
                        return acc;
                    }, {});

                    const categoriasIdadeOrdenadas = Object.keys(atletasPorIdade).sort((a, b) => {
                        const order = {'Kids':1, 'Juvenil':2, 'Adulto':3, 'Master 1':4, 'Master 2':5, 'Master 3+':6};
                        return (order[a] || 99) - (order[b] || 99);
                    });

                    for (const categoriaIdade of categoriasIdadeOrdenadas) {
                        let atletasGrupoIdade = atletasPorIdade[categoriaIdade];
                        const atletasPorPeso = atletasGrupoIdade.reduce((acc, atleta) => {
                            const categoriaPeso = getPesoCategoria(atleta.peso, atleta.sexo);
                            if (!acc[categoriaPeso]) acc[categoriaPeso] = [];
                            acc[categoriaPeso].push(atleta);
                            return acc;
                        }, {});

                        for (const categoriaPeso in atletasPorPeso) {
                            let grupoFinal = atletasPorPeso[categoriaPeso];
                            const grupoInfo = {
                                sexo,
                                faixa,
                                categoriaIdade,
                                categoriaPeso,
                                confrontos: [],
                                atletasComFolga: [],
                                apenasUmAtleta: false
                            };

                            if (grupoFinal.length >= 2) {
                                totalConfrontosGerados++;
                                grupoFinal.sort(() => Math.random() - 0.5); // Embaralhar
                                for (let i = 0; i < grupoFinal.length; i += 2) {
                                    const atleta1 = grupoFinal[i];
                                    const atleta2 = grupoFinal[i + 1];
                                    if (atleta2) {
                                        grupoInfo.confrontos.push({ atleta1: atleta1.nome, atleta2: atleta2.nome });
                                    } else {
                                        grupoInfo.atletasComFolga.push(atleta1.nome);
                                    }
                                }
                            } else if (grupoFinal.length === 1) {
                                grupoInfo.apenasUmAtleta = true;
                                grupoInfo.atletasComFolga.push(grupoFinal[0].nome);
                            }
                            gruposChaveamento.push(grupoInfo);
                        }
                    }
                }
            }
            
            if (totalConfrontosGerados === 0 && atletas.length >= 2) {
                 return {
                    message: 'Não foi possível formar nenhum chaveamento com pelo menos 2 atletas em cada categoria combinada (Sexo, Faixa, Idade, Peso).',
                    groups: gruposChaveamento
                };
            }
            return {
                message: '', // Sem mensagem de erro se gerou chaveamentos
                groups: gruposChaveamento
            };

        } catch (error) {
            console.error('Erro ao gerar confrontos:', error);
            return {
                message: 'Erro ao gerar confrontos: ' + error.message,
                groups: []
            };
        }
    }

    // --- Exibe o chaveamento textual na página ---
    async function exibirChaveamentoTextual() {
        chaveamentosContainer.innerHTML = '<h2>Chaveamentos Gerados</h2>';
        const result = await gerarConfrontos();

        if (result.message) {
            chaveamentosContainer.innerHTML += `<p>${result.message}</p>`;
            return;
        }

        const chaveamentosLista = document.createElement('div');
        chaveamentosLista.id = 'chaveamentos-lista-gerada';
        chaveamentosContainer.appendChild(chaveamentosLista);

        if (result.groups.length === 0) {
            chaveamentosLista.innerHTML = `<p>Nenhum chaveamento gerado. Verifique os atletas cadastrados.</p>`;
            return;
        }

        result.groups.forEach(grupo => {
            if (grupo.apenasUmAtleta) {
                const chaveamentoHtml = document.createElement('div');
                chaveamentoHtml.classList.add('chaveamento-grupo-unico');
                chaveamentoHtml.innerHTML = `
                    <h3>${grupo.sexo} - Faixa ${grupo.faixa} - ${grupo.categoriaIdade} - ${grupo.categoriaPeso}</h3>
                    <p>Apenas um atleta neste grupo: ${grupo.atletasComFolga[0]}. Não há oponentes para chaveamento.</p>
                `;
                chaveamentosLista.appendChild(chaveamentoHtml);
            } else {
                const chaveamentoHtml = document.createElement('div');
                chaveamentoHtml.classList.add('chaveamento-grupo');
                let confrontosLista = grupo.confrontos.map(c => `<li>${c.atleta1} vs ${c.atleta2}</li>`).join('');
                let folgasLista = grupo.atletasComFolga.map(a => `<li>${a} (Folga)</li>`).join('');

                chaveamentoHtml.innerHTML = `
                    <h3>${grupo.sexo} - Faixa ${grupo.faixa} - ${grupo.categoriaIdade} - ${grupo.categoriaPeso}</h3>
                    <ul>
                        ${confrontosLista}
                        ${folgasLista}
                    </ul>
                `;
                chaveamentosLista.appendChild(chaveamentoHtml);
            }
        });
    }

    // --- NOVA FUNÇÃO: Gera o HTML para as rodadas do chaveamento em formato de bracket ---
    function generateBracketRoundsHtml(grupo) {
        const totalParticipants = grupo.confrontos.length * 2 + grupo.atletasComFolga.length;
        
        // Determine o menor número de 2^N que comporta todos os participantes
        let bracketSize = 2;
        while (bracketSize < totalParticipants) {
            bracketSize *= 2;
        }

        if (totalParticipants < 2) return ''; // Não gera bracket para menos de 2 participantes

        const roundsHtml = []; // Array para armazenar o HTML de cada coluna de rodada

        // --- Rodada 1 (Confrontos Iniciais) ---
        let round1Title;
        let requiredMatchesForFirstFullBracketRound = bracketSize / 2; // Ex: 8 para um bracket de 16

        if (bracketSize >= 16) {
            round1Title = "Rodada de Oitavas"; // Para 16 ou mais atletas no bracket
        } else if (bracketSize === 8) {
            round1Title = "Quartas de Final"; // Para 8 atletas no bracket
        } else if (bracketSize === 4) {
            round1Title = "Semifinais"; // Para 4 atletas no bracket
        } else { // bracketSize === 2 (para 2 atletas iniciais)
            round1Title = "Final";
        }

        let currentRoundColumnHtml = '';
        // Adiciona os confrontos reais
        grupo.confrontos.forEach(c => {
            currentRoundColumnHtml += `
                <div class="matchup">
                    <div class="player-slot">${c.atleta1}</div>
                    <div class="player-slot">${c.atleta2}</div>
                </div>
            `;
        });
        // Adiciona as folgas (byes)
        grupo.atletasComFolga.forEach(a => {
            currentRoundColumnHtml += `
                <div class="matchup bye-matchup">
                    <div class="player-slot">${a} (Folga)</div>
                    <div class="player-slot empty-slot"></div>
                </div>
            `;
        });

        // Adiciona confrontos em branco para preencher a primeira rodada se o total de participantes não for potência de 2
        const actualMatchesInRound1 = grupo.confrontos.length + grupo.atletasComFolga.length;
        const blankMatchesToAdd = requiredMatchesForFirstFullBracketRound - actualMatchesInRound1;
        for(let i = 0; i < blankMatchesToAdd; i++) {
            currentRoundColumnHtml += `
                <div class="matchup">
                    <div class="player-slot empty-slot"></div>
                    <div class="player-slot empty-slot"></div>
                </div>
            `;
        }

        roundsHtml.push(`
            <div class="bracket-round-column">
                <h4>${round1Title}</h4>
                ${currentRoundColumnHtml}
            </div>
        `);

        // --- Rodadas Subsequentes (Quartas, Semifinais, Final) ---
        let remainingBracketMatches = requiredMatchesForFirstFullBracketRound;
        const fixedRoundTitles = ["Quartas de Final", "Semifinais", "Final"];
        let fixedTitleIndex = 0; // Começa a partir de Quartas se a Rodada 1 foi Oitavas

        // Ajusta o fixedTitleIndex com base no título da Rodada 1
        if (round1Title === "Rodada de Oitavas") fixedTitleIndex = 0;
        else if (round1Title === "Quartas de Final") fixedTitleIndex = 1;
        else if (round1Title === "Semifinais") fixedTitleIndex = 2;
        else fixedTitleIndex = 3; // Se a Rodada 1 já é a Final, não há mais rodadas.

        while (remainingBracketMatches > 1) {
            remainingBracketMatches = Math.ceil(remainingBracketMatches / 2); // Número de confrontos na próxima rodada

            let roundTitle = fixedRoundTitles[fixedTitleIndex];
            if (fixedTitleIndex >= fixedRoundTitles.length) { 
                // Fallback para brackets muito grandes, se necessário, embora não seja o caso para até 16
                roundTitle = `Rodada ${roundsHtml.length + 1}`;
            }
            fixedTitleIndex++;

            let roundColumnHtml = '';
            if (remainingBracketMatches === 1 && roundTitle === "Final") { // O último confronto, para o vencedor
                roundColumnHtml += `
                    <div class="matchup">
                        <div class="player-slot empty-slot final-winner"></div>
                    </div>
                `;
            } else {
                for (let i = 0; i < remainingBracketMatches; i++) {
                    roundColumnHtml += `
                        <div class="matchup">
                            <div class="player-slot empty-slot"></div>
                            <div class="player-slot empty-slot"></div>
                        </div>
                    `;
                }
            }

            roundsHtml.push(`
                <div class="bracket-round-column">
                    <h4>${roundTitle}</h4>
                    ${roundColumnHtml}
                </div>
            `);
        }

        return roundsHtml.join('');
    }

    // --- Gerar e Imprimir Chaveamento como Fluxograma ---
    async function imprimirChaveamentoFluxograma() {
        const result = await gerarConfrontos(); // Reutiliza a lógica de geração de confrontos

        if (result.message) {
            alert(result.message);
            return;
        }
        
        if (result.groups.length === 0) {
            alert("Não há chaveamentos para imprimir. Adicione atletas e gere o chaveamento primeiro.");
            return;
        }

        let printContent = `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Chaveamento de Jiu-Jitsu para Impressão</title>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        margin: 20px;
                        color: #333;
                        -webkit-print-color-adjust: exact; /* Para imprimir cores de fundo */
                        print-color-adjust: exact;
                    }
                    h1 {
                        text-align: center;
                        color: #0056b3;
                        border-bottom: 2px solid #007bff;
                        padding-bottom: 10px;
                        margin-bottom: 30px;
                    }
                    .chaveamento-bracket-print {
                        border: 1px solid #cce5ff;
                        border-radius: 8px;
                        margin-bottom: 30px;
                        padding: 15px;
                        background-color: #f8fcff; /* Fundo mais claro para a seção de chaveamento */
                        page-break-inside: avoid; /* Evita quebras de página dentro do grupo */
                    }
                    .chaveamento-bracket-print h3 {
                        color: #004085;
                        text-align: center;
                        margin-top: 0;
                        margin-bottom: 20px;
                        font-size: 1.5em;
                        border-bottom: 2px solid #a8d7ff;
                        padding-bottom: 10px;
                    }
                    .bracket-rounds-container {
                        display: flex;
                        justify-content: center; /* Centraliza as colunas */
                        gap: 20px; /* Espaço entre as colunas de rodadas */
                        flex-wrap: wrap; /* Permite que as colunas quebrem em telas menores */
                    }
                    .bracket-round-column {
                        flex-shrink: 0; /* Não permite que as colunas encolham */
                        min-width: 180px; /* Largura mínima para cada coluna */
                        max-width: 250px; /* Largura máxima para cada coluna */
                        padding: 10px;
                        background-color: #e9f5ff; /* Fundo para cada coluna de rodada */
                        border-radius: 5px;
                        border: 1px solid #cce5ff;
                    }
                    .bracket-round-column h4 {
                        text-align: center;
                        margin-top: 0;
                        margin-bottom: 15px;
                        color: #0056b3;
                        font-size: 1.1em;
                        border-bottom: 1px dashed #a8d7ff;
                        padding-bottom: 5px;
                    }
                    .matchup {
                        background-color: #ffffff;
                        border: 1px solid #dee2e6;
                        border-radius: 4px;
                        margin-bottom: 10px;
                        padding: 8px;
                        text-align: center;
                        position: relative;
                        min-height: 50px; /* Garante altura mínima para matchups */
                        display: flex;
                        flex-direction: column;
                        justify-content: space-around;
                    }
                    .player-slot {
                        padding: 2px 0;
                        font-weight: bold;
                        color: #333;
                        min-height: 1.2em; /* Garante que slots vazios tenham altura */
                    }
                    .player-slot.empty-slot {
                        font-weight: normal;
                        color: #6c757d;
                        border-bottom: 1px dashed #ccc; /* Linha para preenchimento manual */
                    }
                    .player-slot.empty-slot:last-child {
                        border-bottom: none; /* Remove a linha do último slot se for o único */
                    }
                    .matchup.bye-matchup .player-slot:first-child {
                        color: #28a745; /* Cor para atleta com folga */
                    }
                    .player-slot.final-winner {
                        font-size: 1.2em;
                        color: #007bff;
                        /* border-top: 1px solid #007bff; */
                        /* margin-top: 10px; */
                        /* padding-top: 10px; */
                    }
                    /* Estilo para grupos com apenas um atleta (no print) */
                    .chaveamento-grupo-unico-print {
                        border: 1px solid #ffeeba;
                        border-radius: 8px;
                        margin-bottom: 20px;
                        padding: 15px;
                        background-color: #fff3cd;
                        page-break-inside: avoid;
                    }
                    .chaveamento-grupo-unico-print h3 {
                        color: #856404;
                        text-align: center;
                        margin-top: 0;
                        margin-bottom: 10px;
                        font-size: 1.3em;
                    }
                    .chaveamento-grupo-unico-print p {
                        color: #856404;
                        font-style: italic;
                        text-align: center;
                        margin-bottom: 0;
                        font-size: 1.1em;
                    }

                    /* Responsividade básica para impressão */
                    @media print {
                        body {
                            margin: 10mm;
                            font-size: 10pt;
                        }
                        h1 {
                            font-size: 18pt;
                        }
                        .chaveamento-bracket-print h3 {
                            font-size: 14pt;
                        }
                        .bracket-round-column {
                            min-width: 150px;
                            max-width: none; /* Deixa o browser decidir melhor a largura na impressão */
                            flex: 1; /* Distribui o espaço novamente */
                        }
                        .matchup {
                            min-height: 40px;
                            padding: 5px;
                        }
                        .player-slot {
                            font-size: 9pt;
                        }
                        .player-slot.final-winner {
                            font-size: 11pt;
                        }
                    }
                </style>
            </head>
            <body>
                <h1>Chaveamento de Jiu-Jitsu</h1>
        `;

        result.groups.forEach(grupo => {
            const groupTitle = `${grupo.sexo} - Faixa ${grupo.faixa} - ${grupo.categoriaIdade} - ${grupo.categoriaPeso}`;

            if (grupo.apenasUmAtleta) {
                printContent += `
                    <div class="chaveamento-grupo-unico-print">
                        <h3>${groupTitle}</h3>
                        <p>Apenas um atleta neste grupo: <strong>${grupo.atletasComFolga[0]}</strong>. Não há oponentes para chaveamento.</p>
                    </div>
                `;
            } else {
                printContent += `
                    <div class="chaveamento-bracket-print">
                        <h3>${groupTitle}</h3>
                        <div class="bracket-rounds-container">
                            ${generateBracketRoundsHtml(grupo)}
                        </div>
                    </div>
                `;
            }
        });

        printContent += `
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        // printWindow.close(); // Opcional: fechar a janela após a impressão, mas pode ser irritante
    }

    // --- Listeners de Eventos ---

    formularioAtleta.addEventListener('submit', async (event) => {
        event.preventDefault();

        const id = atletaIdInput.value;
        const atleta = {
            nome: nomeInput.value,
            sexo: sexoInput.value,
            idade: parseInt(idadeInput.value),
            peso: parseFloat(pesoInput.value),
            altura: parseInt(alturaInput.value),
            faixa: faixaInput.value
        };

        if (id) {
            await editarAtleta(id, atleta);
        } else {
            await adicionarAtleta(atleta);
        }
        limparFormulario();
    });

    const btnLimparFormulario = document.getElementById('btn-limpar-formulario');
    if (btnLimparFormulario) {
        btnLimparFormulario.addEventListener('click', limparFormulario);
    }

    listaAtletas.addEventListener('click', async (event) => {
        const target = event.target;
        const id = target.dataset.id;

        if (target.classList.contains('editar')) {
            await preencherFormularioParaEdicao(id);
        } else if (target.classList.contains('excluir')) {
            await excluirAtleta(id);
        }
    });

    if (btnGerarChaveamento) {
        btnGerarChaveamento.addEventListener('click', exibirChaveamentoTextual);
    }

    if (imprimirChaveamentoBtn) {
        imprimirChaveamentoBtn.addEventListener('click', imprimirChaveamentoFluxograma);
    }

    carregarAtletas();
});