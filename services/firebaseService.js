// ====================================================================
// MÓDULO CENTRAL DE SERVIÇO DO FIREBASE
// ====================================================================
// Ponto único de inicialização do Firebase para toda a aplicação.
// Garante que a inicialização ocorra antes de qualquer outra chamada.
// ====================================================================

// Importa a configuração do Firebase
import { firebaseConfig } from '../firebase-config.js';

// 1. Inicializa o Firebase App
const app = firebase.initializeApp(firebaseConfig);

// 2. Obtém as referências para os serviços
const auth = firebase.auth();
const db = firebase.firestore();

// 3. Exporta as instâncias para serem usadas em outros módulos
export { app, auth, db };
