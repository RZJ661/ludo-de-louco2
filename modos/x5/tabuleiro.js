(() => {
// Tabuleiro X5 - mapa visual das casas externas compartilhadas.
// As coordenadas são porcentagens relativas à imagem PNG oficial.
// Nesta etapa são mapeadas somente as casas brancas. Os corredores coloridos
// e a ordem de movimentação serão definidos depois da conferência visual.

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

// Cada grupo contém apenas as casas brancas reais do seu setor visual.
const casasExternasPorSetor = {
    player4: criarSetorExterno(0),
    player5: criarSetorExterno(72),
    player1: criarSetorExterno(144),
    player2: criarSetorExterno(216),
    player3: criarSetorExterno(288)
};

const casasExternas = Object.values(casasExternasPorSetor).flat();

// Corredor amarelo, da entrada externa em direção ao centro compartilhado.
const RETA_FINAL_REFERENCIA_AMARELA = [
    { x: 50.3, y: 7.3 }, { x: 50.3, y: 13.0 }, { x: 50.3, y: 18.8 },
    { x: 50.3, y: 24.5 }, { x: 50.3, y: 30.2 }, { x: 50.3, y: 35.9 }
];

function criarRetaFinal(rotacao) {
    return RETA_FINAL_REFERENCIA_AMARELA.map((casa) => rotacionarPonto(casa, rotacao));
}

// player1 a player5 permanecem os identificadores lógicos; a cor é somente visual.
const retasFinaisPorJogador = {
    player4: criarRetaFinal(0),
    player5: criarRetaFinal(72),
    player1: criarRetaFinal(144),
    player2: criarRetaFinal(216),
    player3: criarRetaFinal(288)
};

const tabuleiro = {
    // Mapa visual das casas externas do tabuleiro X5.
    caminhoPrincipal: [],
    caminho: [],
    casasExternas,
    casasExternasPorSetor,
    retasFinaisPorJogador,

    // Ainda desativados: dependem da validação visual e da definição da ordem.
    indicesSaida: {
        player1: null,
        player2: null,
        player3: null,
        player4: null,
        player5: null
    },

    retasFinais: [
        retasFinaisPorJogador.player1,
        retasFinaisPorJogador.player2,
        retasFinaisPorJogador.player3,
        retasFinaisPorJogador.player4,
        retasFinaisPorJogador.player5
    ],
    casasSeguras: [],
    bases: [[], [], [], [], []]
};

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

const dadosTabuleiroX5 = { tabuleiro, coordenadas };

// O mesmo mapa é usado no servidor e na prévia visual do navegador.
if (typeof window !== "undefined") {
    window.X5_TABULEIRO = dadosTabuleiroX5;
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = dadosTabuleiroX5;
}
})();
