/**
 * Módulo de Serviço de API
 * Gerencia todas as chamadas HTTP (GET, POST, PUT, DELETE) 
 * com o json-server usando o banco `database.json`.
 */

const BASE_URL = 'http://localhost:3000';
let isServerAlertShown = false; // Evita disparar múltiplos alertas em requisições simultâneas

/**
 * Função genérica para realizar requisições HTTP na aplicação.
 * 
 * @param {string} endpoint - O caminho da rota (ex: '/produtos', 'estoque')
 * @param {string} method - Método HTTP ('GET', 'POST', 'PUT', 'DELETE')
 * @param {Object|null} body - Dados a serem enviados no corpo da requisição
 * @returns {Promise<any>} Dados retornados do servidor em JSON
 */
export async function apiRequest(endpoint, method = 'GET', body = null) {
    // Garante que o endpoint comece com '/'
    const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    const options = {
        method: method.toUpperCase(),
        headers: {
            'Content-Type': 'application/json',
        },
    };

    // Adiciona o corpo tratado em JSON apenas se houver dados
    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${BASE_URL}${formattedEndpoint}`, options);

        // Trata respostas com erro do servidor (ex: 404, 500)
        if (!response.ok) {
            throw new Error(`Erro na requisição (${response.status}): ${response.statusText}`);
        }

        // Requisições DELETE ou status 204 (No Content) não têm corpo JSON
        if (options.method === 'DELETE' || response.status === 204) {
            return true;
        }

        return await response.json();
    } catch (error) {
        console.error(`[API Error] ${options.method} ${formattedEndpoint}:`, error);

        // Mensagem amigável caso o json-server esteja offline
        if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
            if (!isServerAlertShown) {
                isServerAlertShown = true;
                alert('Servidor indisponível!\n\nCertifique-se de iniciar o servidor no terminal com o comando:\nnpm start');

                // Reseta a trava após 5 segundos para permitir novos alertas se necessário
                setTimeout(() => { isServerAlertShown = false; }, 5000);
            }
        }

        throw error;
    }
}