<?php
// Este arquivo faz parte do Moodle - http://moodle.org/
// 
// O Moodle é um software livre: você pode redistribuí-lo e/ou modificá-lo
// sob os termos da GNU General Public License, publicada pela
// Free Software Foundation, seja na versão 3 da Licença, ou (a seu critério)
// qualquer versão posterior.
// 
// O Moodle é distribuído na esperança de que seja útil,
// mas SEM NENHUMA GARANTIA; sem mesmo a garantia implícita de
// COMERCIABILIDADE ou ADEQUAÇÃO A UM DETERMINADO FIM. Veja a
// GNU General Public License para mais detalhes.
// 
// Você deve ter recebido uma cópia da GNU General Public License
// junto com o Moodle. Se não, veja <http://www.gnu.org/licenses/>.

defined('MOODLE_INTERNAL') || die();

class block_custom_highlight extends block_base {

    public function init() {
        // Nome do bloco
        $this->title = get_string('pluginname', 'block_custom_highlight');
    }

    public function applicable_formats() {
        // Define em quais páginas o bloco pode ser adicionado.
        return array('all' => true);
    }

    public function get_content() {
        global $CFG, $OUTPUT, $USER;

        if ($this->content !== null) {
            return $this->content;
        }

        // Verifica se o usuário está logado
        if (isloggedin() && !isguestuser()) {
            // Define o conteúdo do bloco
            $this->content = new stdClass();
            $this->content->text = $this->get_highlight_html();
            $this->content->footer = '';

            // Inclui as bibliotecas React e ReactDOM antes do script customizado
            $this->page->requires->js(new moodle_url('https://unpkg.com/react@17/umd/react.production.min.js'), true);
            $this->page->requires->js(new moodle_url('https://unpkg.com/react-dom@17/umd/react-dom.production.min.js'), true);

            // Inclui o script JavaScript do bloco
            $this->page->requires->js(new moodle_url($CFG->wwwroot . '/blocks/custom_highlight/js/highlight_board.js'));
        } else {
            $this->content = null;
        }

        return $this->content;
    }

    private function get_highlight_html() {
        // Gera o HTML para o conteúdo do bloco
        return '

    <div class="card-body p-3">

    

        
            <!-- Bloco oculto inicialmente -->
            <div id="highlight-board" style="display: none !important;">
                <div class="highlight-board">
                    <h2>Seus grifos</h2>
                    <div class="highlight-container">
                        <div class="highlight-item">
                            <p>Aqui estão seus grifos</p>
                            <span>14/08/2024, 18:11:25</span>
                        </div>
                        <!-- ... outros destaques ... -->
                    </div>
                </div>
            </div>
            <!-- Botão para exibir os destaques -->
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
            <div class="footer"></div>
        </div>

    </div>

</section>';
    }
}
