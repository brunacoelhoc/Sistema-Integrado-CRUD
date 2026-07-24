import { apiRequest } from './api-service.js';
import { getEstoqueByProdutoId, updateEstoqueQuantidade } from './estoque-service.js';

export async function getPedidos() {
    return await apiRequest('/pedidos');
}

/**
 * Cria um pedido, abate os itens do estoque e reavalia o status dos produtos
 */
export async function createPedido(pedidoData) {
    // 1. Valida se há estoque suficiente para TODOS os itens antes de processar
    for (const item of pedidoData.itens) {
        const estoque = await getEstoqueByProdutoId(item.produtoId);
        const qtdAtual = estoque ? estoque.quantidade : 0;

        if (qtdAtual < item.quantidade) {
            throw new Error(`Estoque insuficiente para o produto ID: ${item.produtoId}`);
        }
    }

    // 2. Abate do estoque
    for (const item of pedidoData.itens) {
        const estoque = await getEstoqueByProdutoId(item.produtoId);
        const novaQtd = estoque.quantidade - item.quantidade;
        await updateEstoqueQuantidade(item.produtoId, novaQtd);
    }

    // 3. Salva o pedido
    return await apiRequest('/pedidos', 'POST', {
        ...pedidoData,
        data: new Date().toISOString(),
        status: 'Concluído'
    });
}

/**
 * Cancela um pedido e devolve as quantidades ao estoque
 */
export async function cancelarPedido(pedidoId) {
    const pedido = await apiRequest(`/pedidos/${pedidoId}`);

    if (pedido.status === 'Cancelado') {
        throw new Error('Este pedido já está cancelado.');
    }

    // Devolve itens ao estoque
    for (const item of pedido.itens) {
        const estoque = await getEstoqueByProdutoId(item.produtoId);
        const qtdAtual = estoque ? estoque.quantidade : 0;
        await updateEstoqueQuantidade(item.produtoId, qtdAtual + item.quantidade);
    }

    // Atualiza status do pedido
    return await apiRequest(`/pedidos/${pedidoId}`, 'PATCH', { status: 'Cancelado' });
}