/**
 * Exibe mensagens de feedback visual (Toast) na interface
 * @param {string} message - Texto da mensagem
 * @param {'success' | 'error' | 'warning'} type - Tipo da mensagem para estilização
 */
export function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');

    // 1. Cria o container base se ainda não existir na DOM
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.setAttribute('aria-live', 'polite');
        container.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 12px;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }

    // 2. Mapeamento de cores baseado no tipo
    const colors = {
        success: '#10b981', // Verde
        error: '#ef4444',   // Vermelho
        warning: '#f59e0b'  // Amarelo/Laranja
    };

    const bgColor = colors[type] || colors.success;

    // 3. Criação do elemento Toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'status');
    toast.style.cssText = `
        background-color: ${bgColor};
        color: #ffffff;
        padding: 12px 20px;
        border-radius: 8px;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 0.9rem;
        font-weight: 500;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
        opacity: 0;
        transform: translateY(10px);
        transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        pointer-events: auto;
        word-break: break-word;
    `;
    toast.innerText = message;

    container.appendChild(toast);

    // 4. Animação de entrada no próximo ciclo de renderização
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    });

    // 5. Animação de saída e remoção da DOM após 3.5s
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';

        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3500);
}