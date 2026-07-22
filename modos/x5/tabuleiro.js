// Tabuleiro X5 - Estrutura para futuro desenvolvimento
// Este arquivo conterá as coordenadas e caminhos do tabuleiro X5
// Atualmente é um placeholder para a arquitetura

const tabuleiro = {
    // Caminho principal (5 cores) - coordenadas em porcentagem
    caminho: [],
    
    // Índices de saída para cada jogador (em porcentagem)
    indicesSaida: [0, 0, 0, 0, 0],
    
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
            { x: 15.5, y: 18.2 },
            { x: 19.8, y: 15.1 },
            { x: 24.1, y: 18.2 },
            { x: 17.1, y: 23.3 },
            { x: 22.5, y: 23.3 }
        ],
        caminho: []
    },
    player2: {
        base: [
            { x: 74.5, y: 18.2 },
            { x: 78.8, y: 15.1 },
            { x: 83.1, y: 18.2 },
            { x: 76.1, y: 23.3 },
            { x: 81.5, y: 23.3 }
        ],
        caminho: []
    },
    player3: {
        base: [
            { x: 89.2, y: 64.5 },
            { x: 93.5, y: 61.4 },
            { x: 91.5, y: 69.6 },
            { x: 86.2, y: 69.6 },
            { x: 85.0, y: 61.4 }
        ],
        caminho: []
    },
    player4: {
        base: [
            { x: 47.8, y: 88.5 },
            { x: 52.2, y: 88.5 },
            { x: 50.0, y: 84.1 },
            { x: 45.5, y: 92.9 },
            { x: 54.5, y: 92.9 }
        ],
        caminho: []
    },
    player5: {
        base: [
            { x: 6.5, y: 61.4 },
            { x: 10.8, y: 64.5 },
            { x: 8.5, y: 69.6 },
            { x: 13.8, y: 69.6 },
            { x: 15.0, y: 61.4 }
        ],
        caminho: []
    }
};

module.exports = { tabuleiro, coordenadas };