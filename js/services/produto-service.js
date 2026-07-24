import { apiRequest } from './api-service.js';

/**
 * Calcula o status derivado com base na quantidade em estoque
 * @param {number} quantidade 
 * @returns {'Disponível' | 'Estoque baixo' | 'Indisponível'}
 */
export function calcularStatus(quantidade) {
    const qtd = Number(quantidade);
    if (qtd > 10) return 'Disponível';
    if (qtd >= 1) return 'Estoque baixo';
    return 'Indisponível';
}

export async function getProdutos() {
    return await apiRequest('/produtos');
}

export async function getProdutoById(id) {
    return await apiRequest(`/produtos/${id}`);
}

export async function createProduto(produtoData) {
    return await apiRequest('/produtos', 'POST', produtoData);
}

export async function updateProduto(id, produtoData) {
    return await apiRequest(`/produtos/${id}`, 'PUT', produtoData);
}

export async function updateProdutoStatus(id, novoStatus) {
    return await apiRequest(`/produtos/${id}`, 'PATCH', { status: novoStatus });
}

export async function deleteProduto(id) {
    return await apiRequest(`/produtos/${id}`, 'DELETE');
}