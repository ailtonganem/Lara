// ====================================================================
// COMPONENTE: PAINEL DO ADMINISTRADOR
// ====================================================================
// Responsável por renderizar a interface do administrador, gerenciar
// usuários pendentes e gerenciar o conteúdo da plataforma.
// ====================================================================

// Importa a função de logout do serviço de autenticação
import { handleLogout } from '../services/authService.js';

// Referências para os serviços do Firebase e o container da app
const db = firebase.firestore();
const appContainer = document.getElementById('app');

/**
 * Altera o status de um usuário para 'aprovado: true' no Firestore.
 * @param {string} userId - O ID do documento do usuário a ser aprovado.
 */
const approveUser = (userId) => {
    const userDocRef = db.collection('users').doc(userId);
    userDocRef.update({ aprovado: true })
        .then(() => {
            console.log(`Usuário ${userId} aprovado com sucesso.`);
            renderAdminDashboard(); // Re-renderiza o painel para atualizar a lista
        })
        .catch(error => {
            console.error("Erro ao aprovar usuário:", error);
            alert("Ocorreu um erro ao tentar aprovar o usuário.");
        });
};

/**
 * Renderiza o Painel do Administrador com a lista de usuários pendentes e o gerenciador de conteúdo.
 */
export const renderAdminDashboard = async () => {
    // 1. Renderiza o esqueleto do painel
    appContainer.innerHTML = `
        <h1>Painel do Administrador</h1>

        <h2>Usuários Pendentes de Aprovação</h2>
        <div id="pending-users-list">Carregando usuários...</div>
        <hr style="margin: 30px 0;">

        <h2>Gerenciar Conteúdo</h2>
        <div id="content-management-section">
            <h3>Matérias</h3>
            <div id="materias-list">Carregando matérias...</div>
            <!-- Futuramente, aqui entrarão os botões para adicionar/editar -->
        </div>
        <br>
        <button id="logout-button">Sair</button>
    `;
    document.getElementById('logout-button').addEventListener('click', handleLogout);

    // 2. Carrega e exibe os usuários pendentes (lógica existente)
    try {
        const usersQuery = await db.collection('users').where('aprovado', '==', false).get();
        const pendingUsersList = document.getElementById('pending-users-list');

        if (usersQuery.empty) {
            pendingUsersList.innerHTML = '<p>Nenhum usuário pendente no momento.</p>';
        } else {
            let usersHtml = '<ul>';
            usersQuery.forEach(doc => {
                const user = doc.data();
                usersHtml += `
                    <li style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <span>${user.email}</span>
                        <button class="approve-button" data-id="${doc.id}">Aprovar</button>
                    </li>
                `;
            });
            usersHtml += '</ul>';
            pendingUsersList.innerHTML = usersHtml;

            document.querySelectorAll('.approve-button').forEach(button => {
                button.addEventListener('click', (event) => {
                    approveUser(event.target.dataset.id);
                });
            });
        }
    } catch (error) {
        console.error("Erro ao buscar usuários pendentes:", error);
        document.getElementById('pending-users-list').innerHTML = '<p style="color: red;">Erro ao carregar a lista de usuários.</p>';
    }

    // 3. Carrega e exibe as matérias cadastradas (nova lógica)
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
                    <li style="margin-bottom: 10px;">
                        <span>${materia.ordem}. ${materia.nome}</span>
                        <!-- Futuramente, aqui entrarão os botões de ação -->
                    </li>
                `;
            });
            materiasHtml += '</ul>';
            materiasList.innerHTML = materiasHtml;
        }
    } catch (error) {
        console.error("Erro ao buscar matérias:", error);
        document.getElementById('materias-list').innerHTML = '<p style="color: red;">Erro ao carregar as matérias.</p>';
    }
};
