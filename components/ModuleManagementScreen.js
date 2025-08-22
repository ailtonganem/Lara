// ====================================================================
// COMPONENTE: TELA DE GERENCIAMENTO DE MÓDULOS
// ====================================================================
// Responsável por gerenciar (CRUD) os módulos de uma matéria específica.
// ====================================================================

// Importa as funções de renderização das telas adjacentes
import { renderAdminDashboard } from './AdminDashboard.js';
import { renderActivityManagementScreen } from './ActivityManagementScreen.js';

// Referências para os serviços do Firebase e o container da app
const db = firebase.firestore();
const appContainer = document.getElementById('app');

// --- FUNÇÕES DE LÓGICA (CRUD Módulos) ---

/**
 * Salva um novo módulo na subcoleção da matéria.
 * @param {string} materiaId O ID da matéria pai.
 */
const saveModule = async (materiaId) => {
    const nome = document.getElementById('module-nome').value;
    const descricao = document.getElementById('module-descricao').value;
    const ordem = document.getElementById('module-ordem').value;
    const feedback = document.getElementById('form-feedback');

    if (!nome || !ordem) {
        feedback.textContent = 'Por favor, preencha os campos obrigatórios (Nome, Ordem).';
        return;
    }

    try {
        await db.collection('materias').doc(materiaId).collection('modulos').add({
            nome: nome,
            descricao: descricao,
            ordem: Number(ordem)
        });
        const materiaDoc = await db.collection('materias').doc(materiaId).get();
        renderModuleManagementScreen(materiaId, materiaDoc.data().nome);
    } catch (error) {
        console.error("Erro ao adicionar módulo: ", error);
        feedback.textContent = 'Ocorreu um erro ao salvar o módulo.';
    }
};

/**
 * Atualiza um módulo existente no Firestore.
 * @param {string} materiaId O ID da matéria pai.
 * @param {string} moduleId O ID do módulo a ser atualizado.
 */
const updateModule = async (materiaId, moduleId) => {
    const nome = document.getElementById('module-nome-edit').value;
    const descricao = document.getElementById('module-descricao-edit').value;
    const ordem = document.getElementById('module-ordem-edit').value;
    const feedback = document.getElementById('form-feedback-edit');

    if (!nome || !ordem) {
        feedback.textContent = 'Por favor, preencha os campos obrigatórios.';
        return;
    }

    try {
        await db.collection('materias').doc(materiaId).collection('modulos').doc(moduleId).update({
            nome: nome,
            descricao: descricao,
            ordem: Number(ordem)
        });
        const materiaDoc = await db.collection('materias').doc(materiaId).get();
        renderModuleManagementScreen(materiaId, materiaDoc.data().nome);
    } catch (error) {
        console.error("Erro ao atualizar módulo: ", error);
        feedback.textContent = 'Ocorreu um erro ao atualizar o módulo.';
    }
};

/**
 * Exclui um módulo do Firestore.
 * @param {string} materiaId O ID da matéria pai.
 * @param {string} moduleId O ID do módulo a ser excluído.
 */
const deleteModule = async (materiaId, moduleId) => {
    if (confirm("Tem certeza que deseja excluir este módulo?")) {
        try {
            await db.collection('materias').doc(materiaId).collection('modulos').doc(moduleId).delete();
            const materiaDoc = await db.collection('materias').doc(materiaId).get();
            renderModuleManagementScreen(materiaId, materiaDoc.data().nome);
        } catch (error) {
            console.error("Erro ao excluir módulo: ", error);
            alert("Ocorreu um erro ao tentar excluir o módulo.");
        }
    }
};

// --- FUNÇÕES DE RENDERIZAÇÃO ---

/**
 * Renderiza o formulário de edição de módulo.
 * @param {string} materiaId O ID da matéria pai.
 * @param {string} moduleId O ID do módulo a ser editado.
 */
const renderModuleEditForm = async (materiaId, moduleId) => {
    try {
        const doc = await db.collection('materias').doc(materiaId).collection('modulos').doc(moduleId).get();
        if (!doc.exists) {
            console.error("Módulo não encontrado!");
            return;
        }
        const module = doc.data();
        const formContainer = document.getElementById('add-module-form-container');
        formContainer.innerHTML = `
            <div style="border: 1px solid #ccc; padding: 15px; border-radius: 5px; background-color: #f9f9f9;">
                <h4>Editando Módulo: ${module.nome}</h4>
                <input type="text" id="module-nome-edit" value="${module.nome}" required>
                <input type="text" id="module-descricao-edit" value="${module.descricao || ''}" placeholder="Breve descrição (opcional)">
                <input type="number" id="module-ordem-edit" value="${module.ordem}" required>
                <p id="form-feedback-edit" style="color: red;"></p>
                <button id="update-module-btn">Atualizar Módulo</button>
                <button id="cancel-module-btn">Cancelar</button>
            </div>
        `;
        document.getElementById('update-module-btn').addEventListener('click', () => updateModule(materiaId, moduleId));
        document.getElementById('cancel-module-btn').addEventListener('click', () => formContainer.innerHTML = '');
    } catch (error) {
        console.error("Erro ao buscar módulo para edição:", error);
    }
};

/**
 * Renderiza a tela de gerenciamento de módulos para uma matéria específica.
 * @param {string} materiaId O ID da matéria cujos módulos serão gerenciados.
 * @param {string} materiaNome O nome da matéria para exibição no título.
 */
export const renderModuleManagementScreen = async (materiaId, materiaNome) => {
    appContainer.innerHTML = `
        <h1>Gerenciar Módulos</h1>
        <h2>Matéria: ${materiaNome}</h2>
        <button id="back-to-admin-btn">← Voltar para Matérias</button>
        <hr style="margin: 20px 0;">

        <div id="modules-list">Carregando módulos...</div>
        <div id="add-module-form-container" style="margin-top: 20px;"></div>
        <button id="add-module-btn" style="margin-top: 10px;">+ Adicionar Novo Módulo</button>
    `;

    document.getElementById('back-to-admin-btn').addEventListener('click', renderAdminDashboard);

    document.getElementById('add-module-btn').addEventListener('click', () => {
        const formContainer = document.getElementById('add-module-form-container');
        formContainer.innerHTML = `
            <div style="border: 1px solid #ccc; padding: 15px; border-radius: 5px;">
                <h4>Novo Módulo</h4>
                <input type="text" id="module-nome" placeholder="Nome do Módulo" required>
                <input type="text" id="module-descricao" placeholder="Breve descrição (opcional)">
                <input type="number" id="module-ordem" placeholder="Ordem de exibição (ex: 1)" required>
                <p id="form-feedback" style="color: red;"></p>
                <button id="save-module-btn">Salvar Módulo</button>
                <button id="cancel-module-btn">Cancelar</button>
            </div>
        `;
        document.getElementById('save-module-btn').addEventListener('click', () => saveModule(materiaId));
        document.getElementById('cancel-module-btn').addEventListener('click', () => formContainer.innerHTML = '');
    });

    // Carrega e exibe os módulos da matéria
    try {
        const modulesQuery = await db.collection('materias').doc(materiaId).collection('modulos').orderBy('ordem').get();
        const modulesList = document.getElementById('modules-list');

        if (modulesQuery.empty) {
            modulesList.innerHTML = '<p>Nenhum módulo cadastrado para esta matéria ainda.</p>';
        } else {
            let modulesHtml = '<ul>';
            modulesQuery.forEach(doc => {
                const module = doc.data();
                modulesHtml += `
                    <li style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                        <span>${module.ordem}. ${module.nome}</span>
                        <div>
                            <button class="manage-activities-btn" data-id="${doc.id}" data-nome="${module.nome}" style="margin-right: 5px;">Atividades</button>
                            <button class="edit-module-btn" data-id="${doc.id}" style="margin-right: 5px;">Editar</button>
                            <button class="delete-module-btn" data-id="${doc.id}">Excluir</button>
                        </div>
                    </li>
                `;
            });
            modulesHtml += '</ul>';
            modulesList.innerHTML = modulesHtml;

            // Adiciona eventos aos botões de ação dos módulos
            document.querySelectorAll('.manage-activities-btn').forEach(button => {
                button.addEventListener('click', (event) => {
                    const moduleId = event.target.dataset.id;
                    const moduleNome = event.target.dataset.nome;
                    renderActivityManagementScreen(materiaId, materiaNome, moduleId, moduleNome);
                });
            });
            document.querySelectorAll('.edit-module-btn').forEach(button => {
                button.addEventListener('click', (event) => renderModuleEditForm(materiaId, event.target.dataset.id));
            });
            document.querySelectorAll('.delete-module-btn').forEach(button => {
                button.addEventListener('click', (event) => deleteModule(materiaId, event.target.dataset.id));
            });
        }
    } catch (error) {
        console.error("Erro ao buscar módulos:", error);
        modulesList.innerHTML = '<p style="color: red;">Erro ao carregar os módulos.</p>';
    }
};
