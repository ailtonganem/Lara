// ====================================================================
// ARQUIVO PRINCIPAL DA APLICAÇÃO (ROTEADOR)
// ====================================================================
// Responsável por inicializar o Firebase e controlar qual tela
// (componente) é exibida com base no estado de autenticação do usuário.
// ====================================================================

// --------------------------------------------------------------------
//  1. IMPORTAÇÕES E INICIALIZAÇÃO
// --------------------------------------------------------------------

// Importa a configuração do Firebase de um arquivo separado e seguro.
import { firebaseConfig } from './firebase-config.js';

// Importa os componentes de tela
import { renderLoginScreen } from './components/LoginScreen.js';
import { renderWaitingForApprovalScreen } from './components/WaitingScreen.js';
import { renderDashboard } from './components/Dashboard.js';
import { renderAdminDashboard } from './components/AdminDashboard.js';

// Inicializa o Firebase com as configurações importadas.
firebase.initializeApp(firebaseConfig);

// Obtém as referências para os serviços do Firebase.
const auth = firebase.auth();
const db = firebase.firestore();


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
