// ====================================================================
// COMPONENTE: PAINEL DO ADMINISTRADOR
// ====================================================================
// Responsável por renderizar a interface do administrador, buscar
// usuários pendentes e permitir sua aprovação.
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
 * Renderiza o Painel do Administrador com a lista de usuários pendentes.
 */
export const renderAdminDashboard = async () => {
    appContainer.innerHTML = `
        <h1>Painel do Administrador</h1>
        <h2>Usuários Pendentes de Aprovação</h2>
        <div id="pending-users-list">Carregando usuários...</div>
        <br>
        <button id="logout-button">Sair</button>
    `;
    document.getElementById('logout-button').addEventListener('click', handleLogout);

    // Busca usuários com 'aprovado == false' no Firestore
    try {
        const querySnapshot = await db.collection('users').where('aprovado', '==', false).get();
        const pendingUsersList = document.getElementById('pending-users-list');

        if (querySnapshot.empty) {
            pendingUsersList.innerHTML = '<p>Nenhum usuário pendente no momento.</p>';
            return;
        }

        let usersHtml = '<ul>';
        querySnapshot.forEach(doc => {
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

        // Adiciona eventos para os botões de aprovação
        document.querySelectorAll('.approve-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const userId = event.target.dataset.id;
                approveUser(userId);
            });
        });

    } catch (error) {
        console.error("Erro ao buscar usuários pendentes:", error);
        document.getElementById('pending-users-list').innerHTML = '<p style="color: red;">Erro ao carregar a lista de usuários.</p>';
    }
};
