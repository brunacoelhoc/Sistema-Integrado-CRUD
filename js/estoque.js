import { getEstoque, updateEstoqueQuantidade } from './services/estoque-service.js';
import { getProdutos } from './services/produto-service.js';
import { showToast } from './components/toast.js';
import { getTableSkeleton } from './components/skeleton-loader.js';

const tbody = document.getElementById('tb-estoque');
const modal = document.getElementById('modal-estoque');
const form = document.getElementById('form-estoque');

async function carregarEstoque() {
    tbody.innerHTML = getTableSkeleton(4, 6);
    try {
        const [estoqueLista, produtosLista] = await Promise.all([getEstoque(), getProdutos()]);

        // Mapeia o nome e status atual do produto para exibição
        const produtosMap = new Map(produtosLista.map(p => [p.id, p]));

        renderTabela(estoqueLista, produtosMap);
    } catch (err) {
        showToast(err.message, 'error');
    }
}

function renderTabela(estoqueLista, produtosMap) {
    if (estoqueLista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center">Nenhum item em estoque.</td></tr>`;
        return;
    }

    tbody.innerHTML = estoqueLista.map(e => {
        const prod = produtosMap.get(e.produtoId) || { nome: 'Desconhecido', status: 'N/A' };
        const dataFmt = e.atualizadoEm ? new Date(e.atualizadoEm).toLocaleString('pt-BR') : '-';

        let badgeClass = 'badge-disponivel';
        if (prod.status === 'Estoque baixo') badgeClass = 'badge-baixo';
        if (prod.status === 'Indisponível') badgeClass = 'badge-indisponivel';

        return `
      <tr>
        <td><code>${e.produtoId}</code></td>
        <td><strong>${prod.nome}</strong></td>
        <td><strong>${e.quantidade}</strong> unid.</td>
        <td><span class="badge ${badgeClass}">${prod.status}</span></td>
        <td>${dataFmt}</td>
        <td>
          <button class="btn btn-secondary btn-edit-est" data-prodid="${e.produtoId}" data-nome="${prod.nome}" data-qtd="${e.quantidade}">
            Ajustar Quantidade
          </button>
        </td>
      </tr>
    `;
    }).join('');
}

tbody.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-edit-est');
    if (btn) {
        document.getElementById('estoque-produto-id').value = btn.dataset.prodid;
        document.getElementById('estoque-produto-nome').value = btn.dataset.nome;
        document.getElementById('quantidade').value = btn.dataset.qtd;
        modal.classList.add('open');
    }
});

document.getElementById('btn-cancelar-est').addEventListener('click', () => {
    modal.classList.remove('open');
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const prodId = document.getElementById('estoque-produto-id').value;
    const novaQtd = parseInt(document.getElementById('quantidade').value, 10);

    try {
        await updateEstoqueQuantidade(prodId, novaQtd);
        showToast('Estoque e Status do Produto atualizados!');
        modal.classList.remove('open');
        carregarEstoque();
    } catch (err) {
        showToast(err.message, 'error');
    }
});

carregarEstoque();