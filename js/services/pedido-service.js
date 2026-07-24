import { apiRequest } from './api-service.js';
import { getEstoqueByProdutoId, updateEstoqueQuantidade } from './estoque-service.js';

/**
 * Busca todos os pedidos cadastrados
 */
export async function getPedidos() {
    return await apiRequest('/pedidos');
}

/**
 * Busca um pedido específico pelo ID
 * @param {string} id 
 */
export async function getPedidoById(id) {
    return await apiRequest(`/pedidos/${id}`);
}

/**
 * Cria um pedido, abate os itens do estoque e reavalia o status dos produtos
 * @param {Object} pedidoData - Estrutura do pedido com cliente e array de itens
 */
export async function createPedido(pedidoData) {
    if (!pedidoData.itens || pedidoData.itens.length === 0) {
        throw new Error('O pedido precisa conter pelo menos um item.');
    }

    // 1. Valida se há estoque suficiente para TODOS os itens antes de processar
    for (const item of pedidoData.itens) {
        const estoque = await getEstoqueByProdutoId(item.produtoId);
        const qtdAtual = estoque ? Number(estoque.quantidade) : 0;

        if (qtdAtual < item.quantidade) {
            throw new Error(`Estoque insuficiente para o produto ID: ${item.produtoId}. Restam apenas ${qtdAtual} unidades.`);
        }
    }

    // 2. Abate do estoque
    for (const item of pedidoData.itens) {
        const estoque = await getEstoqueByProdutoId(item.produtoId);
        const novaQtd = Number(estoque.quantidade) - Number(item.quantidade);
        await updateEstoqueQuantidade(item.produtoId, novaQtd);
    }

    // 3. Calcula o total caso não tenha sido enviado
    const totalCalculado = pedidoData.itens.reduce((acc, item) => {
        return acc + (Number(item.quantidade) * Number(item.precoUnitario || 0));
    }, 0);

    // 4. Salva o pedido
    return await apiRequest('/pedidos', 'POST', {
        ...pedidoData,
        total: pedidoData.total ? Number(pedidoData.total) : totalCalculado,
        data: new Date().toISOString(),
        status: pedidoData.status || 'Concluído'
    });
}

/**
 * Cancela um pedido e devolve as quantidades ao estoque
 * @param {string} pedidoId 
 */
export async function cancelarPedido(pedidoId) {
    const pedido = await getPedidoById(pedidoId);

    if (pedido.status && pedido.status.startsWith('Cancelado')) {
        throw new Error('Este pedido já se encontra cancelado.');
    }

    // 1. Devolve itens ao estoque
    for (const item of pedido.itens) {
        const estoque = await getEstoqueByProdutoId(item.produtoId);
        const qtdAtual = estoque ? Number(estoque.quantidade) : 0;
        await updateEstoqueQuantidade(item.produtoId, qtdAtual + Number(item.quantidade));
    }

    // 2. Atualiza status do pedido
    return await apiRequest(`/pedidos/${pedidoId}`, 'PATCH', { status: 'Cancelado' });
}