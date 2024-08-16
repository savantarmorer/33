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
    $id = required_param('id', PARAM_INT);
    $text = required_param('text', PARAM_TEXT);

    // Verifica se o destaque pertence ao usuário logado
    $highlight = $DB->get_record('user_highlight', ['id' => $id, 'userid' => $userid]);

    if (!$highlight) {
        throw new Exception('Destaque não encontrado ou não pertence ao usuário logado');
    }

    // Atualiza o texto do destaque
    $highlight->text = $text;
    $highlight->timestamp = time();

    // Aplica a atualização no banco de dados
    $DB->update_record('user_highlight', $highlight);

    echo json_encode(['status' => 'success', 'message' => 'Destaque atualizado com sucesso']);
} catch (Exception $e) {
    echo json_encode(['error' => 'Erro: ' . $e->getMessage()]);
}
?>
