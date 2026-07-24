import { apiRequest } from './api-service.js';

/**
 * Calcula o status do produto com base na quantidade em estoque
 * @param {number} quantidade 
 * @returns {'Disponível' | 'Estoque baixo' | 'Indisponível'}
 */
export function calcularStatus(quantidade) {
    const qtd = Number(quantidade) || 0;
    if (qtd > 5) return 'Disponível';
    if (qtd >= 1) return 'Estoque baixo';
    return 'Indisponível';
}

/**
 * Busca todos os produtos cadastrados
 */
export async function getProdutos() {
    return await apiRequest('/produtos');
}

/**
 * Busca um produto específico pelo ID
 * @param {string} id 
 */
export async function getProdutoById(id) {
    return await apiRequest(`/produtos/${id}`);
}

/**
 * Cadastra um novo produto
 * @param {Object} produtoData 
 */
export async function createProduto(produtoData) {
    const payload = {
        ...produtoData,
        preco: Number(produtoData.preco) || 0,
        status: produtoData.status || 'Indisponível'
    };
    return await apiRequest('/produtos', 'POST', payload);
}

/**
 * Atualiza completamente um produto existente
 * @param {string} id 
 * @param {Object} produtoData 
 */
export async function updateProduto(id, produtoData) {
    const payload = {
        ...produtoData,
        preco: Number(produtoData.preco) || 0
    };
    return await apiRequest(`/produtos/${id}`, 'PUT', payload);
}

/**
 * Atualiza apenas o status de um produto (ex: disparado pelo módulo de Estoque)
 * @param {string} id 
 * @param {string} novoStatus 
 */
export async function updateProdutoStatus(id, novoStatus) {
    return await apiRequest(`/produtos/${id}`, 'PATCH', { status: novoStatus });
}

/**
 * Remove um produto pelo ID
 * @param {string} id 
 */
export async function deleteProduto(id) {
    return await apiRequest(`/produtos/${id}`, 'DELETE');
}