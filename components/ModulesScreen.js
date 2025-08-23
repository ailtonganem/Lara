// ====================================================================
// COMPONENTE: TELA DE MÓDulos
// ====================================================================
// Responsável por exibir os módulos de uma matéria específica.
// ====================================================================

import { getModulos } from '../services/firestoreService.js';
import { renderDashboard } from './Dashboard.js';
// Importa a função para renderizar a tela de atividades
import { renderActivitiesScreen } from './ActivitiesScreen.js';

const appContainer = document.getElementById('app');

/**
 * Renderiza a tela de módulos para uma matéria específica.
 * @param {object} user O objeto do usuário logado.
 * @param {string} materiaId O ID da matéria selecionada.
 * @param {string} materiaNome O nome da matéria para exibição.
 */
export const renderModulesScreen = async (user, materiaId, materiaNome) => {
    // 1. Renderiza o esqueleto da página
    appContainer.innerHTML = `
        <h1>${materiaNome}</h1>
        <p>Selecione um módulo para começar.</p>
        <button id="back-to-dashboard-btn">← Voltar para Matérias</button>
        <div id="modulos-container" style="margin-top: 20px;">Carregando módulos...</div>
    `;
    // Adiciona o evento de clique no botão de voltar, passando o usuário
    document.getElementById('back-to-dashboard-btn').addEventListener('click', () => renderDashboard(user));

    // 2. Busca os módulos da matéria
    const modulos = await getModulos(materiaId);
    const modulosContainer = document.getElementById('modulos-container');

    // 3. Verifica se há módulos e renderiza o conteúdo
    if (modulos.length === 0) {
        modulosContainer.innerHTML = '<p>Ainda não há módulos disponíveis para esta matéria.</p>';
        return;
    }

    let modulosHtml = '<ul class="modulos-list">';
    modulos.forEach(modulo => {
        modulosHtml += `
            <li class="modulo-item" data-id="${modulo.id}" data-nome="${modulo.nome}">
                <span class="modulo-ordem">${modulo.ordem}</span>
                <div class="modulo-info">
                    <h3>${modulo.nome}</h3>
                    <p>${modulo.descricao || ''}</p>
                </div>
            </li>
        `;
    });
    modulosHtml += '</ul>';

    modulosContainer.innerHTML = modulosHtml;

    // 4. Adiciona eventos de clique aos itens da lista para navegar para a tela de atividades
    document.querySelectorAll('.modulo-item').forEach(item => {
        item.addEventListener('click', (event) => {
            const moduloId = event.currentTarget.dataset.id;
            const moduloNome = event.currentTarget.dataset.nome;
            // Chama a função que renderiza a tela de atividades
            renderActivitiesScreen(user, materiaId, materiaNome, moduloId, moduloNome);
        });
    });
};
