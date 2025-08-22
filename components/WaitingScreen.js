// ====================================================================
// COMPONENTE: TELA DE AGUARDANDO APROVAÇÃO
// ====================================================================
// Responsável por renderizar a interface para usuários pendentes.
// ====================================================================

// Importa a função de logout do serviço de autenticação
import { handleLogout } from '../services/authService.js';

// Referência para o container principal da nossa aplicação no HTML
const appContainer = document.getElementById('app');

/**
 * Renderiza a tela de "Aguardando Aprovação" no container principal.
 */
export const renderWaitingForApprovalScreen = () => {
    appContainer.innerHTML = `
        <h1>Cadastro Recebido!</h1>
        <p>Seu acesso está pendente de aprovação pelo administrador.</p>
        <p>Por favor, aguarde. Você será notificado ou poderá tentar o acesso mais tarde.</p>
        <button id="logout-button">Sair</button>
    `;

    // Adiciona o evento ao botão de logout
    document.getElementById('logout-button').addEventListener('click', handleLogout);
};
