(() => {
// Tabuleiro X5 - estrutura de dados completa do tabuleiro.
// As coordenadas são porcentagens relativas à imagem PNG oficial.
// A estrutura agora representa casas, retas finais, bases e pontos de entrada/saída.

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
const coordenadas = {
    player1: {
        base: [
            { x: 48.0, y: 85.0 }, { x: 52.0, y: 85.0 }, { x: 50.0, y: 81.0 },
            { x: 46.0, y: 89.0 }, { x: 54.0, y: 89.0 }
        ],
        caminho: []
    },
    player2: {
        base: [
            { x: 10.0, y: 58.0 }, { x: 14.0, y: 61.0 }, { x: 12.0, y: 66.0 },
            { x: 16.0, y: 66.0 }, { x: 18.0, y: 58.0 }
        ],
        caminho: []
    },
    player3: {
        base: [
            { x: 16.0, y: 16.0 }, { x: 20.0, y: 13.0 }, { x: 24.0, y: 16.0 },
            { x: 18.0, y: 21.0 }, { x: 22.0, y: 21.0 }
        ],
        caminho: []
    },
    player4: {
        base: [
            { x: 76.0, y: 16.0 }, { x: 80.0, y: 13.0 }, { x: 84.0, y: 16.0 },
            { x: 78.0, y: 21.0 }, { x: 82.0, y: 21.0 }
        ],
        caminho: []
    },
    player5: {
        base: [
            { x: 90.0, y: 58.0 }, { x: 94.0, y: 61.0 }, { x: 92.0, y: 66.0 },
            { x: 88.0, y: 66.0 }, { x: 86.0, y: 58.0 }
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

function criarCasa({ x, y, tipo, segura, retaFinal, base, cor, jogadorId, ordem }) {
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
        ordem
    };
}

function registrarCasa(casa) {
    casas.push(casa);
    return casa;
}

jogadores.forEach((jogador, index) => {
    const rotacao = index * 72;

    const casasExternas = criarSetorExterno(rotacao).map((coord, ordem) => registrarCasa(criarCasa({
        x: coord.x,
        y: coord.y,
        tipo: "normal",
        segura: false,
        retaFinal: false,
        base: null,
        cor: null,
        jogadorId: jogador.id,
        ordem: ordem + 1
    })));

    casasExternasPorSetor[jogador.id] = casasExternas;

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
        jogadorId: jogador.id
    };

    const retaFinal = criarRetaFinal(rotacao).map((coord, ordem) => registrarCasa(criarCasa({
        x: coord.x,
        y: coord.y,
        tipo: "retaFinal",
        segura: true,
        retaFinal: true,
        base: null,
        cor: jogador.cor,
        jogadorId: jogador.id,
        ordem: ordem + 1
    })));

    retasFinaisPorJogador[jogador.id] = retaFinal;

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
        jogadorId: jogador.id
    };

    const casasBase = coordenadas[jogador.id].base.map((coord, ordem) => registrarCasa(criarCasa({
        x: coord.x,
        y: coord.y,
        tipo: "base",
        segura: false,
        retaFinal: false,
        base: jogador.id,
        cor: jogador.cor,
        jogadorId: jogador.id,
        ordem: ordem + 1
    })));

    bases[jogador.id] = casasBase;
});

const casasExternas = Object.values(casasExternasPorSetor).flat();
const casasSeguras = casas.filter((casa) => casa.segura);

const tabuleiro = {
    casas,
    casasPorId: Object.fromEntries(casas.map((casa) => [casa.id, casa])),
    caminhoPrincipal: [],
    caminho: [],
    casasExternas,
    casasExternasPorSetor,
    retasFinais: retasFinaisPorJogador,
    retasFinaisPorJogador,
    bases,
    entradas,
    saidas,
    indicesSaida: {
        player1: null,
        player2: null,
        player3: null,
        player4: null,
        player5: null
    },
    casasSeguras
};

const dadosTabuleiroX5 = { tabuleiro, coordenadas };

// O mesmo mapa é usado no servidor e na prévia visual do navegador.
if (typeof window !== "undefined") {
    window.X5_TABULEIRO = dadosTabuleiroX5;
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = dadosTabuleiroX5;
}
})();
