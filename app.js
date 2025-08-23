// ====================================================================
// ARQUIVO PRINCIPAL DA APLICAÇÃO (ROTEADOR)
// ====================================================================
// Responsável por inicializar o Firebase e controlar qual tela
// (componente) é exibida com base no estado de autenticação do usuário.
// ====================================================================

// --------------------------------------------------------------------
//  1. IMPORTAÇÕES E INICIALIZAÇÃO
// --------------------------------------------------------------------

// IMPORTANTE: Importa os serviços do Firebase primeiro para garantir a inicialização.
// Este arquivo agora é o ponto central que inicializa o app e exporta as instâncias.
import { auth, db } from './services/firebaseService.js';

// Importa os componentes de tela
import { renderLoginScreen } from './components/LoginScreen.js';
import { renderWaitingForApprovalScreen } from './components/WaitingScreen.js';
import { renderDashboard } from './components/Dashboard.js';
import { renderAdminDashboard } from './components/AdminDashboard.js';


// --------------------------------------------------------------------
//  2. CONTROLE PRINCIPAL DA APLICAÇÃO (ROTEADOR)
// --------------------------------------------------------------------

/**
 * Observador do estado de autenticação.
 * Este é o ponto de entrada que decide qual tela mostrar.
 */
auth.onAuthStateChanged(async (user) => {
    if (user) {
        // Usuário está logado. Vamos verificar seu status no Firestore.
        const userDocRef = db.collection('users').doc(user.uid);
        const userDoc = await userDocRef.get();

        if (userDoc.exists) {
            const userData = userDoc.data();
            
            // Verifica se o perfil é de administrador
            if (userData.perfil === 'administrador') {
                renderAdminDashboard();
            } else {
                // Lógica para o perfil de aluno
                if (userData.aprovado) {
                    renderDashboard(user);
                } else {
                    renderWaitingForApprovalScreen();
                }
            }
        } else {
            // Caso raro: usuário autenticado mas sem documento no Firestore.
            // Isso pode acontecer se o cadastro for feito mas a criação do doc falhar.
            console.warn("Usuário autenticado sem documento no Firestore. Exibindo tela de espera.");
            renderWaitingForApprovalScreen();
        }
    } else {
        // Usuário não está logado. Renderiza a tela de login.
        renderLoginScreen();
    }
});
