// Configuração do modo Ludo Clássico
const configuracao = {
    id: "classico",
    nome: "Ludo Clássico",
    emoji: "🎲",
    jogadoresMaximos: 4,
    tabuleiro: "classic",
    casasSeguras: true,
    emDesenvolvimento: false,
    // IDs internos dos jogadores
    jogadores: [
        { id: "player1", cor: "vermelho" },
        { id: "player2", cor: "azul" },
        { id: "player3", cor: "amarelo" },
        { id: "player4", cor: "verde" }
    ],
    pecasPorJogador: 4
};

module.exports = { configuracao };