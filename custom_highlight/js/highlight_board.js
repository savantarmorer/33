// Quando o documento estiver completamente carregado e pronto
document.addEventListener('DOMContentLoaded', function() {
    
    // Encontra o botão "Ver Destaques" na página usando o ID
    var showButton = document.getElementById('open-highlight-popup');
    
    // Encontra o bloco onde os destaques serão exibidos, usando o ID
    var highlightBlock = document.getElementById('highlight-board');

    // Adiciona um evento de clique ao botão "Ver Destaques"
    showButton.addEventListener('click', function() {
        // Verifica se o bloco de destaques está escondido
        if (highlightBlock.style.display === 'none') {
            // Se estiver escondido, mostra o bloco
            highlightBlock.style.display = 'block';
        } else {
            // Se já estiver visível, esconde o bloco
            highlightBlock.style.display = 'none';
        }
    });
    
    document.addEventListener('DOMContentLoaded', function() {
    var toggleButton = document.getElementById('toggle-blocks-visibility');
    var blocksColumn = document.querySelectorAll('#page-top-blocks [data-region="blocks-column"], #page-bottom-blocks [data-region="blocks-column"]');

    toggleButton.addEventListener('click', function() {
        blocksColumn.forEach(function(column) {
            if (column.style.display === 'none') {
                column.style.display = 'block';
            } else {
                column.style.display = 'none';
            }
        });
    });
});

    // Define a função principal do quadro de destaques
    const HighlightBoard = function() {
        // Usa o React para gerenciar um estado com os destaques
        const [highlight, setHighlight] = React.useState([]);

        // Executa essa função quando o componente é carregado pela primeira vez
        React.useEffect(function() {
            console.log("Tentando buscar os destaques...");
            
            // Faz uma requisição para buscar os destaques
            fetch("/blocks/custom_highlight/get-highlights.php", { redirect: 'manual' })
                .then(function(response) {
                    // Se a resposta for um redirecionamento, exibe um erro
                    if (response.type === 'opaqueredirect') {
                        console.error("Redirecionamento detectado. Verifique a URL ou as permissões.");
                        return;
                    }
                    console.log("Status da resposta:", response.status);
                    return response.json(); // Converte a resposta em JSON
                })
                .then(function(data) {
                    console.log("Dados recebidos:", data);
                    // Verifica se os dados recebidos são um array (lista)
                    if (Array.isArray(data)) {
                        // Atualiza o estado com os destaques recebidos
                        setHighlight(data);
                    } else {
                        console.error('Dados inválidos recebidos:', data);
                        setHighlight([]); // Se os dados não forem válidos, define como uma lista vazia
                    }
                })
                .catch(function(error) {
                    // Exibe um erro se a requisição falhar
                    console.error('Erro ao carregar os destaques:', error);
                });
        }, []);

        // Função que trata a seleção de texto pelo usuário
        const handleTextSelection = function() {
            // Obtém o texto selecionado pelo usuário
            const selectedText = window.getSelection().toString().trim();
            if (selectedText.length > 0) {
                console.log("Texto selecionado:", selectedText);
                // Pergunta ao usuário se ele deseja destacar o texto
                const confirmHighlight = window.confirm("Você deseja destacar o texto selecionado?");
                if (confirmHighlight) {
                    console.log("Texto confirmado para destaque");
                    saveHighlight(selectedText); // Salva o destaque
                } else {
                    console.log("Texto não confirmado para destaque");
                }
            }
        };

        // Função para salvar o texto destacado
        const saveHighlight = function(text) {
            console.log("Tentando salvar o destaque:", text);
            
            fetch('/blocks/custom_highlight/save-highlight.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    'text': text, // O texto a ser salvo
                    'page': window.location.href // A URL da página onde o texto foi destacado
                }),
                redirect: 'manual'
            })
            .then(function(response) {
                if (response.type === 'opaqueredirect') {
                    console.error("Redirecionamento detectado. Verifique a URL ou as permissões.");
                    return;
                }
                console.log("Status da resposta ao salvar:", response.status);
                return response.json(); // Converte a resposta em JSON
            })
            .then(function(data) {
                console.log("Dados retornados ao salvar:", data);
                if (data.status === 'success') {
                    console.log('Destaque salvo com sucesso');
                    // Adiciona o novo destaque à lista de destaques
                    setHighlight(function(prev) {
                        return [...prev, {text: text, timestamp: Date.now() / 1000}];
                    });
                } else {
                    console.error('Erro ao salvar destaque:', data.error);
                }
            })
            .catch(function(error) {
                // Exibe um erro se a requisição falhar
                console.error('Erro ao enviar destaque:', error);
            });
        };

        // Adiciona o evento para detectar a seleção de texto pelo usuário
        React.useEffect(function() {
            document.addEventListener('mouseup', handleTextSelection);
            // Remove o evento ao sair da página para evitar erros
            return function cleanup() {
                document.removeEventListener('mouseup', handleTextSelection);
            };
        }, []);

        // Retorna o componente React que será exibido
        return (
            React.createElement('div', {
                className: 'highlight-board'
            }, 
                React.createElement('h2', null, 'Seus Grifos'), // Título do quadro de destaques
                React.createElement('div', { className: 'highlight-container' },
                    // Mapeia cada destaque para um elemento na lista
                    highlight.map(function(highlight, index) {
                        return React.createElement('div', { key: index, className: 'highlight-item' },
                            React.createElement('p', null, highlight.text), // Exibe o texto destacado
                            React.createElement('span', null, new Date(highlight.timestamp * 1000).toLocaleString()) // Exibe a data e hora do destaque
                        );
                    })
                )
            )
        );
    };

    // Encontra o elemento DOM onde o componente React será renderizado
    const domContainer = document.querySelector("#highlight-board");
    if (domContainer) {
        console.log("Container encontrado, renderizando o HighlightBoard...");
        ReactDOM.render(React.createElement(HighlightBoard), domContainer); // Renderiza o componente React
    } else {
        console.error("Nenhum container encontrado para renderizar o HighlightBoard.");
    }
});
