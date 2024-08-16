<?php
header('Content-Type: application/json');
require_once('../../config.php');

try {
    global $DB, $USER;

    // Verifica se o usuário está logado
    if (!isloggedin() || isguestuser()) {
        throw new Exception('Usuário não logado ou é um usuário convidado');
    }

    // Obtém o ID do usuário logado
    $userid = $USER->id;

    // Captura os dados enviados via POST
    $text = required_param('text', PARAM_TEXT);
    $page = required_param('page', PARAM_TEXT);
    $timestamp = time();

    // Cria um objeto para o novo destaque
    $new_highlight = new stdClass();
    $new_highlight->userid = $userid;
    $new_highlight->page = $page;
    $new_highlight->text = $text;
    $new_highlight->timestamp = $timestamp;

    // Log para depuração: Verificando os dados antes da inserção
    error_log('Debug: Atingiu o ponto antes da inserção.');
    error_log('Debug: Dados a serem inseridos: ' . var_export($new_highlight, true));

    // Tenta inserir o novo destaque no banco de dados
    $DB->insert_record('user_highlight', $new_highlight);

    // Se a inserção for bem-sucedida, retorna a mensagem de sucesso
    echo json_encode(['status' => 'success', 'message' => 'Destaque salvo com sucesso']);
} catch (Exception $e) {
    // Captura e loga qualquer erro que ocorrer durante o processo
    error_log('Erro ao salvar destaque: ' . $e->getMessage());
    echo json_encode(['error' => 'Erro: ' . $e->getMessage()]);
}
?>
