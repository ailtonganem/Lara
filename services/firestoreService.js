// ====================================================================
// MÓDULO DE SERVIÇO DO FIRESTORE
// ====================================================================
// Responsável por toda a comunicação com o banco de dados Firestore
// do ponto de vista do aluno (leitura de conteúdo).
// ====================================================================

const db = firebase.firestore();

/**
 * Busca todas as matérias cadastradas no banco de dados.
 * @returns {Promise<Array>} Uma promessa que resolve para um array de objetos de matérias.
 */
export const getMaterias = async () => {
    try {
        const querySnapshot = await db.collection('materias').orderBy('ordem').get();
        if (querySnapshot.empty) {
            return [];
        }
        // Mapeia os documentos para incluir o ID e os dados de cada matéria
        const materias = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        return materias;
    } catch (error) {
        console.error("Erro ao buscar matérias:", error);
        // Retorna um array vazio em caso de erro para não quebrar a interface
        return [];
    }
};

/**
 * Busca todos os módulos de uma matéria específica.
 * @param {string} materiaId O ID da matéria da qual buscar os módulos.
 * @returns {Promise<Array>} Uma promessa que resolve para um array de objetos de módulos.
 */
export const getModulos = async (materiaId) => {
    try {
        const querySnapshot = await db.collection('materias').doc(materiaId).collection('modulos').orderBy('ordem').get();
        if (querySnapshot.empty) {
            return [];
        }
        // Mapeia os documentos para incluir o ID e os dados de cada módulo
        const modulos = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        return modulos;
    } catch (error) {
        console.error("Erro ao buscar módulos:", error);
        return [];
    }
};

/**
 * Busca todas as atividades de um módulo específico.
 * @param {string} materiaId O ID da matéria pai.
 * @param {string} moduleId O ID do módulo pai.
 * @returns {Promise<Array>} Uma promessa que resolve para um array de objetos de atividades.
 */
export const getAtividades = async (materiaId, moduleId) => {
    try {
        const querySnapshot = await db.collection('materias').doc(materiaId).collection('modulos').doc(moduleId).collection('atividades').orderBy('ordem').get();
        if (querySnapshot.empty) {
            return [];
        }
        // Mapeia os documentos para incluir o ID e os dados de cada atividade
        const atividades = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        return atividades;
    } catch (error) {
        console.error("Erro ao buscar atividades:", error);
        return [];
    }
};
