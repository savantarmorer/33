<?php
// Certifique-se de que o Moodle está carregando este arquivo corretamente.
require_once('../../config.php');

// Define a URL da página atual.
$PAGE->requires->js(new moodle_url('/blocks/custom_highlight/js/highlight_board.js'));

// Define o contexto da página. Neste caso, usamos o contexto do sistema.
$PAGE->set_context(context_system::instance());

// Define o título e o cabeçalho da página.
$PAGE->set_title(get_string('highlights', 'custom_highlight'));
$PAGE->set_heading(get_string('highlights', 'custom_highlight'));

// Adiciona o cabeçalho do Moodle à página.
echo $OUTPUT->header();

// Renderiza o conteúdo HTML necessário.
?>

<!-- Botão separado do bloco principal -->
<button id="open-highlight-popup" style="
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 50%;
    cursor: pointer;
">Ver Destaques</button>

<!-- Bloco de destaques oculto inicialmente -->
<div id="highlight-board" style="display: none !important;"></div>

<!-- Inclui as bibliotecas do React e ReactDOM -->
<script src="https://unpkg.com/react@17/umd/react.production.min.js" crossorigin></script>
<script src="https://unpkg.com/react-dom@17/umd/react-dom.production.min.js" crossorigin></script>

<!-- Inclui o arquivo JavaScript do plugin -->
<script src="<?php echo $CFG->wwwroot; ?>/local/custom_annotations_plugin/js/highlight_board.js"></script>

<?php
// Adiciona o rodapé do Moodle à página.
echo $OUTPUT->footer();
?>
