// Configuração do modo Ludo X5
const configuracao = {
    id: "x5",
    nome: "Ludo X5",
    emoji: "⭐",
    jogadoresMaximos: 5,
    tabuleiro: "x5",
    casasSeguras: true,
    emDesenvolvimento: true,
    // IDs internos dos jogadores (nunca usar cor como identificador lógico)
    jogadores: [
        { id: "player1", cor: "vermelho" },
        { id: "player2", cor: "azul" },
        { id: "player3", cor: "verde" },
        { id: "player4", cor: "amarelo" },
        { id: "player5", cor: "roxo" }
    ],
    pecasPorJogador: 5
};

module.exports = { configuracao };