// ====================================================================
// COMPONENTE: TELA DE LOGIN
// ====================================================================
// Responsável por renderizar a interface de login/registro e
// conectar os eventos dos botões aos serviços de autenticação.
// ====================================================================

// Importa as funções de lógica do serviço de autenticação
import { handleLogin, handleRegister } from '../services/authService.js';

// Referência para o container principal da nossa aplicação no HTML
const appContainer = document.getElementById('app');

/**
 * Renderiza a tela de Login e Registro no container principal da aplicação.
 */
export const renderLoginScreen = () => {
    appContainer.innerHTML = `
        <h1>Bem-vindo!</h1>
        <p>Acesse sua conta ou crie um novo cadastro para começar a aprender.</p>
        
        <div id="auth-form">
            <input type="email" id="email" placeholder="Seu e-mail" required>
            <input type="password" id="password" placeholder="Sua senha" required>
            <p id="error-message" style="color: red;"></p>
            <button id="login-button">Entrar</button>
            <button id="register-button">Cadastrar</button>
        </div>
    `;

    // Adiciona os eventos aos botões, utilizando as funções importadas do authService
    document.getElementById('login-button').addEventListener('click', handleLogin);
    document.getElementById('register-button').addEventListener('click', handleRegister);
};
