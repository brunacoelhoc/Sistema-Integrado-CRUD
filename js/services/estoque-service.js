import { apiRequest } from './api-service.js';
import { calcularStatus, updateProdutoStatus } from './produto-service.js';

/**
 * Busca todos os registros de estoque
 */
export async function getEstoque() {
    return await apiRequest('/estoque');
}

/**
 * Busca o item de estoque correspondente a um determinado produto
 * @param {string} produtoId 
 */
export async function getEstoqueByProdutoId(produtoId) {
    const itens = await apiRequest(`/estoque?produtoId=${produtoId}`);
    return Array.isArray(itens) && itens.length > 0 ? itens[0] : null;
}

/**
 * Atualiza ou cria o registro de estoque e sincroniza o status do produto
 * @param {string} produtoId 
 * @param {number} novaQuantidade 
 */
export async function updateEstoqueQuantidade(produtoId, novaQuantidade) {
    // Garante valor numérico e não negativo
    const quantidadeSanitizada = Math.max(0, Number(novaQuantidade) || 0);
    const itemEstoque = await getEstoqueByProdutoId(produtoId);
    const dataAtual = new Date().toISOString();
    let result;

    if (itemEstoque) {
        result = await apiRequest(`/estoque/${itemEstoque.id}`, 'PATCH', {
            quantidade: quantidadeSanitizada,
            atualizadoEm: dataAtual
        });
    } else {
        result = await apiRequest('/estoque', 'POST', {
            produtoId,
            quantidade: quantidadeSanitizada,
            atualizadoEm: dataAtual
        });
    }

    // REGRA DE NEGÓCIO: Recalcula e atualiza o status do produto automaticamente
    const novoStatus = calcularStatus(quantidadeSanitizada);
    await updateProdutoStatus(produtoId, novoStatus);

    return result;
}

/**
 * Dá baixa no estoque de um produto (ex: ao processar um novo pedido)
 * @param {string} produtoId 
 * @param {number} quantidadeAbatida 
 */
export async function darBaixaEstoque(produtoId, quantidadeAbatida) {
    const itemEstoque = await getEstoqueByProdutoId(produtoId);
    const quantidadeAtual = itemEstoque ? Number(itemEstoque.quantidade) : 0;
    const novaQtd = Math.max(0, quantidadeAtual - Number(quantidadeAbatida));

    return await updateEstoqueQuantidade(produtoId, novaQtd);
}

/**
 * Remove um registro de estoque pelo ID
 * @param {string} id 
 */
export async function deleteEstoque(id) {
    return await apiRequest(`/estoque/${id}`, 'DELETE');
}