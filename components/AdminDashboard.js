// ====================================================================
// COMPONENTE: PAINEL DO ADMINISTRADOR
// ====================================================================
// Responsável por renderizar a interface do administrador, gerenciar
// usuários pendentes e gerenciar o conteúdo da plataforma.
// ====================================================================

// Importa a função de logout do serviço de autenticação
import { handleLogout } from '../services/authService.js';
// Importa a tela de gerenciamento de módulos
import { renderModuleManagementScreen } from './ModuleManagementScreen.js';

// Referências para os serviços do Firebase e o container da app
const db = firebase.firestore();
const appContainer = document.getElementById('app');

// --- FUNÇÕES DE LÓGICA (CRUD Matérias) ---

/**
 * Salva uma nova matéria no banco de dados do Firestore.
 */
const saveMateria = async () => {
    const nome = document.getElementById('materia-nome').value;
    const descricao = document.getElementById('materia-descricao').value;
    const icone = document.getElementById('materia-icone').value;
    const ordem = document.getElementById('materia-ordem').value;
    const feedback = document.getElementById('form-feedback');

    if (!nome || !descricao || !ordem) {
        feedback.textContent = 'Por favor, preencha todos os campos obrigatórios (Nome, Descrição, Ordem).';
        return;
    }

    const saveButton = document.getElementById('save-materia-btn');
    saveButton.disabled = true;
    saveButton.textContent = 'Salvando...';

    try {
        await db.collection('materias').add({
            nome: nome,
            descricao: descricao,
            icone: icone,
            ordem: Number(ordem)
        });
        console.log("Matéria adicionada com sucesso!");
        renderAdminDashboard();
    } catch (error) {
        console.error("Erro ao adicionar matéria: ", error);
        feedback.textContent = 'Ocorreu um erro ao salvar a matéria.';
        saveButton.disabled = false;
        saveButton.textContent = 'Salvar Matéria';
    }
};

/**
 * Atualiza uma matéria existente no Firestore.
 * @param {string} materiaId O ID do documento da matéria a ser atualizada.
 */
const updateMateria = async (materiaId) => {
    const nome = document.getElementById('materia-nome-edit').value;
    const descricao = document.getElementById('materia-descricao-edit').value;
    const icone = document.getElementById('materia-icone-edit').value;
    const ordem = document.getElementById('materia-ordem-edit').value;
    const feedback = document.getElementById('form-feedback-edit');

    if (!nome || !descricao || !ordem) {
        feedback.textContent = 'Por favor, preencha todos os campos obrigatórios.';
        return;
    }

    const updateButton = document.getElementById('update-materia-btn');
    updateButton.disabled = true;
    updateButton.textContent = 'Atualizando...';

    try {
        await db.collection('materias').doc(materiaId).update({
            nome: nome,
            descricao: descricao,
            icone: icone,
            ordem: Number(ordem)
        });
        console.log("Matéria atualizada com sucesso!");
        renderAdminDashboard();
    } catch (error) {
        console.error("Erro ao atualizar matéria: ", error);
        feedback.textContent = 'Ocorreu um erro ao atualizar a matéria.';
        updateButton.disabled = false;
        updateButton.textContent = 'Atualizar Matéria';
    }
};

/**
 * Exclui uma matéria do Firestore após confirmação.
 * @param {string} materiaId O ID do documento da matéria a ser excluída.
 */
const deleteMateria = async (materiaId) => {
    if (confirm("Tem certeza que deseja excluir esta matéria? Esta ação não pode ser desfeita.")) {
        try {
            await db.collection('materias').doc(materiaId).delete();
            console.log("Matéria excluída com sucesso!");
            renderAdminDashboard();
        } catch (error) {
            console.error("Erro ao excluir matéria: ", error);
            alert("Ocorreu um erro ao tentar excluir a matéria.");
        }
    }
};

/**
 * Altera o status de um usuário para 'aprovado: true' no Firestore.
 * @param {string} userId - O ID do documento do usuário a ser aprovado.
 */
const approveUser = (userId) => {
    const userDocRef = db.collection('users').doc(userId);
    userDocRef.update({ aprovado: true })
        .then(() => {
            console.log(`Usuário ${userId} aprovado com sucesso.`);
            renderAdminDashboard();
        })
        .catch(error => {
            console.error("Erro ao aprovar usuário:", error);
            alert("Ocorreu um erro ao tentar aprovar o usuário.");
        });
};

// --- FUNÇÕES DE RENDERIZAÇÃO ---

/**
 * Renderiza o formulário de edição de matéria.
 * @param {string} materiaId O ID da matéria a ser editada.
 */
const renderEditForm = async (materiaId) => {
    try {
        const doc = await db.collection('materias').doc(materiaId).get();
        if (!doc.exists) {
            console.error("Matéria não encontrada!");
            return;
        }
        const materia = doc.data();
        const formContainer = document.getElementById('add-materia-form-container');
        formContainer.innerHTML = `
            <div style="border: 1px solid #ccc; padding: 15px; border-radius: 5px; background-color: #f9f9f9;">
                <h4>Editando Matéria: ${materia.nome}</h4>
                <input type="text" id="materia-nome-edit" value="${materia.nome}" required>
                <input type="text" id="materia-descricao-edit" value="${materia.descricao}" required>
                <input type="text" id="materia-icone-edit" value="${materia.icone || ''}" placeholder="Nome do ícone (opcional)">
                <input type="number" id="materia-ordem-edit" value="${materia.ordem}" required>
                <p id="form-feedback-edit" style="color: red;"></p>
                <button id="update-materia-btn">Atualizar Matéria</button>
                <button id="cancel-materia-btn">Cancelar</button>
            </div>
        `;
        document.getElementById('update-materia-btn').addEventListener('click', () => updateMateria(materiaId));
        document.getElementById('cancel-materia-btn').addEventListener('click', () => formContainer.innerHTML = '');
    } catch (error) {
        console.error("Erro ao buscar matéria para edição:", error);
    }
};

/**
 * Renderiza o Painel do Administrador.
 */
export const renderAdminDashboard = async () => {
    appContainer.innerHTML = `
        <h1>Painel do Administrador</h1>
        <h2>Usuários Pendentes de Aprovação</h2>
        <div id="pending-users-list">Carregando usuários...</div>
        <hr style="margin: 30px 0;">
        <h2>Gerenciar Conteúdo</h2>
        <div id="content-management-section">
            <h3>Matérias</h3>
            <div id="materias-list">Carregando matérias...</div>
            <div id="add-materia-form-container" style="margin-top: 20px;"></div>
            <button id="add-materia-btn" style="margin-top: 10px;">+ Adicionar Nova Matéria</button>
        </div>
        <br>
        <button id="logout-button">Sair</button>
    `;
    document.getElementById('logout-button').addEventListener('click', handleLogout);

    document.getElementById('add-materia-btn').addEventListener('click', () => {
        const formContainer = document.getElementById('add-materia-form-container');
        formContainer.innerHTML = `
            <div style="border: 1px solid #ccc; padding: 15px; border-radius: 5px;">
                <h4>Nova Matéria</h4>
                <input type="text" id="materia-nome" placeholder="Nome da Matéria (ex: Matemática)" required>
                <input type="text" id="materia-descricao" placeholder="Breve descrição" required>
                <input type="text" id="materia-icone" placeholder="Nome do ícone (opcional)">
                <input type="number" id="materia-ordem" placeholder="Ordem de exibição (ex: 1)" required>
                <p id="form-feedback" style="color: red;"></p>
                <button id="save-materia-btn">Salvar Matéria</button>
                <button id="cancel-materia-btn">Cancelar</button>
            </div>
        `;
        document.getElementById('save-materia-btn').addEventListener('click', saveMateria);
        document.getElementById('cancel-materia-btn').addEventListener('click', () => formContainer.innerHTML = '');
    });

    // Carrega usuários pendentes
    try {
        const usersQuery = await db.collection('users').where('aprovado', '==', false).get();
        const pendingUsersList = document.getElementById('pending-users-list');
        if (usersQuery.empty) {
            pendingUsersList.innerHTML = '<p>Nenhum usuário pendente no momento.</p>';
        } else {
            let usersHtml = '<ul>';
            usersQuery.forEach(doc => {
                const user = doc.data();
                usersHtml += `<li style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;"><span>${user.email}</span><button class="approve-button" data-id="${doc.id}">Aprovar</button></li>`;
            });
            usersHtml += '</ul>';
            pendingUsersList.innerHTML = usersHtml;
            document.querySelectorAll('.approve-button').forEach(button => button.addEventListener('click', (event) => approveUser(event.target.dataset.id)));
        }
    } catch (error) {
        console.error("Erro ao buscar usuários pendentes:", error);
        document.getElementById('pending-users-list').innerHTML = '<p style="color: red;">Erro ao carregar a lista de usuários.</p>';
    }

    // Carrega matérias
    try {
        const materiasQuery = await db.collection('materias').orderBy('ordem').get();
        const materiasList = document.getElementById('materias-list');
        if (materiasQuery.empty) {
            materiasList.innerHTML = '<p>Nenhuma matéria cadastrada ainda.</p>';
        } else {
            let materiasHtml = '<ul>';
            materiasQuery.forEach(doc => {
                const materia = doc.data();
                materiasHtml += `
                    <li style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                        <span>${materia.ordem}. ${materia.nome}</span>
                        <div>
                            <button class="manage-modules-btn" data-id="${doc.id}" data-nome="${materia.nome}" style="margin-right: 5px;">Módulos</button>
                            <button class="edit-materia-btn" data-id="${doc.id}" style="margin-right: 5px;">Editar</button>
                            <button class="delete-materia-btn" data-id="${doc.id}">Excluir</button>
                        </div>
                    </li>
                `;
            });
            materiasHtml += '</ul>';
            materiasList.innerHTML = materiasHtml;

            // Adiciona eventos aos botões de ação das matérias
            document.querySelectorAll('.manage-modules-btn').forEach(button => {
                button.addEventListener('click', (event) => {
                    const materiaId = event.target.dataset.id;
                    const materiaNome = event.target.dataset.nome;
                    renderModuleManagementScreen(materiaId, materiaNome);
                });
            });
            document.querySelectorAll('.edit-materia-btn').forEach(button => button.addEventListener('click', (event) => renderEditForm(event.target.dataset.id)));
            document.querySelectorAll('.delete-materia-btn').forEach(button => button.addEventListener('click', (event) => deleteMateria(event.target.dataset.id)));
        }
    } catch (error) {
        console.error("Erro ao buscar matérias:", error);
        document.getElementById('materias-list').innerHTML = '<p style="color: red;">Erro ao carregar as matérias.</p>';
    }
};
