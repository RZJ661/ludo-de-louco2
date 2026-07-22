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
const coordenadas = {
    player1: {
        cor: "vermelho",
        base: [],
        caminho: []
    },
    player2: {
        cor: "azul",
        base: [],
        caminho: []
    },
    player3: {
        cor: "verde",
        base: [],
        caminho: []
    },
    player4: {
        cor: "amarelo",
        base: [],
        caminho: []
    },
    player5: {
        cor: "roxo",
        base: [],
        caminho: []
    }
};

module.exports = { tabuleiro, coordenadas };