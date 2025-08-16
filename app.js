// --------------------------------------------------------------------
//  1. INICIALIZAÇÃO E REFERÊNCIAS
// --------------------------------------------------------------------

// Obtém as referências para os serviços do Firebase que já foram inicializados no index.html
const auth = firebase.auth();
const db = firebase.firestore();

// Referência para o container principal da nossa aplicação no HTML
const appContainer = document.getElementById('app');


// --------------------------------------------------------------------
//  2. FUNÇÕES DE RENDERIZAÇÃO DE TELAS (VIEWS)
// --------------------------------------------------------------------

/**
 * Renderiza a tela de Login e Registro.
 * Esta tela é exibida para usuários não autenticados.
 */
const renderLoginScreen = () => {
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

    // Adiciona os eventos aos botões após a renderização
    document.getElementById('login-button').addEventListener('click', handleLogin);
    document.getElementById('register-button').addEventListener('click', handleRegister);
};

/**
 * Renderiza a tela para usuários que se cadastraram mas aguardam aprovação.
 */
const renderWaitingForApprovalScreen = () => {
    appContainer.innerHTML = `
        <h1>Cadastro Recebido!</h1>
        <p>Seu acesso está pendente de aprovação pelo administrador.</p>
        <p>Por favor, aguarde. Você será notificado ou poderá tentar o acesso mais tarde.</p>
        <button id="logout-button">Sair</button>
    `;
    document.getElementById('logout-button').addEventListener('click', handleLogout);
};

/**
 * Renderiza o Dashboard principal para um usuário logado e aprovado.
 * @param {object} user - O objeto do usuário vindo do Firebase Auth.
 */
const renderDashboard = (user) => {
    appContainer.innerHTML = `
        <h1>Olá, ${user.email}!</h1>
        <p>Bem-vindo(a) à plataforma de aprendizagem!</p>
        <p>Aqui você começará sua jornada de conhecimento.</p>
        <!-- Futuramente, aqui entrarão os módulos do jogo -->
        <button id="logout-button">Sair</button>
    `;
    document.getElementById('logout-button').addEventListener('click', handleLogout);
};

/**
 * Renderiza o Painel do Administrador com a lista de usuários pendentes.
 */
const renderAdminDashboard = async () => {
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


// --------------------------------------------------------------------
//  3. FUNÇÕES DE LÓGICA (HANDLERS)
// --------------------------------------------------------------------

/**
 * Tenta realizar o login do usuário com e-mail e senha.
 */
const handleLogin = () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');

    if (!email || !password) {
        errorMessage.textContent = 'Por favor, preencha e-mail e senha.';
        return;
    }

    auth.signInWithEmailAndPassword(email, password)
        .catch(error => {
            errorMessage.textContent = 'E-mail ou senha inválidos.';
            console.error("Erro de Login:", error);
        });
};

/**
 * Cria um novo usuário e um documento correspondente no Firestore.
 */
const handleRegister = () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');

    if (!email || !password) {
        errorMessage.textContent = 'Por favor, preencha e-mail e senha para o cadastro.';
        return;
    }

    auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            const user = userCredential.user;
            db.collection('users').doc(user.uid).set({
                email: user.email,
                pontuacao: 0,
                perfil: 'aluno',
                aprovado: false,
                criadoEm: firebase.firestore.FieldValue.serverTimestamp()
            })
            .then(() => {
                console.log("Documento do usuário criado no Firestore!");
            })
            .catch(error => {
                console.error("Erro ao criar documento do usuário:", error);
            });
        })
        .catch(error => {
            if (error.code === 'auth/email-already-in-use') {
                errorMessage.textContent = 'Este e-mail já está em uso.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage.textContent = 'A senha deve ter no mínimo 6 caracteres.';
            } else {
                errorMessage.textContent = 'Ocorreu um erro ao registrar.';
            }
            console.error("Erro de Registro:", error);
        });
};

/**
 * Realiza o logout do usuário.
 */
const handleLogout = () => {
    auth.signOut();
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
            renderAdminDashboard(); // Re-renderiza o painel para atualizar a lista
        })
        .catch(error => {
            console.error("Erro ao aprovar usuário:", error);
            alert("Ocorreu um erro ao tentar aprovar o usuário.");
        });
};


// --------------------------------------------------------------------
//  4. CONTROLE PRINCIPAL DA APLICAÇÃO
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
            renderWaitingForApprovalScreen();
        }
    } else {
        // Usuário não está logado. Renderiza a tela de login.
        renderLoginScreen();
    }
});