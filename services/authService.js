// ====================================================================
// MÓDULO DE SERVIÇO DE AUTENTICAÇÃO
// ====================================================================
// Responsável por toda a comunicação com o Firebase Authentication
// e a lógica de login, registro e logout.
// ====================================================================

// Obtém as referências para os serviços do Firebase
const auth = firebase.auth();
const db = firebase.firestore();

/**
 * Tenta realizar o login do usuário com e-mail e senha.
 */
export const handleLogin = () => {
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
export const handleRegister = () => {
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
            // Utiliza as regras de segurança do Firestore para garantir a integridade dos dados
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
export const handleLogout = () => {
    auth.signOut();
};
