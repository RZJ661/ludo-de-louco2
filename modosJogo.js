// Sistema central de modos de jogo
// Importa as configurações dos modos
const { configuracao: classico } = require("./modos/classico");
const { configuracao: x5 } = require("./modos/x5");

// Modo semCasasSeguras herda do clássico com casasSeguras: false
const semCasasSeguras = {
    ...classico,
    id: "semCasasSeguras",
    nome: "Sem Casas Seguras",
    emoji: "💥",
    casasSeguras: false,
    emDesenvolvimento: false
};

const modosJogo = {
    classico,
    semCasasSeguras,
    x5
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