import { apiRequest } from './api-service.js';
import { calcularStatus, updateProdutoStatus } from './produto-service.js';

export async function getEstoque() {
    return await apiRequest('/estoque');
}

export async function getEstoqueByProdutoId(produtoId) {
    const itens = await apiRequest(`/estoque?produtoId=${produtoId}`);
    return itens[0] || null;
}

/**
 * Atualiza ou cria o registro de estoque e sincroniza o status do produto
 */
export async function updateEstoqueQuantidade(produtoId, novaQuantidade) {
    const itemEstoque = await getEstoqueByProdutoId(produtoId);
    const dataAtual = new Date().toISOString();
    let result;

    if (itemEstoque) {
        result = await apiRequest(`/estoque/${itemEstoque.id}`, 'PATCH', {
            quantidade: novaQuantidade,
            atualizadoEm: dataAtual
        });
    } else {
        result = await apiRequest('/estoque', 'POST', {
            produtoId,
            quantidade: novaQuantidade,
            atualizadoEm: dataAtual
        });
    }

    // REGRAS DE NEGÓCIO: Recalcula e atualiza o status do produto automaticamente
    const novoStatus = calcularStatus(novaQuantidade);
    await updateProdutoStatus(produtoId, novoStatus);

    return result;
}

export async function deleteEstoque(id) {
    return await apiRequest(`/estoque/${id}`, 'DELETE');
}