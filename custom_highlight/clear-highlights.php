<?php
require_once('../../config.php');
require_login();

if (isloggedin() && !isguestuser()) {
    global $DB, $USER;
    
    $userid = $USER->id;
    
    // Supondo que você tenha uma tabela para armazenar os destaques do usuário
    $DB->delete_records('custom_highlight', array('userid' => $userid));
    
    echo json_encode(['status' => 'success']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Usuário não logado ou convidado.']);
}
