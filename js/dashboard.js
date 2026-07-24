import { getProdutos } from './services/produto-service.js';
import { getEstoque } from './services/estoque-service.js';
import { getPedidos } from './services/pedido-service.js';
import { showToast } from './components/toast.js';

// Variável global para armazenar a instância do Chart.js e evitar sobreposição
let chartInstance = null;

// Inicializa efeito visual Vanta.js (Halo)
try {
    if (typeof VANTA !== 'undefined' && VANTA.HALO) {
        VANTA.HALO({
            el: "#vanta-bg",
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            baseColor: 0x0f172a,
            backgroundColor: 0x0a0e17,
            amplitudeFactor: 1.5
        });
    }
} catch (e) {
    console.warn('Efeito Vanta.js não pôde ser carregado offline.', e);
}

/**
 * Inicializa os dados da Dashboard chamando os serviços de forma concorrente
 */
async function inicializarDashboard() {
    try {
        // Busca dados dos 3 endpoints de forma paralela
        const [produtos, estoque, pedidos] = await Promise.all([
            getProdutos(),
            getEstoque(),
            getPedidos()
        ]);

        renderKPIs(produtos || [], pedidos || []);
        renderGrafico(produtos || [], estoque || []);
    } catch (err) {
        console.error('Erro ao inicializar Dashboard:', err);
        showToast('Não foi possível carregar os dados da Dashboard.', 'error');
    }
}

/**
 * Atualiza os cards de KPI na interface
 */
function renderKPIs(produtos, pedidos) {
    // KPI 1: Total de Produtos
    const totalProdutosEl = document.getElementById('kpi-total-produtos');
    if (totalProdutosEl) totalProdutosEl.innerText = produtos.length;

    // KPI 2: Produtos com Alerta (Estoque baixo ou Indisponível)
    const emAlerta = produtos.filter(p => p.status === 'Estoque baixo' || p.status === 'Indisponível').length;
    const alertaEl = document.getElementById('kpi-alerta-estoque');
    if (alertaEl) alertaEl.innerText = emAlerta;

    // KPI 3: Total de Pedidos Concluídos / Válidos
    const pedidosValidos = pedidos.filter(p => p.status && !p.status.startsWith('Cancelado'));
    const totalPedidosEl = document.getElementById('kpi-total-pedidos');
    if (totalPedidosEl) totalPedidosEl.innerText = pedidosValidos.length;

    // KPI 4: Faturamento Acumulado (Formatado para Moeda BRL)
    const faturamento = pedidosValidos.reduce((acc, p) => acc + (Number(p.total) || 0), 0);
    const faturamentoEl = document.getElementById('kpi-faturamento');
    if (faturamentoEl) {
        faturamentoEl.innerText = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(faturamento);
    }
}

/**
 * Monta e renderiza o gráfico de estoque agrupado por categoria de produto
 */
function renderGrafico(produtos, estoque) {
    const canvas = document.getElementById('chart-estoque-categoria');
    if (!canvas) return;

    const produtosMap = new Map(produtos.map(p => [p.id, p]));
    const categoriaQtdMap = {};

    // Agrupa a quantidade de itens em estoque por Categoria de Produto
    estoque.forEach(e => {
        const prod = produtosMap.get(e.produtoId);
        if (prod) {
            const cat = prod.categoria || 'Outros';
            categoriaQtdMap[cat] = (categoriaQtdMap[cat] || 0) + Number(e.quantidade || 0);
        }
    });

    const labels = Object.keys(categoriaQtdMap);
    const dataValues = Object.values(categoriaQtdMap);

    const ctx = canvas.getContext('2d');

    // Destrói gráfico anterior se já existir para prevenir bugs visuais de hover
    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Quantidade em Estoque',
                data: dataValues,
                backgroundColor: 'rgba(99, 102, 241, 0.6)',
                borderColor: '#6366f1',
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#f8fafc', font: { family: 'Segoe UI', size: 13 } }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' }
                },
                y: {
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    beginAtZero: true
                }
            }
        }
    });
}

// Executa a carga da Dashboard
inicializarDashboard();