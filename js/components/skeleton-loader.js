/**
 * Gera marcações HTML de Skeleton Loader para tabelas
 * @param {number} rows 
 * @param {number} cols 
 * @returns {string}
 */
export function getTableSkeleton(rows = 3, cols = 4) {
    let html = '';
    for (let i = 0; i < rows; i++) {
        html += '<tr>';
        for (let j = 0; j < cols; j++) {
            html += `
        <td>
          <div style="height: 20px; background: rgba(255,255,255,0.1); border-radius: 4px; animation: pulse 1.5s infinite ease-in-out;"></div>
        </td>`;
        }
        html += '</tr>';
    }
    return html;
}

// Injeta chave de animação para o efeito pulse
const style = document.createElement('style');
style.innerHTML = `
  @keyframes pulse {
    0% { opacity: 0.3; }
    50% { opacity: 0.7; }
    100% { opacity: 0.3; }
  }
`;
document.head.appendChild(style);