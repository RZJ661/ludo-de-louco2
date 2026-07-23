// Tabuleiro X5 - mapeamento do caminho externo compartilhado
// As coordenadas estão em porcentagem relativa ao container do tabuleiro.

const caminhoPrincipal = [
    { x: 50.0, y: 84.0 },
    { x: 53.8, y: 80.4 },
    { x: 57.6, y: 76.6 },
    { x: 61.4, y: 72.6 },
    { x: 65.2, y: 68.6 },
    { x: 69.0, y: 64.4 },
    { x: 72.8, y: 60.0 },
    { x: 76.2, y: 55.4 },
    { x: 79.5, y: 50.6 },
    { x: 82.4, y: 45.8 },
    { x: 85.0, y: 40.8 },
    { x: 87.4, y: 35.4 },
    { x: 89.2, y: 29.8 },
    { x: 90.6, y: 24.0 },
    { x: 91.2, y: 18.2 },
    { x: 90.8, y: 12.8 },
    { x: 88.8, y: 8.6 },
    { x: 85.0, y: 5.4 },
    { x: 80.2, y: 3.2 },
    { x: 74.8, y: 2.4 },
    { x: 69.4, y: 2.4 },
    { x: 63.8, y: 2.8 },
    { x: 58.2, y: 3.6 },
    { x: 52.6, y: 4.8 },
    { x: 47.0, y: 6.4 },
    { x: 41.4, y: 8.4 },
    { x: 35.8, y: 10.8 },
    { x: 30.2, y: 13.6 },
    { x: 24.8, y: 17.0 },
    { x: 20.0, y: 21.2 },
    { x: 16.0, y: 26.0 },
    { x: 12.8, y: 31.2 },
    { x: 10.8, y: 36.8 },
    { x: 9.6, y: 42.4 },
    { x: 9.2, y: 48.2 },
    { x: 9.8, y: 54.0 },
    { x: 11.4, y: 60.0 },
    { x: 14.0, y: 66.0 },
    { x: 17.8, y: 72.0 },
    { x: 22.2, y: 77.0 },
    { x: 27.2, y: 80.8 },
    { x: 32.4, y: 83.8 },
    { x: 37.8, y: 85.8 },
    { x: 43.2, y: 87.0 },
    { x: 48.6, y: 86.2 }
];

const tabuleiro = {
    // Caminho principal compartilhado do tabuleiro X5.
    caminhoPrincipal,
    caminho: caminhoPrincipal,

    // Índices de saída para cada jogador, em ordem de movimentação do caminho.
    indicesSaida: {
        player1: 0,
        player2: 9,
        player3: 18,
        player4: 27,
        player5: 36
    },

    // Retas finais (5 cores) - coordenadas em porcentagem
    retasFinais: [
        [], [], [], [], []
    ],

    // Casas seguras - coordenadas em porcentagem
    casasSeguras: [],

    // Bases (5 cores) - coordenadas em porcentagem
    bases: [
        [], [], [], [], []
    ]
};

// Estrutura de coordenadas por jogador (player IDs)
// A cor já está centralizada na configuração do X5.
// Mapeamento proporcional em porcentagem (x, y) para as 5 posições de base de cada um dos 5 jogadores.
// Player 1 (Vermelho), Player 2 (Azul), Player 3 (Verde), Player 4 (Amarelo), Player 5 (Roxo).
// O tabuleiro tem formato pentagonal/estrelado. As posições são coordenadas aproximadas centralizadas nas bases do X5.
const coordenadas = {
    player1: {
        base: [
            { x: 47.8, y: 88.5 },
            { x: 52.2, y: 88.5 },
            { x: 50.0, y: 84.1 },
            { x: 45.5, y: 92.9 },
            { x: 54.5, y: 92.9 }
        ],
        caminho: []
    },
    player2: {
        base: [
            { x: 6.5, y: 61.4 },
            { x: 10.8, y: 64.5 },
            { x: 8.5, y: 69.6 },
            { x: 13.8, y: 69.6 },
            { x: 15.0, y: 61.4 }
        ],
        caminho: []
    },
    player3: {
        base: [
            { x: 15.5, y: 18.2 },
            { x: 19.8, y: 15.1 },
            { x: 24.1, y: 18.2 },
            { x: 17.1, y: 23.3 },
            { x: 22.5, y: 23.3 }
        ],
        caminho: []
    },
    player4: {
        base: [
            { x: 74.5, y: 18.2 },
            { x: 78.8, y: 15.1 },
            { x: 83.1, y: 18.2 },
            { x: 76.1, y: 23.3 },
            { x: 81.5, y: 23.3 }
        ],
        caminho: []
    },
    player5: {
        base: [
            { x: 89.2, y: 64.5 },
            { x: 93.5, y: 61.4 },
            { x: 91.5, y: 69.6 },
            { x: 86.2, y: 69.6 },
            { x: 85.0, y: 61.4 }
        ],
        caminho: []
    }
};

module.exports = { tabuleiro, coordenadas };