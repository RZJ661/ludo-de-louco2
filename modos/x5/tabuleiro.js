// Tabuleiro X5 - Estrutura para futuro desenvolvimento
// Este arquivo conterá as coordenadas e caminhos do tabuleiro X5
// Atualmente é um placeholder para a arquitetura

const tabuleiro = {
    // Caminho principal (5 cores)
    caminho: [],
    
    // Índices de saída para cada jogador
    indicesSaida: [0, 0, 0, 0, 0],
    
    // Retas finais (5 cores)
    retasFinais: [
        [], [], [], [], []
    ],
    
    // Casas seguras
    casasSeguras: [],
    
    // Bases (5 cores)
    bases: [
        [], [], [], [], []
    ]
};

module.exports = { tabuleiro };