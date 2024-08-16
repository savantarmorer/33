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

    // Consulta para buscar os destaques do usuário logado
    $sql = "SELECT * FROM mdl_a_user_highlight WHERE userid = ?";
    $params = [$userid];
    $records = $DB->get_records_sql($sql, $params);

    // Verifica se a consulta retornou resultados
    if ($records) {
        echo json_encode(array_values($records));
    } else {
        echo json_encode(['status' => 'Consulta bem-sucedida, mas nenhum dado encontrado']);
    }
} catch (Exception $e) {
    // Retorna erro em caso de falha
    echo json_encode(['error' => 'Erro: ' . $e->getMessage()]);
}
?>
