// ====================================================================
// COMPONENTE: TELA DE GERENCIAMENTO DE ATIVIDADES
// ====================================================================
// Responsável por gerenciar (CRUD) as atividades de um módulo específico.
// ====================================================================

import { renderModuleManagementScreen } from './ModuleManagementScreen.js';
// Importa a instância do Firestore do nosso serviço central
import { db } from '../services/firebaseService.js';

const appContainer = document.getElementById('app');

// --- FUNÇÕES DE LÓGICA (CRUD Atividades) ---

/**
 * Salva uma nova atividade no Firestore.
 * @param {string} materiaId ID da matéria pai.
 * @param {string} moduleId ID do módulo pai.
 */
const saveActivity = async (materiaId, moduleId) => {
    const titulo = document.getElementById('activity-titulo').value;
    const ordem = document.getElementById('activity-ordem').value;
    const tipo = document.getElementById('activity-tipo').value;
    const feedback = document.getElementById('form-feedback');

    if (!titulo || !ordem || !tipo) {
        feedback.textContent = 'Por favor, preencha Título, Ordem e Tipo.';
        return;
    }

    let activityData = {
        titulo: titulo,
        ordem: Number(ordem),
        tipo: tipo
    };

    if (tipo === 'texto') {
        activityData.conteudo = document.getElementById('activity-content-text').value;
    } else if (tipo === 'quiz') {
        activityData.perguntas = [];
        const questionElements = document.querySelectorAll('.question-item');
        for (const el of questionElements) {
            const pergunta = el.querySelector('input[name="pergunta"]').value;
            const opcoes = Array.from(el.querySelectorAll('input[name="opcao"]')).map(input => input.value);
            const respostaCorretaIndex = el.querySelector('select[name="respostaCorreta"]').value;

            if (!pergunta || opcoes.some(opt => !opt) || respostaCorretaIndex === "") {
                feedback.textContent = 'Preencha todos os campos de todas as perguntas do quiz.';
                return;
            }
            activityData.perguntas.push({
                pergunta: pergunta,
                opcoes: opcoes,
                respostaCorreta: Number(respostaCorretaIndex)
            });
        }
    }

    try {
        await db.collection('materias').doc(materiaId).collection('modulos').doc(moduleId).collection('atividades').add(activityData);
        const materiaDoc = await db.collection('materias').doc(materiaId).get();
        const moduleDoc = await db.collection('materias').doc(materiaId).collection('modulos').doc(moduleId).get();
        renderActivityManagementScreen(materiaId, materiaDoc.data().nome, moduleId, moduleDoc.data().nome);
    } catch (error) {
        console.error("Erro ao salvar atividade: ", error);
        feedback.textContent = 'Ocorreu um erro ao salvar a atividade.';
    }
};

/**
 * Atualiza uma atividade existente no Firestore.
 * @param {string} materiaId ID da matéria pai.
 * @param {string} moduleId ID do módulo pai.
 * @param {string} activityId ID da atividade a ser atualizada.
 */
const updateActivity = async (materiaId, moduleId, activityId) => {
    const titulo = document.getElementById('activity-titulo-edit').value;
    const ordem = document.getElementById('activity-ordem-edit').value;
    const tipo = document.getElementById('activity-tipo-edit').value;
    const feedback = document.getElementById('form-feedback-edit');

    if (!titulo || !ordem || !tipo) {
        feedback.textContent = 'Por favor, preencha Título, Ordem e Tipo.';
        return;
    }

    let activityData = {
        titulo: titulo,
        ordem: Number(ordem),
        tipo: tipo
    };

    if (tipo === 'texto') {
        activityData.conteudo = document.getElementById('activity-content-text-edit').value;
    } else if (tipo === 'quiz') {
        activityData.perguntas = [];
        const questionElements = document.querySelectorAll('.question-item');
        for (const el of questionElements) {
            const pergunta = el.querySelector('input[name="pergunta"]').value;
            const opcoes = Array.from(el.querySelectorAll('input[name="opcao"]')).map(input => input.value);
            const respostaCorretaIndex = el.querySelector('select[name="respostaCorreta"]').value;

            if (!pergunta || opcoes.some(opt => !opt) || respostaCorretaIndex === "") {
                feedback.textContent = 'Preencha todos os campos de todas as perguntas do quiz.';
                return;
            }
            activityData.perguntas.push({
                pergunta: pergunta,
                opcoes: opcoes,
                respostaCorreta: Number(respostaCorretaIndex)
            });
        }
    }

    try {
        await db.collection('materias').doc(materiaId).collection('modulos').doc(moduleId).collection('atividades').doc(activityId).update(activityData);
        const materiaDoc = await db.collection('materias').doc(materiaId).get();
        const moduleDoc = await db.collection('materias').doc(materiaId).collection('modulos').doc(moduleId).get();
        renderActivityManagementScreen(materiaId, materiaDoc.data().nome, moduleId, moduleDoc.data().nome);
    } catch (error) {
        console.error("Erro ao atualizar atividade: ", error);
        feedback.textContent = 'Ocorreu um erro ao atualizar a atividade.';
    }
};

/**
 * Exclui uma atividade do Firestore.
 * @param {string} materiaId ID da matéria pai.
 * @param {string} moduleId ID do módulo pai.
 * @param {string} activityId ID da atividade a ser excluída.
 */
const deleteActivity = async (materiaId, moduleId, activityId) => {
    if (confirm("Tem certeza que deseja excluir esta atividade?")) {
        try {
            await db.collection('materias').doc(materiaId).collection('modulos').doc(moduleId).collection('atividades').doc(activityId).delete();
            const materiaDoc = await db.collection('materias').doc(materiaId).get();
            const moduleDoc = await db.collection('materias').doc(materiaId).collection('modulos').doc(moduleId).get();
            renderActivityManagementScreen(materiaId, materiaDoc.data().nome, moduleId, moduleDoc.data().nome);
        } catch (error) {
            console.error("Erro ao excluir atividade: ", error);
            alert("Ocorreu um erro ao tentar excluir a atividade.");
        }
    }
};

// --- FUNÇÕES DE RENDERIZAÇÃO ---

const renderFormContent = (type, containerId, data = {}) => {
    const container = document.getElementById(containerId);
    if (type === 'texto') {
        container.innerHTML = `<textarea id="${containerId.replace('-content', '-text')}" placeholder="Digite o conteúdo da aula aqui..." style="width: 100%; height: 150px;">${data.conteudo || ''}</textarea>`;
    } else if (type === 'quiz') {
        let questionsHtml = '';
        if (data.perguntas && data.perguntas.length > 0) {
            data.perguntas.forEach((q, index) => {
                questionsHtml += `
                    <div class="question-item" style="border: 1px solid #ddd; padding: 10px; margin-top: 10px;">
                        <p><strong>Pergunta ${index + 1}</strong></p>
                        <input type="text" name="pergunta" placeholder="Texto da pergunta" style="width: 100%;" value="${q.pergunta}">
                        <p style="margin-top: 5px;">Opções:</p>
                        <input type="text" name="opcao" placeholder="Opção 1" style="width: 100%;" value="${q.opcoes[0] || ''}">
                        <input type="text" name="opcao" placeholder="Opção 2" style="width: 100%;" value="${q.opcoes[1] || ''}">
                        <input type="text" name="opcao" placeholder="Opção 3" style="width: 100%;" value="${q.opcoes[2] || ''}">
                        <p style="margin-top: 5px;">Resposta Correta:</p>
                        <select name="respostaCorreta">
                            <option value="">Selecione...</option>
                            <option value="0" ${q.respostaCorreta === 0 ? 'selected' : ''}>Opção 1</option>
                            <option value="1" ${q.respostaCorreta === 1 ? 'selected' : ''}>Opção 2</option>
                            <option value="2" ${q.respostaCorreta === 2 ? 'selected' : ''}>Opção 3</option>
                        </select>
                    </div>
                `;
            });
        }
        container.innerHTML = `<h4>Perguntas do Quiz</h4><div id="questions-container">${questionsHtml}</div><button id="add-question-btn" type="button">Adicionar Pergunta</button>`;
        document.getElementById('add-question-btn').addEventListener('click', () => {
            const questionsContainer = document.getElementById('questions-container');
            const questionIndex = questionsContainer.children.length;
            const questionDiv = document.createElement('div');
            questionDiv.className = 'question-item';
            questionDiv.style.border = '1px solid #ddd'; questionDiv.style.padding = '10px'; questionDiv.style.marginTop = '10px';
            questionDiv.innerHTML = `<p><strong>Pergunta ${questionIndex + 1}</strong></p><input type="text" name="pergunta" placeholder="Texto da pergunta" style="width: 100%;"><p style="margin-top: 5px;">Opções:</p><input type="text" name="opcao" placeholder="Opção 1" style="width: 100%;"><input type="text" name="opcao" placeholder="Opção 2" style="width: 100%;"><input type="text" name="opcao" placeholder="Opção 3" style="width: 100%;"><p style="margin-top: 5px;">Resposta Correta:</p><select name="respostaCorreta"><option value="">Selecione...</option><option value="0">Opção 1</option><option value="1">Opção 2</option><option value="2">Opção 3</option></select>`;
            questionsContainer.appendChild(questionDiv);
        });
    } else {
        container.innerHTML = '';
    }
};

const renderActivityEditForm = async (materiaId, moduleId, activityId) => {
    try {
        const doc = await db.collection('materias').doc(materiaId).collection('modulos').doc(moduleId).collection('atividades').doc(activityId).get();
        if (!doc.exists) { console.error("Atividade não encontrada!"); return; }
        const activity = doc.data();
        const formContainer = document.getElementById('add-activity-form-container');
        formContainer.innerHTML = `
            <div style="border: 1px solid #ccc; padding: 15px; border-radius: 5px; background-color: #f9f9f9;">
                <h4>Editando Atividade: ${activity.titulo}</h4>
                <input type="text" id="activity-titulo-edit" value="${activity.titulo}" required>
                <input type="number" id="activity-ordem-edit" value="${activity.ordem}" required>
                <input type="text" id="activity-tipo-edit" value="${activity.tipo}" readonly>
                <div id="activity-type-content-edit" style="margin-top: 10px;"></div>
                <p id="form-feedback-edit" style="color: red;"></p>
                <button id="update-activity-btn">Atualizar Atividade</button>
                <button id="cancel-activity-btn">Cancelar</button>
            </div>
        `;
        renderFormContent(activity.tipo, 'activity-type-content-edit', activity);
        document.getElementById('update-activity-btn').addEventListener('click', () => updateActivity(materiaId, moduleId, activityId));
        document.getElementById('cancel-activity-btn').addEventListener('click', () => formContainer.innerHTML = '');
    } catch (error) {
        console.error("Erro ao buscar atividade para edição:", error);
    }
};

export const renderActivityManagementScreen = async (materiaId, materiaNome, moduleId, moduleNome) => {
    appContainer.innerHTML = `
        <h1>Gerenciar Atividades</h1>
        <h2>Matéria: ${materiaNome} > Módulo: ${moduleNome}</h2>
        <button id="back-to-modules-btn">← Voltar para Módulos</button>
        <hr style="margin: 20px 0;">
        <div id="activities-list">Carregando atividades...</div>
        <div id="add-activity-form-container" style="margin-top: 20px;"></div>
        <button id="add-activity-btn" style="margin-top: 10px;">+ Adicionar Nova Atividade</button>
    `;

    document.getElementById('back-to-modules-btn').addEventListener('click', () => renderModuleManagementScreen(materiaId, materiaNome));
    document.getElementById('add-activity-btn').addEventListener('click', () => {
        const formContainer = document.getElementById('add-activity-form-container');
        formContainer.innerHTML = `
            <div style="border: 1px solid #ccc; padding: 15px; border-radius: 5px;">
                <h4>Nova Atividade</h4>
                <input type="text" id="activity-titulo" placeholder="Título da Atividade" required>
                <input type="number" id="activity-ordem" placeholder="Ordem de exibição" required>
                <select id="activity-tipo" required><option value="">Selecione o tipo...</option><option value="texto">Texto</option><option value="quiz">Quiz</option></select>
                <div id="activity-type-content" style="margin-top: 10px;"></div>
                <p id="form-feedback" style="color: red;"></p>
                <button id="save-activity-btn">Salvar Atividade</button>
                <button id="cancel-activity-btn">Cancelar</button>
            </div>
        `;
        document.getElementById('activity-tipo').addEventListener('change', (e) => renderFormContent(e.target.value, 'activity-type-content'));
        document.getElementById('save-activity-btn').addEventListener('click', () => saveActivity(materiaId, moduleId));
        document.getElementById('cancel-activity-btn').addEventListener('click', () => formContainer.innerHTML = '');
    });

    try {
        const activitiesQuery = await db.collection('materias').doc(materiaId).collection('modulos').doc(moduleId).collection('atividades').orderBy('ordem').get();
        const activitiesList = document.getElementById('activities-list');
        if (activitiesQuery.empty) {
            activitiesList.innerHTML = '<p>Nenhuma atividade cadastrada para este módulo ainda.</p>';
        } else {
            let activitiesHtml = '<ul>';
            activitiesQuery.forEach(doc => {
                const activity = doc.data();
                activitiesHtml += `<li style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 10px;"><span>${activity.ordem}. ${activity.titulo} <strong>[${activity.tipo}]</strong></span><div><button class="edit-activity-btn" data-id="${doc.id}" style="margin-right: 5px;">Editar</button><button class="delete-activity-btn" data-id="${doc.id}">Excluir</button></div></li>`;
            });
            activitiesHtml += '</ul>';
            activitiesList.innerHTML = activitiesHtml;
            document.querySelectorAll('.edit-activity-btn').forEach(button => button.addEventListener('click', (event) => renderActivityEditForm(materiaId, moduleId, event.target.dataset.id)));
            document.querySelectorAll('.delete-activity-btn').forEach(button => button.addEventListener('click', (event) => deleteActivity(materiaId, moduleId, event.target.dataset.id)));
        }
    } catch (error) {
        console.error("Erro ao buscar atividades:", error);
        activitiesList.innerHTML = '<p style="color: red;">Erro ao carregar as atividades.</p>';
    }
};
