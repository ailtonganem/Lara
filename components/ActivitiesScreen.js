// ====================================================================
// COMPONENTE: TELA DE ATIVIDADES
// ====================================================================
// Responsável por exibir o conteúdo de um módulo: a lista de
// atividades e o conteúdo da atividade selecionada (texto ou quiz).
// ====================================================================

import { getAtividades } from '../services/firestoreService.js';
import { renderModulesScreen } from './ModulesScreen.js';

const appContainer = document.getElementById('app');
let currentActivities = []; // Armazena as atividades carregadas para evitar buscas repetidas

/**
 * Renderiza o conteúdo de uma atividade específica na área de conteúdo.
 * @param {string} activityId O ID da atividade a ser exibida.
 */
const renderActivityContent = (activityId) => {
    const activity = currentActivities.find(a => a.id === activityId);
    const contentContainer = document.getElementById('activity-content');

    if (!activity) {
        contentContainer.innerHTML = '<p>Selecione uma atividade para começar.</p>';
        return;
    }

    // Marca o item selecionado na lista
    document.querySelectorAll('.activity-item').forEach(item => {
        item.classList.toggle('active', item.dataset.id === activityId);
    });

    if (activity.tipo === 'texto') {
        contentContainer.innerHTML = `
            <h2>${activity.titulo}</h2>
            <div class="activity-text-content">${activity.conteudo}</div>
        `;
    } else if (activity.tipo === 'quiz') {
        let quizHtml = `<h2>${activity.titulo}</h2>`;
        activity.perguntas.forEach((pergunta, index) => {
            quizHtml += `
                <div class="quiz-question" id="question-${index}">
                    <p><strong>${index + 1}. ${pergunta.pergunta}</strong></p>
                    <div class="quiz-options">
                        ${pergunta.opcoes.map((opcao, i) => `
                            <div class="quiz-option" data-question="${index}" data-option="${i}">
                                ${opcao}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });
        quizHtml += `<button id="check-quiz-btn">Verificar Respostas</button><div id="quiz-results"></div>`;
        contentContainer.innerHTML = quizHtml;

        // Adiciona eventos para seleção de opções
        document.querySelectorAll('.quiz-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const qIndex = e.currentTarget.dataset.question;
                // Desmarca outras opções da mesma pergunta
                document.querySelectorAll(`.quiz-option[data-question="${qIndex}"]`).forEach(opt => opt.classList.remove('selected'));
                // Marca a opção clicada
                e.currentTarget.classList.add('selected');
            });
        });

        // Adiciona evento ao botão de verificação
        document.getElementById('check-quiz-btn').addEventListener('click', () => checkQuiz(activity));
    }
};

/**
 * Verifica as respostas do quiz e exibe o resultado.
 * @param {object} activity A atividade do tipo quiz.
 */
const checkQuiz = (activity) => {
    let correctAnswers = 0;
    activity.perguntas.forEach((pergunta, index) => {
        const selectedOption = document.querySelector(`.quiz-option[data-question="${index}"].selected`);
        const questionDiv = document.getElementById(`question-${index}`);

        // Remove feedback anterior
        questionDiv.style.border = 'none';

        if (selectedOption) {
            const selectedAnswer = parseInt(selectedOption.dataset.option);
            if (selectedAnswer === pergunta.respostaCorreta) {
                correctAnswers++;
                questionDiv.style.border = '2px solid #28a745'; // Verde para correto
            } else {
                questionDiv.style.border = '2px solid #dc3545'; // Vermelho para incorreto
            }
        }
    });

    const resultsContainer = document.getElementById('quiz-results');
    resultsContainer.innerHTML = `
        <h3 style="margin-top: 20px;">Resultado: Você acertou ${correctAnswers} de ${activity.perguntas.length} perguntas!</h3>
    `;
};

/**
 * Renderiza a tela de atividades de um módulo.
 */
export const renderActivitiesScreen = async (user, materiaId, materiaNome, moduleId, moduleNome) => {
    appContainer.innerHTML = `
        <div class="breadcrumbs">
            <span id="back-to-modules-btn">${materiaNome}</span> > ${moduleNome}
        </div>
        <div class="activities-layout">
            <div id="activities-list" class="activities-sidebar">Carregando...</div>
            <div id="activity-content" class="activity-main-content"></div>
        </div>
    `;

    document.getElementById('back-to-modules-btn').addEventListener('click', () => renderModulesScreen(user, materiaId, materiaNome));

    currentActivities = await getAtividades(materiaId, moduleId);
    const activitiesListContainer = document.getElementById('activities-list');

    if (currentActivities.length === 0) {
        activitiesListContainer.innerHTML = '<p>Nenhuma atividade aqui.</p>';
        document.getElementById('activity-content').innerHTML = '<p>Este módulo ainda não possui atividades.</p>';
        return;
    }

    let activitiesHtml = '<ul>';
    currentActivities.forEach(activity => {
        activitiesHtml += `
            <li class="activity-item" data-id="${activity.id}">
                <span class="activity-type-icon">${activity.tipo === 'texto' ? '📖' : '❓'}</span>
                ${activity.titulo}
            </li>
        `;
    });
    activitiesHtml += '</ul>';
    activitiesListContainer.innerHTML = activitiesHtml;

    document.querySelectorAll('.activity-item').forEach(item => {
        item.addEventListener('click', (e) => renderActivityContent(e.currentTarget.dataset.id));
    });

    // Renderiza a primeira atividade por padrão
    renderActivityContent(currentActivities[0].id);
};
