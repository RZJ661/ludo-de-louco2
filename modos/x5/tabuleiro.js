 (() => {
// Tabuleiro X5 - estrutura de dados completa do tabuleiro.
// As coordenadas são porcentagens relativas à imagem PNG oficial.
// A estrutura representa casas, retas finais, bases e pontos de entrada/saída.
// Cada casa é um objeto completo com todas as informações necessárias para
// movimentação, captura e vitória futuras.

const CENTRO_TABULEIRO = { x: 50, y: 50 };

// Duas colunas de seis casas brancas do setor amarelo, medidas na imagem oficial.
// Os demais setores são cópias rotacionadas de 72 graus do mesmo desenho.
const CASAS_REFERENCIA_AMARELA = [
    { x: 44.5, y: 7.3 }, { x: 44.5, y: 13.0 }, { x: 44.5, y: 18.8 },
    { x: 44.5, y: 24.5 }, { x: 44.5, y: 30.2 }, { x: 44.5, y: 35.9 },
    { x: 56.1, y: 7.3 }, { x: 56.1, y: 13.0 }, { x: 56.1, y: 18.8 },
    { x: 56.1, y: 24.5 }, { x: 56.1, y: 30.2 }, { x: 56.1, y: 35.9 }
];

function rotacionarPonto({ x, y }, graus) {
    const radianos = (graus * Math.PI) / 180;
    const dx = x - CENTRO_TABULEIRO.x;
    const dy = y - CENTRO_TABULEIRO.y;

    return {
        x: Number((CENTRO_TABULEIRO.x + dx * Math.cos(radianos) - dy * Math.sin(radianos)).toFixed(2)),
        y: Number((CENTRO_TABULEIRO.y + dx * Math.sin(radianos) + dy * Math.cos(radianos)).toFixed(2))
    };
}

function criarSetorExterno(rotacao) {
    return CASAS_REFERENCIA_AMARELA.map((casa) => rotacionarPonto(casa, rotacao));
}

// Corredor amarelo, da entrada externa em direção ao centro compartilhado.
const RETA_FINAL_REFERENCIA_AMARELA = [
    { x: 50.3, y: 7.3 }, { x: 50.3, y: 13.0 }, { x: 50.3, y: 18.8 },
    { x: 50.3, y: 24.5 }, { x: 50.3, y: 30.2 }, { x: 50.3, y: 35.9 }
];

function criarRetaFinal(rotacao) {
    return RETA_FINAL_REFERENCIA_AMARELA.map((casa) => rotacionarPonto(casa, rotacao));
}

// Coordenadas das cinco posições de base por jogador lógico.
// Cada base possui 5 posições em formato de diamante, centralizadas
// nos círculos desenhados no tabuleiro X5.
// As coordenadas são porcentagens relativas à imagem do tabuleiro.
const coordenadas = {
    player1: {
        base: [
            { x: 48.0, y: 83.0 }, { x: 52.0, y: 83.0 }, { x: 50.0, y: 79.0 },
            { x: 46.0, y: 87.0 }, { x: 54.0, y: 87.0 }
        ],
        caminho: []
    },
    player2: {
        base: [
            { x: 12.0, y: 57.0 }, { x: 16.0, y: 61.0 }, { x: 14.0, y: 65.0 },
            { x: 10.0, y: 63.0 }, { x: 18.0, y: 59.0 }
        ],
        caminho: []
    },
    player3: {
        base: [
            { x: 18.0, y: 17.0 }, { x: 22.0, y: 13.0 }, { x: 26.0, y: 17.0 },
            { x: 20.0, y: 21.0 }, { x: 24.0, y: 21.0 }
        ],
        caminho: []
    },
    player4: {
        base: [
            { x: 74.0, y: 17.0 }, { x: 78.0, y: 13.0 }, { x: 82.0, y: 17.0 },
            { x: 76.0, y: 21.0 }, { x: 80.0, y: 21.0 }
        ],
        caminho: []
    },
    player5: {
        base: [
            { x: 86.0, y: 57.0 }, { x: 90.0, y: 61.0 }, { x: 94.0, y: 59.0 },
            { x: 88.0, y: 65.0 }, { x: 92.0, y: 63.0 }
        ],
        caminho: []
    }
};

const jogadores = [
    { id: "player1", cor: "vermelho" },
    { id: "player2", cor: "azul" },
    { id: "player3", cor: "verde" },
    { id: "player4", cor: "amarelo" },
    { id: "player5", cor: "roxo" }
];

let proximoId = 1;
const casas = [];
const casasExternasPorSetor = {};
const retasFinaisPorJogador = {};
const bases = {};
const entradas = {};
const saidas = {};

// Cria um objeto de casa completo com todas as propriedades necessárias.
// Evita depender apenas do índice do array.
function criarCasa({ x, y, tipo, segura, retaFinal, base, cor, jogadorId, ordem, entradaReta }) {
    return {
        id: proximoId++,
        x,
        y,
        tipo,
        segura,
        retaFinal,
        base,
        cor,
        jogadorId,
        ordem,
        entradaReta
    };
}

function registrarCasa(casa) {
    casas.push(casa);
    return casa;
}

jogadores.forEach((jogador, index) => {
    const rotacao = index * 72;

    // --- Casas externas (caminho principal) ---
    const casasExternas = criarSetorExterno(rotacao).map((coord, ordem) => registrarCasa(criarCasa({
        x: coord.x,
        y: coord.y,
        tipo: "normal",
        segura: false,
        retaFinal: false,
        base: null,
        cor: null,
        jogadorId: jogador.id,
        ordem: ordem + 1,
        entradaReta: false
    })));

    casasExternasPorSetor[jogador.id] = casasExternas;

    // --- Entrada do setor (primeira casa externa) ---
    const casaEntrada = casasExternas[0];
    entradas[jogador.id] = {
        id: `entrada-${jogador.id}`,
        casaId: casaEntrada.id,
        x: casaEntrada.x,
        y: casaEntrada.y,
        tipo: "entrada",
        segura: false,
        retaFinal: false,
        base: null,
        cor: jogador.cor,
        jogadorId: jogador.id,
        entradaReta: false
    };

    // --- Reta final (caminho interno até o gol) ---
    const retaFinal = criarRetaFinal(rotacao).map((coord, ordem) => registrarCasa(criarCasa({
        x: coord.x,
        y: coord.y,
        tipo: "retaFinal",
        segura: true,
        retaFinal: true,
        base: null,
        cor: jogador.cor,
        jogadorId: jogador.id,
        ordem: ordem + 1,
        entradaReta: ordem === 0
    })));

    retasFinaisPorJogador[jogador.id] = retaFinal;

    // --- Saída (primeira casa da reta final = entrada da reta final) ---
    const casaSaida = retaFinal[0];
    saidas[jogador.id] = {
        id: `saida-${jogador.id}`,
        casaId: casaSaida.id,
        x: casaSaida.x,
        y: casaSaida.y,
        tipo: "saida",
        segura: true,
        retaFinal: true,
        base: null,
        cor: jogador.cor,
        jogadorId: jogador.id,
        entradaReta: true
    };

    // --- Casas da base (posições iniciais das peças) ---
    const casasBase = coordenadas[jogador.id].base.map((coord, ordem) => registrarCasa(criarCasa({
        x: coord.x,
        y: coord.y,
        tipo: "base",
        segura: false,
        retaFinal: false,
        base: jogador.id,
        cor: jogador.cor,
        jogadorId: jogador.id,
        ordem: ordem + 1,
        entradaReta: false
    })));

    bases[jogador.id] = casasBase;
});

const casasExternas = Object.values(casasExternasPorSetor).flat();
const casasSeguras = casas.filter((casa) => casa.segura);

// Estruturas organizadas por cor para escalabilidade.
// Permite acesso direto por cor sem precisar mapear playerId -> cor.
const retasFinaisPorCor = {};
const basesPorCor = {};
const entradasPorCor = {};
const saidasPorCor = {};

jogadores.forEach((jogador) => {
    retasFinaisPorCor[jogador.cor] = retasFinaisPorJogador[jogador.id];
    basesPorCor[jogador.cor] = bases[jogador.id];
    entradasPorCor[jogador.cor] = entradas[jogador.id];
    saidasPorCor[jogador.cor] = saidas[jogador.id];
});

const tabuleiro = {
    casas,
    casasPorId: Object.fromEntries(casas.map((casa) => [casa.id, casa])),
    caminhoPrincipal: [],
    caminho: casasExternas,
    casasExternas,
    casasExternasPorSetor,
    retasFinais: retasFinaisPorCor,
    retasFinaisPorJogador,
    bases: basesPorCor,
    entradas: entradasPorCor,
    saidas: saidasPorCor,
    indicesSaida: {
        player1: null,
        player2: null,
        player3: null,
        player4: null,
        player5: null
    },
    casasSeguras
};

// === Sistema de Movimentação de Teste (debug) ===
// Este sistema valida o caminho externo do tabuleiro X5.
// Será removido após validação.

const pecaTeste = {
    posicao: 0,
    elemento: null
};

function criarPecaTeste() {
    const container = document.getElementById("container-pecas-x5-sandbox");
    if (!container) return;

    const peca = document.createElement("div");
    peca.id = "peca-teste-x5";
    peca.style.position = "absolute";
    peca.style.width = "20px";
    peca.style.height = "20px";
    peca.style.borderRadius = "50%";
    peca.style.backgroundColor = "#ff4444";
    peca.style.border = "2px solid #fff";
    peca.style.boxShadow = "0 0 6px rgba(0,0,0,0.7)";
    peca.style.transform = "translate(-50%, -50%)";
    peca.style.zIndex = "1000";
    peca.style.pointerEvents = "none";

    container.appendChild(peca);
    pecaTeste.elemento = peca;

    renderizarPecaTeste();
}

function renderizarPecaTeste() {
    if (!pecaTeste.elemento) return;

    const casa = tabuleiro.caminho[pecaTeste.posicao];
    if (!casa) return;

    pecaTeste.elemento.style.left = `${casa.x}%`;
    pecaTeste.elemento.style.top = `${casa.y}%`;
}

function moverPecaTeste(passos) {
    const totalCasas = tabuleiro.caminho.length;
    const novaPosicao = ((pecaTeste.posicao + passos) % totalCasas + totalCasas) % totalCasas;
    pecaTeste.posicao = novaPosicao;
    renderizarPecaTeste();
    const casa = tabuleiro.caminho[novaPosicao];
    console.log(`[X5 Debug] Peça movida para posição ${novaPosicao} | Casa ID: ${casa.id} | tipo: ${casa.tipo} | x: ${casa.x}, y: ${casa.y}`);
}

// Inicializa no navegador
if (typeof window !== "undefined") {
    window.moverPecaTeste = moverPecaTeste;
    window.pecaTeste = pecaTeste;
    window.tabuleiroX5 = tabuleiro;

    criarPecaTeste();

    document.addEventListener("keydown", (e) => {
        if (e.key === "m" || e.key === "M") {
            e.preventDefault();
            moverPecaTeste(1);
        }
        if (e.key === "n" || e.key === "N") {
            e.preventDefault();
            moverPecaTeste(5);
        }
    });
}

// === Sistema de Sandbox X5 ===
// Cria as 20 peças de teste nas bases e gerencia a visibilidade do
// tabuleiro X5 quando o modo de jogo muda para "x5" em uma sala.

function criarPecasX5() {
    const container = document.getElementById("container-pecas-x5-sandbox");
    if (!container) return;

    // Remove peças anteriores (mantém marcadores de debug)
    container.querySelectorAll(".peca").forEach(el => el.remove());

    const cores = ["vermelho", "azul", "verde", "amarelo", "roxo"];
    const pecasPorJogador = 4;

    cores.forEach((cor) => {
        const bases = tabuleiro.bases[cor];
        if (!bases) return;

        for (let i = 0; i < pecasPorJogador; i++) {
            const casa = bases[i];
            if (!casa) continue;

            const peca = document.createElement("div");
            peca.classList.add("peca", cor);
            peca.style.left = `${casa.x}%`;
            peca.style.top = `${casa.y}%`;
            peca.style.transform = "translate(-50%, -50%)";
            peca.dataset.cor = cor;
            peca.dataset.indice = i;

            container.appendChild(peca);
        }
    });
}

function atualizarVisibilidadeX5() {
    const tabuleiroX5 = document.getElementById("tabuleiro-x5");
    if (!tabuleiroX5) return;

    if (tabuleiroX5.style.display === "block") {
        document.body.classList.add("modo-x5-ativo");
        criarPecasX5();
    } else {
        document.body.classList.remove("modo-x5-ativo");
    }
}

// Inicializa no navegador
if (typeof window !== "undefined") {
    // Cria as peças iniciamente
    criarPecasX5();

    // Verifica estado inicial
    atualizarVisibilidadeX5();

    // Observa mudanças no display do tabuleiro X5
    const tabuleiroX5 = document.getElementById("tabuleiro-x5");
    if (tabuleiroX5) {
        const observer = new MutationObserver(() => {
            atualizarVisibilidadeX5();
        });
        observer.observe(tabuleiroX5, { attributes: true, attributeFilter: ["style"] });
    }

    // Seletor de modo X5 (isolado da interface clássica)
    const selectModoX5 = document.getElementById("select-modo-x5");
    if (selectModoX5) {
        selectModoX5.addEventListener("change", () => {
            const modo = selectModoX5.value;
            if (modo === "x5") {
                document.body.classList.add("modo-x5-ativo");
            } else {
                document.body.classList.remove("modo-x5-ativo");
            }
        });
    }
}

const dadosTabuleiroX5 = { tabuleiro, coordenadas };

// O mesmo mapa é usado no servidor e na prévia visual do navegador.
if (typeof window !== "undefined") {
    window.X5_TABULEIRO = dadosTabuleiroX5;
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = dadosTabuleiroX5;
}
})();
