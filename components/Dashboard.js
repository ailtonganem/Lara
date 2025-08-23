// ====================================================================
// COMPONENTE: DASHBOARD DO ALUNO
// ====================================================================
// Responsável por renderizar a tela principal para um usuário
// logado e aprovado, listando as matérias disponíveis.
// ====================================================================

// Importa a função de logout do serviço de autenticação
import { handleLogout } from '../services/authService.js';
// Importa a função para buscar as matérias do Firestore
import { getMaterias } from '../services/firestoreService.js';

// Referência para o container principal da nossa aplicação no HTML
const appContainer = document.getElementById('app');

/**
 * Renderiza o Dashboard principal, que agora é a tela de seleção de matérias.
 * @param {object} user - O objeto do usuário vindo do Firebase Auth.
 */
export const renderDashboard = async (user) => {
    // 1. Renderiza o esqueleto da página
    appContainer.innerHTML = `
        <h1>Olá, ${user.email}!</h1>
        <p>Escolha uma matéria para começar a sua jornada de conhecimento.</p>
        <div id="materias-container">Carregando matérias...</div>
        <br>
        <button id="logout-button">Sair</button>
    `;
    document.getElementById('logout-button').addEventListener('click', handleLogout);

    // 2. Busca as matérias usando o firestoreService
    const materias = await getMaterias();
    const materiasContainer = document.getElementById('materias-container');

    // 3. Verifica se há matérias e renderiza o conteúdo
    if (materias.length === 0) {
        materiasContainer.innerHTML = '<p>Ainda não há matérias disponíveis. Volte em breve!</p>';
        return;
    }

    let materiasHtml = '<div class="materias-grid">';
    materias.forEach(materia => {
        materiasHtml += `
            <div class="materia-card" data-id="${materia.id}">
                <h3>${materia.nome}</h3>
                <p>${materia.descricao}</p>
            </div>
        `;
    });
    materiasHtml += '</div>';

    materiasContainer.innerHTML = materiasHtml;

    // 4. Adiciona eventos de clique aos cards (serão usados no próximo passo)
    document.querySelectorAll('.materia-card').forEach(card => {
        card.addEventListener('click', (event) => {
            const materiaId = event.currentTarget.dataset.id;
            // Ação futura: Chamar a tela de módulos para esta matéria
            alert(`Você clicou na matéria com ID: ${materiaId}. A próxima tela será implementada a seguir.`);
        });
    });
};
