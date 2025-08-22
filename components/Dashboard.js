// ====================================================================
// COMPONENTE: DASHBOARD DO ALUNO
// ====================================================================
// Responsável por renderizar a tela principal para um usuário
// logado e aprovado.
// ====================================================================

// Importa a função de logout do serviço de autenticação
import { handleLogout } from '../services/authService.js';

// Referência para o container principal da nossa aplicação no HTML
const appContainer = document.getElementById('app');

/**
 * Renderiza o Dashboard principal para um usuário logado e aprovado.
 * @param {object} user - O objeto do usuário vindo do Firebase Auth.
 */
export const renderDashboard = (user) => {
    appContainer.innerHTML = `
        <h1>Olá, ${user.email}!</h1>
        <p>Bem-vindo(a) à plataforma de aprendizagem!</p>
        <p>Aqui você começará sua jornada de conhecimento.</p>
        <!-- Futuramente, aqui entrarão os módulos do jogo -->
        <button id="logout-button">Sair</button>
    `;

    // Adiciona o evento ao botão de logout
    document.getElementById('logout-button').addEventListener('click', handleLogout);
};
