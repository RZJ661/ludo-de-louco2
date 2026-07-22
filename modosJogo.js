// Sistema central de modos de jogo
const modosJogo = {
    classico: {
        id: "classico",
        nome: "Ludo Clássico",
        emoji: "🎲",
        jogadoresMaximos: 4,
        tabuleiro: "classic",
        casasSeguras: true
    },
    semCasasSeguras: {
        id: "semCasasSeguras",
        nome: "Sem Casas Seguras",
        emoji: "💥",
        jogadoresMaximos: 4,
        tabuleiro: "classic",
        casasSeguras: false
    },
    cincoJogadores: {
        id: "cincoJogadores",
        nome: "Ludo 5 Jogadores",
        emoji: "⭐",
        jogadoresMaximos: 5,
        tabuleiro: "fivePlayers",
        casasSeguras: true,
        emDesenvolvimento: true
    }
};

function obterModoJogo(id) {
    return modosJogo[id] || modosJogo.classico;
}

function obterJogadoresMaximos(modoId) {
    const modo = obterModoJogo(modoId);
    return modo.jogadoresMaximos;
}

function modoPermitidoIniciar(modoId) {
    const modo = obterModoJogo(modoId);
    return !modo.emDesenvolvimento;
}

module.exports = {
    modosJogo,
    obterModoJogo,
    obterJogadoresMaximos,
    modoPermitidoIniciar
};