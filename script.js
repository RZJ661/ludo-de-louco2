const nomes = ["Vermelho", "Azul", "Amarelo", "Verde"];
const classesPainel = ["painel-vermelho", "painel-azul", "painel-amarelo", "painel-verde"];

let modoADM = false;

let jogadorAtual = 0;

let ranking = [];
let jogadoresFinalizados = [false, false, false, false];

const socket = io();

let salaAtual = null;
let meuNick = "";
let meuAvatar = "";
let souHost = false;
let meuJogador = null;
let jogadoresDaSala = [];
let meuIdUnico = localStorage.getItem("ludoIdUnico");

if (!meuIdUnico) {
    meuIdUnico = crypto.randomUUID();
    localStorage.setItem("ludoIdUnico", meuIdUnico);
}
let recebendoEstadoOnline = false;

let animandoMovimentoOnline = false;
let estadoPendenteOnline = null;

const tabuleiro = document.getElementById("tabuleiro");
const botaoDado = document.getElementById("dado");
const dadoVisual = document.getElementById("dado-visual");
const botoesDados = document.querySelectorAll(".dado-card");

const dadosAcumuladosTexto = document.getElementById("dados-acumulados");
const nickJogador = document.getElementById("nick-jogador");
const painelJogador = document.getElementById("painel-jogador");

const resultado = document.getElementById("resultado");
const turnoTexto = document.getElementById("jogador-atual");
const info = document.getElementById("info");
const btnADM = document.getElementById("btn-adm");

const toastJogo = document.getElementById("toast-jogo");
const telaFinal = document.getElementById("tela-final");
const rankingFinal = document.getElementById("ranking-final");
const prontosFinal = document.getElementById("prontos-final");
const contadorProntos = document.getElementById("contador-prontos");

const campeaoFinal = document.getElementById("campeao-final");
const fraseFinal = document.getElementById("frase-final");
const hallFama =
document.getElementById("hall-fama");

let hallDaFama = JSON.parse(
    localStorage.getItem("hallDaFama")
) || [0, 0, 0, 0];

let jogadoresProntos = [false, false, false, false];

let timerToast = null;

function mostrarAviso(mensagem) {
    if (!toastJogo) return;

    toastJogo.textContent = mensagem;
    toastJogo.classList.add("mostrar");

    clearTimeout(timerToast);

    timerToast = setTimeout(() => {
        toastJogo.classList.remove("mostrar");
    }, 1800);
}

let pecasDOM = [[], [], [], []];

let progresso = [
    [-1, -1, -1, -1],
    [-1, -1, -1, -1],
    [-1, -1, -1, -1],
    [-1, -1, -1, -1]
];

let golsFeitos = [
    [false, false, false, false],
    [false, false, false, false],
    [false, false, false, false],
    [false, false, false, false]
];

let dadosPendentes = [];
let bonusGiros = 0;
let seisSeguidos = 0;
let animando = false;
let dadoTravado = false;
let timerAFK = null;

const sonsDadoGiro = [
    "assets/dado/giro1.mp3",
    "assets/dado/giro2.mp3"
];

const sonsMovimento = [
    "assets/movimento/passo1.mp3",
    "assets/movimento/passo2.mp3"
];

const sonsGol = [
    "assets/gol/cassio.mp3",
    "assets/gol/direto.mp3",
    "assets/gol/ficatranquilo.mp3",
    "assets/gol/haah.mp3"
];

const sonsComer = [
    "assets/sounds/ai.mp3",
    "assets/sounds/beta.mp3",
    "assets/sounds/cai.mp3",
    "assets/sounds/cair.mp3",
    "assets/sounds/choranao.mp3",
    "assets/sounds/desncasap1.mp3",
    "assets/sounds/euevoce.mp3",
    "assets/sounds/lula.mp3",
    "assets/sounds/socorro.mp3",
    "assets/sounds/vasco.mp3",
    "assets/sounds/ze.mp3"
];

const sonsWin = [
    "assets/win/fake.mp3",
    "assets/win/naoacredito.mp3",
    "assets/win/tan.mp3",
    "assets/win/undaia.mp3"
];

let audiosTocando = [];

function tocarSomAleatorio(lista) {
    const caminho =
        lista[Math.floor(Math.random() * lista.length)];

    const audio = new Audio(caminho);
    audio.volume = 0.8;

    audiosTocando.push(audio);

    audio.addEventListener("ended", () => {
        audiosTocando = audiosTocando.filter(a => a !== audio);
    });

    audio.play().catch(() => {});
}

let audioFinal = null;

function tocarSomFinal(lista) {
    pararTodosOsSons();

    const caminho =
        lista[Math.floor(Math.random() * lista.length)];

    const audio = new Audio(caminho);
    audio.volume = 0.9;

    audiosTocando.push(audio);

    audio.play().catch(() => {});
}

function pararTodosOsSons() {
    audiosTocando.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
    });

    audiosTocando = [];
}

let afkSeguidos = [0, 0, 0, 0];

let jogadaAutomatica = false;

let intervaloTimerAFK = null;
let segundosTimerAFK = 0;

function limparTimerVisualAFK() {
    document.querySelectorAll(".timer-afk-card").forEach(timer => {
        timer.textContent = "";
        timer.classList.remove("perigo");
    });

    if (intervaloTimerAFK) {
        clearInterval(intervaloTimerAFK);
        intervaloTimerAFK = null;
    }
}

function registrarAtividadeJogador() {
    if (jogadaAutomatica) return;

    // Online: só o dono da vez pode resetar o próprio AFK
    if (meuJogador !== null && meuJogador !== jogadorAtual) {
        return;
    }

    afkSeguidos[jogadorAtual] = 0;

    if (!animando) {
        iniciarTimerAFK();
    }
}

function pegarTempoAFK(jogador) {
    const tempos = [30000, 15000, 10000, 5000];

    return tempos[
        Math.min(afkSeguidos[jogador], tempos.length - 1)
    ];
}

const GOL = 56;

const facesDado = {
    1: "⚀",
    2: "⚁",
    3: "⚂",
    4: "⚃",
    5: "⚄",
    6: "⚅"
};

const caminho = [
    { r: 6, c: 1 }, { r: 6, c: 2 }, { r: 6, c: 3 }, { r: 6, c: 4 }, { r: 6, c: 5 },
    { r: 5, c: 6 }, { r: 4, c: 6 }, { r: 3, c: 6 }, { r: 2, c: 6 }, { r: 1, c: 6 }, { r: 0, c: 6 },
    { r: 0, c: 7 }, { r: 0, c: 8 },
    { r: 1, c: 8 }, { r: 2, c: 8 }, { r: 3, c: 8 }, { r: 4, c: 8 }, { r: 5, c: 8 },
    { r: 6, c: 9 }, { r: 6, c: 10 }, { r: 6, c: 11 }, { r: 6, c: 12 }, { r: 6, c: 13 }, { r: 6, c: 14 },
    { r: 7, c: 14 }, { r: 8, c: 14 },
    { r: 8, c: 13 }, { r: 8, c: 12 }, { r: 8, c: 11 }, { r: 8, c: 10 }, { r: 8, c: 9 },
    { r: 9, c: 8 }, { r: 10, c: 8 }, { r: 11, c: 8 }, { r: 12, c: 8 }, { r: 13, c: 8 }, { r: 14, c: 8 },
    { r: 14, c: 7 }, { r: 14, c: 6 },
    { r: 13, c: 6 }, { r: 12, c: 6 }, { r: 11, c: 6 }, { r: 10, c: 6 }, { r: 9, c: 6 },
    { r: 8, c: 5 }, { r: 8, c: 4 }, { r: 8, c: 3 }, { r: 8, c: 2 }, { r: 8, c: 1 }, { r: 8, c: 0 },
    { r: 7, c: 0 }, { r: 6, c: 0 }
];

const indicesSaida = [0, 13, 26, 39];

const retasFinais = [
    [{ r: 7, c: 1 }, { r: 7, c: 2 }, { r: 7, c: 3 }, { r: 7, c: 4 }, { r: 7, c: 5 }],
    [{ r: 1, c: 7 }, { r: 2, c: 7 }, { r: 3, c: 7 }, { r: 4, c: 7 }, { r: 5, c: 7 }],
    [{ r: 7, c: 13 }, { r: 7, c: 12 }, { r: 7, c: 11 }, { r: 7, c: 10 }, { r: 7, c: 9 }],
    [{ r: 13, c: 7 }, { r: 12, c: 7 }, { r: 11, c: 7 }, { r: 10, c: 7 }, { r: 9, c: 7 }]
];

const casasSeguras = [0, 13, 26, 39, 47, 8, 21, 34];

const bases = [
    [{ r: 1, c: 1 }, { r: 1, c: 3 }, { r: 3, c: 1 }, { r: 3, c: 3 }],
    [{ r: 1, c: 11 }, { r: 1, c: 13 }, { r: 3, c: 11 }, { r: 3, c: 13 }],
    [{ r: 11, c: 11 }, { r: 11, c: 13 }, { r: 13, c: 11 }, { r: 13, c: 13 }],
    [{ r: 11, c: 1 }, { r: 11, c: 3 }, { r: 13, c: 1 }, { r: 13, c: 3 }]
];

function pegarCasa(r, c) {
    return document.querySelector(`.casa[data-row="${r}"][data-col="${c}"]`);
}

function criarTabuleiro() {
    tabuleiro.innerHTML = "";

    for (let r = 0; r < 15; r++) {
        for (let c = 0; c < 15; c++) {
            const casa = document.createElement("div");
            casa.classList.add("casa");
            casa.dataset.row = r;
            casa.dataset.col = c;

            if (r <= 5 && c <= 5) casa.classList.add("vermelho-area");
            else if (r <= 5 && c >= 9) casa.classList.add("azul-area");
            else if (r >= 9 && c <= 5) casa.classList.add("verde-area");
            else if (r >= 9 && c >= 9) casa.classList.add("amarelo-area");
            else if ((r >= 6 && r <= 8) || (c >= 6 && c <= 8)) casa.classList.add("caminho");

            if (r === 7 && c >= 1 && c <= 5) casa.className = "casa vermelho-entrada";
            if (c === 7 && r >= 1 && r <= 5) casa.className = "casa azul-entrada";
            if (r === 7 && c >= 9 && c <= 13) casa.className = "casa amarelo-entrada";
            if (c === 7 && r >= 9 && r <= 13) casa.className = "casa verde-entrada";

            if (r === 6 && c === 1) casa.className = "casa vermelho-entrada segura";
            if (r === 1 && c === 8) casa.className = "casa azul-entrada segura";
            if (r === 8 && c === 13) casa.className = "casa amarelo-entrada segura";
            if (r === 13 && c === 6) casa.className = "casa verde-entrada segura";

            if (r === 8 && c === 2) casa.className = "casa caminho segura";
            if (r === 2 && c === 6) casa.className = "casa caminho segura";
            if (r === 6 && c === 12) casa.className = "casa caminho segura";
            if (r === 12 && c === 8) casa.className = "casa caminho segura";

            if (r === 6 && c === 6) casa.className = "casa centro-vermelho";
            if (r === 6 && c === 7) casa.className = "casa centro-azul";
            if (r === 6 && c === 8) casa.className = "casa centro-azul";
            if (r === 7 && c === 6) casa.className = "casa centro-vermelho";

            if (r === 7 && c === 7) {
                casa.className = "casa centro-meio";
                casa.textContent = "○";
            }

            if (r === 7 && c === 8) casa.className = "casa centro-amarelo";
            if (r === 8 && c === 6) casa.className = "casa centro-verde";
            if (r === 8 && c === 7) casa.className = "casa centro-verde";
            if (r === 8 && c === 8) casa.className = "casa centro-amarelo";

            if (r === 7 && c === 0) {
                casa.className = "casa caminho seta";
                casa.textContent = "→";
            }

            if (r === 0 && c === 7) {
                casa.className = "casa caminho seta";
                casa.textContent = "↓";
            }

            if (r === 7 && c === 14) {
                casa.className = "casa caminho seta";
                casa.textContent = "←";
            }

            if (r === 14 && c === 7) {
                casa.className = "casa caminho seta";
                casa.textContent = "↑";
            }

            tabuleiro.appendChild(casa);
        }
    }
}

function criarPecas() {
    criarPecasNoCanto(1, 1, 0, "vermelho");
    criarPecasNoCanto(1, 11, 1, "azul");
    criarPecasNoCanto(11, 11, 2, "amarelo");
    criarPecasNoCanto(11, 1, 3, "verde");
}

function criarPecasNoCanto(startRow, startCol, jogador, cor) {
    const offsets = [[0, 0], [0, 2], [2, 0], [2, 2]];

    offsets.forEach((o, i) => {
        const casa = pegarCasa(startRow + o[0], startCol + o[1]);

        const peca = document.createElement("div");
        peca.classList.add("peca", cor);
        peca.onclick = () => clicarNaPeca(jogador, i);

        casa.appendChild(peca);
        pecasDOM[jogador].push(peca);
    });
}
const mensagensDadoErrado = [
    "🐂 Esse dado não é seu, seu corno!",
    "🤡 Tá roubando dado dos outros agora?",
    "🐒 Esse dado é do outro jogador, animal!",
    "🎲 Larga o dado dos outros, emocionado!",
    "🚨 Tentativa de roubo de dado detectada!",
    "👀 Esse dado não te pertence, doido!",
    "🚓 Polícia do Ludo: devolve esse dado aí!"
];

const mensagensPecaErrada = [
    "👁️ Ô cego, essa peça não é sua!",
    "🐒 Animal, essa peça é do outro!",
    "🤡 Tá mexendo na peça dos outros por quê?",
    "🚨 Tentativa de sequestro de peça detectada!",
    "🧠 Essa peça não responde ao seu comando.",
    "👀 Essa peça tem dono, otário!",
    "💀 Larga a peça alheia, doido!"
];

botoesDados.forEach(botao => {
    botao.addEventListener("click", async () => {

        const jogadorDoDado = Number(botao.dataset.jogador);

        if (jogadoresFinalizados[jogadorDoDado]) {
    mostrarAviso("🏁 Esse jogador já terminou, deixa o campeão descansar!");
    return;
}

if (meuJogador !== null && jogadorDoDado !== meuJogador) {
    mostrarAviso("🚫 Esse dado não é seu no online!");
    return;
}
        if (jogadorDoDado !== jogadorAtual) {

    mostrarAviso(
    mensagensDadoErrado[
        Math.floor(Math.random() * mensagensDadoErrado.length)
    ]
);

    return;
}

       if (animando) return;
       if (dadoTravado) return;
dadoTravado = true;

fecharMenuDados();

if (dadosPendentes.length > 0 && bonusGiros === 0) {
    mostrarAviso("🎲 Usa os dados acumulados primeiro, apressado!");
    dadoTravado = false;
    return;
}

if (bonusGiros > 0) {
    bonusGiros--;
    enviarEstadoOnline();
    dadoTravado = false;
}
animando = true;
botao.disabled = true;
tocarSomAleatorio(sonsDadoGiro);
const visual = botao.querySelector(".dado-3d");

        botao.classList.add("rolando");
        visual.textContent = "🎲";

        await new Promise(resolve => setTimeout(resolve, 500));

        const numero = Math.floor(Math.random() * 6) + 1;

        if (salaAtual) {
    socket.emit("dadoRolado", {
        sala: salaAtual,
        jogador: jogadorAtual,
        numero
    });
}

        botao.classList.remove("rolando");
        visual.textContent = facesDado[numero];

        dadosPendentes.push(numero);
        atualizarPainel();
        enviarEstadoOnline();

       if (numero === 6) {
    seisSeguidos++;

    if (seisSeguidos >= 3) {
        pararTimerAFK();
        const mensagensTriploSeis = [
    `💀 ${nomes[jogadorAtual]} tirou 6-6-6 e foi punido pelo universo!`,
    `🤣 ${nomes[jogadorAtual]} abusou da sorte e levou uma rasteira!`,
    `🐂 Três seis seguidos? Calma aí, campeão... perdeu a vez!`,
    `⚡ Jackpot maldito ativado para ${nomes[jogadorAtual]}!`,
    `🔥 ${nomes[jogadorAtual]} voou perto demais do sol e caiu bonito!`
];

info.textContent =
mensagensTriploSeis[
    Math.floor(Math.random() * mensagensTriploSeis.length)
];

        animando = false;
        dadoTravado = false;
        botao.disabled = false;

        limparTurno();
        setTimeout(passarTurno, 1000);
        return;
    }

    bonusGiros++;
   const mensagensSeis = [
    `🎲 ${nomes[jogadorAtual]} tirou 6! A sorte resolveu trabalhar hoje!`,
    `🤣 ${nomes[jogadorAtual]} ganhou outra chance de fazer besteira!`,
    `🔥 6 na veia! ${nomes[jogadorAtual]} continua vivo!`,
    `😎 ${nomes[jogadorAtual]} tirou 6 e está se achando profissional!`,
    `⚡ O dado escolheu ${nomes[jogadorAtual]} como favorito!`
];

info.textContent =
mensagensSeis[Math.floor(Math.random() * mensagensSeis.length)];

    animando = false;
    dadoTravado = false;
    botao.disabled = false;

    enviarEstadoOnline();

    return;
}
    seisSeguidos = 0;

    const jogadas = jogadasValidas(jogadorAtual);

if (jogadas.length === 0) {
    pararTimerAFK();
    info.textContent = `${nomes[jogadorAtual]} não tem jogada válida. Passando turno...`;

    animando = true;
    dadoTravado = true;

    botoesDados.forEach(dado => {
        dado.disabled = true;
    });

    limparTurno();

    setTimeout(() => {
        animando = false;
        
        dadoTravado = false;

        botoesDados.forEach(dado => {
            dado.disabled = false;
        });

        passarTurno();
    }, 800);

    return;
}

animando = false;
dadoTravado = true;
botao.disabled = true;

info.textContent = `${nomes[jogadorAtual]}, escolha uma peça. Tempo: 15s.`;
    iniciarTimerAFK();
    });
});

function clicarNaPeca(jogador, pecaIndex) {
    if (animando) return;

    // Online: clicou em peça de outra cor
    if (meuJogador !== null && jogador !== meuJogador) {
        mostrarAviso(
            mensagensPecaErrada[
                Math.floor(Math.random() * mensagensPecaErrada.length)
            ]
        );
        return;
    }

    // Online/offline: clicou na sua peça, mas não é sua vez
    if (jogador !== jogadorAtual) {
        mostrarAviso("⏳ Calma aí, emocionado! Ainda não é sua vez.");
        return;
    }

    if (dadosPendentes.length === 0) {
        mostrarAviso("🎲 Primeiro joga o dado, gênio!");
        return;
    }

    if (bonusGiros > 0) {
        mostrarAviso("🎲 Você ainda tem giro extra, roda o dado primeiro!");
        return;
    }

    const dadosValidos = [];

    for (let i = 0; i < dadosPendentes.length; i++) {
        if (jogadaValidaComDado(jogador, pecaIndex, dadosPendentes[i])) {
            dadosValidos.push(i);
        }
    }

    if (dadosValidos.length === 0) {
       mostrarAviso("❌ Essa peça não usa nenhum dado acumulado, animal!");
        return;
    }

    mostrarMenuDados(jogador, pecaIndex, dadosValidos);
}

function mostrarMenuDados(jogador, pecaIndex, dadosValidos) {
    fecharMenuDados();

    const peca = pecasDOM[jogador][pecaIndex];

    const menu = document.createElement("div");
    menu.id = "menu-dados";

    menu.style.position = "absolute";
    menu.style.left = "50%";
    menu.style.top = "-46px";
    menu.style.transform = "translateX(-50%)";
    menu.style.background = "rgba(0,0,0,0.85)";
    menu.style.border = "2px solid white";
    menu.style.borderRadius = "12px";
    menu.style.padding = "5px";
    menu.style.display = "flex";
    menu.style.gap = "5px";
    menu.style.zIndex = "9999";
    menu.style.boxShadow = "0 4px 12px rgba(0,0,0,0.7)";

    dadosValidos.forEach(dadoIndex => {
        const valor = dadosPendentes[dadoIndex];

        const botao = document.createElement("button");
        botao.textContent = `🎲${valor}`;
        botao.style.fontSize = "15px";
        botao.style.fontWeight = "bold";
        botao.style.border = "none";
        botao.style.borderRadius = "8px";
        botao.style.padding = "5px 7px";
        botao.style.cursor = "pointer";
        botao.style.background = "white";
        botao.style.color = "black";

        botao.onclick = async (e) => {
            e.stopPropagation();
            fecharMenuDados();
            await usarDadoNaPeca(jogador, pecaIndex, dadoIndex);
        };

        menu.appendChild(botao);
    });

    peca.appendChild(menu);
}

function fecharMenuDados() {
    const menu = document.getElementById("menu-dados");

    if (menu) {
        menu.remove();
    }
}

async function usarDadoNaPeca(jogador, pecaIndex, dadoIndex) {
    afkSeguidos[jogadorAtual] = 0;
    if (animando) return;

    pararTimerAFK();

    const dadoUsado = dadosPendentes[dadoIndex];
    dadosPendentes.splice(dadoIndex, 1);
    atualizarPainel();

    if (progresso[jogador][pecaIndex] === -1) {
    tirarDaBase(jogador, pecaIndex);

    enviarEstadoOnline();

    terminarJogada(false);
    return;
}

    await moverPeca(jogador, pecaIndex, dadoUsado);

    const capturou = verificarCaptura(jogador, pecaIndex);
    const fezGol = progresso[jogador][pecaIndex] === GOL;

    if (fezGol && !golsFeitos[jogador][pecaIndex]) {
    golsFeitos[jogador][pecaIndex] = true;
    enviarEstadoOnline();
}

    if (capturou || fezGol) {
        bonusGiros++;
    }

    verificarVitoria(jogador);
    terminarJogada(capturou || fezGol);
}

function jogadasValidas(jogador) {
    const validas = [];

    for (let p = 0; p < 4; p++) {
        for (let d = 0; d < dadosPendentes.length; d++) {
            if (jogadaValidaComDado(jogador, p, dadosPendentes[d])) {
                validas.push(p);
                break;
            }
        }
    }

    return validas;
}

function jogadaValidaComDado(jogador, pecaIndex, dado) {
    const prog = progresso[jogador][pecaIndex];

    if (golsFeitos[jogador][pecaIndex]) return false;
    if (prog === GOL) return false;

    if (prog === -1) {
        return dado === 6;
    }

    return prog + dado <= GOL;
}

function tirarDaBase(jogador, pecaIndex) {
    progresso[jogador][pecaIndex] = 0;
    renderizarPeca(jogador, pecaIndex);

    info.textContent = `${nomes[jogador]} tirou uma peça da base!`;
}
async function moverPeca(jogador, pecaIndex, passos) {

    if (salaAtual && !recebendoEstadoOnline) {
    socket.emit("pecaMovendo", {
        sala: salaAtual,
        jogador,
        pecaIndex,
        passos,
        progressoInicial: progresso[jogador][pecaIndex]
    });
}

    for (let passo = 1; passo <= passos; passo++) {
        progresso[jogador][pecaIndex]++;

        renderizarPeca(jogador, pecaIndex);

        const peca = pecasDOM[jogador][pecaIndex];

        peca.classList.remove("andando");
        void peca.offsetWidth;
        peca.classList.add("andando");

        await esperar(350);
    }

    const peca = pecasDOM[jogador][pecaIndex];
    peca.classList.remove("andando");

 if (progresso[jogador][pecaIndex] === GOL) {

    if (!golsFeitos[jogador].every(g => g === true)) {

        tocarSomAleatorio(sonsGol);

        renderizarPeca(jogador, pecaIndex);

        info.textContent = `⚽ GOL do ${nomes[jogador]}!`;
    }
}
}

function renderizarPeca(jogador, pecaIndex) {
    const prog = progresso[jogador][pecaIndex];
    const peca = pecasDOM[jogador][pecaIndex];
    const casaAntiga = peca.parentElement;

    if (prog === -1) {
        const base = bases[jogador][pecaIndex];
        const casaDOM = pegarCasa(base.r, base.c);

        casaDOM.appendChild(peca);

        if (casaAntiga && casaAntiga !== casaDOM) {
            organizarPecasNaCasa(casaAntiga);
        }

        organizarPecasNaCasa(casaDOM);
        organizarTodasAsCasas();
        return;
    }

    if (prog <= 50) {
        const indiceGlobal = (indicesSaida[jogador] + prog) % caminho.length;
        const casa = caminho[indiceGlobal];
        const casaDOM = pegarCasa(casa.r, casa.c);

        casaDOM.appendChild(peca);

        if (casaAntiga && casaAntiga !== casaDOM) {
            organizarPecasNaCasa(casaAntiga);
        }

        organizarPecasNaCasa(casaDOM);
        organizarTodasAsCasas();
        return;
    }

    if (prog >= 51 && prog <= 55) {
        const indiceReta = prog - 51;
        const casa = retasFinais[jogador][indiceReta];
        const casaDOM = pegarCasa(casa.r, casa.c);

        casaDOM.appendChild(peca);

        if (casaAntiga && casaAntiga !== casaDOM) {
            organizarPecasNaCasa(casaAntiga);
        }

        organizarPecasNaCasa(casaDOM);
        organizarTodasAsCasas();
        return;
    }

    if (prog === GOL) {
        const base = bases[jogador][pecaIndex];
        const casaDOM = pegarCasa(base.r, base.c);

        casaDOM.appendChild(peca);

        if (casaAntiga && casaAntiga !== casaDOM) {
            organizarPecasNaCasa(casaAntiga);
        }

        organizarPecasNaCasa(casaDOM);
        organizarTodasAsCasas();

        if (!peca.dataset.coroada) {
            peca.dataset.coroada = "true";

            const coroa = document.createElement("div");
            coroa.textContent = "👑";
            coroa.style.position = "absolute";
            coroa.style.top = "-18px";
            coroa.style.left = "50%";
            coroa.style.transform = "translateX(-50%)";
            coroa.style.fontSize = "14px";
            coroa.style.pointerEvents = "none";

            peca.style.position = "relative";
            peca.appendChild(coroa);
        }

        return;
    }
}
function organizarPecasNaCasa(casa) {
    const pecas = Array.from(casa.querySelectorAll(".peca"));

    pecas.forEach((peca) => {
    peca.style.width = "32px";
    peca.style.height = "32px";

    peca.style.minWidth = "32px";
    peca.style.minHeight = "32px";

    peca.style.setProperty("--px", "0px");
    peca.style.setProperty("--py", "0px");
});

    if (pecas.length <= 1) return;

    let tamanho = "24px";

    const posicoesPorQuantidade = {
        2: [
            [-8, 0],
            [8, 0]
        ],
        3: [
            [0, -9],
            [-9, 8],
            [9, 8]
        ],
        4: [
            [-8, -8],
            [8, -8],
            [-8, 8],
            [8, 8]
        ],
        5: [
            [0, -11],
            [-10, -3],
            [10, -3],
            [-6, 10],
            [6, 10]
        ],
        6: [
            [-10, -9],
            [10, -9],
            [-10, 0],
            [10, 0],
            [-10, 9],
            [10, 9]
        ],
        7: [
    [-12, -12],
    [0, -12],
    [12, -12],
    [-12, 0],
    [0, 0],
    [12, 0],
    [0, 12]
],
8: [
    [-12, -12],
    [0, -12],
    [12, -12],
    [-12, 0],
    [12, 0],
    [-12, 12],
    [0, 12],
    [12, 12]
]
    };

    if (pecas.length >= 5) {
    tamanho = "17px";
}

if (pecas.length >= 7) {
    tamanho = "15px";
}

    const posicoes = posicoesPorQuantidade[Math.min(pecas.length, 8)];

    pecas.forEach((peca, i) => {
        peca.style.width = tamanho;
        peca.style.height = tamanho;

        const pos = posicoes[i] || [0, 0];

        peca.style.setProperty("--px", `${pos[0]}px`);
        peca.style.setProperty("--py", `${pos[1]}px`);
    });
}

function organizarTodasAsCasas() {
    document.querySelectorAll(".casa").forEach(casa => {
        organizarPecasNaCasa(casa);
    });
}

function verificarCaptura(jogador, pecaIndex) {
    const prog = progresso[jogador][pecaIndex];

    if (prog > 50) return false;

    const posicaoGlobal = (indicesSaida[jogador] + prog) % caminho.length;

    if (casasSeguras.includes(posicaoGlobal)) {
        return false;
    }

    let capturou = false;

    for (let outroJogador = 0; outroJogador < 4; outroJogador++) {
        if (outroJogador === jogador) continue;

        for (let outraPeca = 0; outraPeca < 4; outraPeca++) {
            const progOutro = progresso[outroJogador][outraPeca];

            if (progOutro < 0 || progOutro > 50) continue;

            const posicaoOutro = (indicesSaida[outroJogador] + progOutro) % caminho.length;

            if (posicaoOutro === posicaoGlobal) {
   mandarParaBase(outroJogador, outraPeca);
capturou = true;

if (salaAtual) {
    socket.emit("somComer", {
        sala: salaAtual
    });
} else {
    tocarSomAleatorio(sonsComer);
}

    const mensagensComeu = [
    `👀 OLOKO, me comeu?!`,
    `💀 Aí é foda patrão...`,
    `🤣 Voltei pra base igual um otário.`,
    `🏠 Fui de arrasta pra casinha.`,
    `🚑 Calma aí paizão!`,
    `😭 Isso foi desnecessário.`,
    `🤡 Tava suave aqui, pô.`,
    `💥 Receba!`,
    `😡 Vou lembrar disso.`,
    `🐂 Aí tu apelou.`,
    `☠️ Me apagou do mapa.`,
    `🤣 Nem vi de onde veio.`,
    `🏃 Já tô voltando pra base mesmo.`,
    `💀 Minha peça pediu aposentadoria.`,
    `🚨 Crime ocorreu.`,
    `😂 Tá jogando sujo, safado.`,
    `😎 Aí gosta de humilhar.`,
    `🪦 Enterrou a peça sem dó.`,
    `🐒 Que lapada seca.`,
    `😭 Minha mãe vai ficar sabendo disso.`,
    `💔 Que decepção.`,
    `⚰️ F no chat.`,
    `🤣 Que fase, meus amigos.`,
    `💀 Voltei mais rápido do que saí.`,
    `🏠 O Uber da base chegou.`,
    `🚑 Chamem reforços.`,
    `😡 Isso não vai ficar assim.`,
    `🐂 O cara veio com sangue nos olhos.`,
    `🔥 Tá achando que é quem?`,
    `😂 Que tapa foi esse?`,
    `☠️ Fui jogar no Vasco.`,
    `🏃 Corri errado.`,
    `🤡 Eu mereço.`,
    `💀 Que humilhação gratuita.`,
    `🤣 Isso foi pessoal.`,
    `😤 Rivalidade criada com sucesso.`,
    `🚨 Violência detectada.`,
    `🪦 Adeus mundo cruel.`,
    `😭 Minha peça tinha família.`,
    `🐒 O cara não perdoa.`,
    `💀 Eu tava só passeando.`,
    `😂 Nem deu tempo de reagir.`,
    `🔥 Agressivo ele.`,
    `😡 Vou te pegar na próxima.`,
    `🏠 Casinha premium desbloqueada.`,
    `🤣 Fui resetado.`,
    `⚰️ Mais uma vítima.`,
    `👀 Rapaz...`,
    `💥 Me quebrou no meio.`,
    `🐂 Aí tu veio forte demais.`
];

    info.textContent =
        mensagensComeu[
            Math.floor(Math.random() * mensagensComeu.length)
        ];
}
        }
    }

    return capturou;
}

function mandarParaBase(jogador, pecaIndex) {
    progresso[jogador][pecaIndex] = -1;
    renderizarPeca(jogador, pecaIndex);

    enviarEstadoOnline();
}

function terminarJogada(ganhouGiro) {
    pararTimerAFK();

    if (ganhouGiro) {
        info.textContent += " 🎲 Ganhou giro extra!";
    }

    if (bonusGiros > 0) {
        animando = false;
        dadoTravado = false;

        botoesDados.forEach(dado => {
            dado.disabled = false;
            dado.classList.remove("rolando");
        });

        atualizarPainel();
        info.textContent += " Gire o dado novamente.";

        limparTimerVisualAFK();
        iniciarTimerAFK();
        enviarEstadoOnline();
        return;
    }

    if (dadosPendentes.length > 0) {
        const jogadas = jogadasValidas(jogadorAtual);

        if (jogadas.length > 0) {
            animando = false;
            dadoTravado = true;

            atualizarPainel();
            info.textContent += " Dados restantes.";
            iniciarTimerAFK();
            enviarEstadoOnline();
            return;
        }
    }

    passarTurno();
}
function enviarEstadoOnline() {
    if (!salaAtual || recebendoEstadoOnline) return;

    socket.emit("sincronizarEstado", {
        sala: salaAtual,
        jogadorAtual,
        progresso,
        golsFeitos,
        ranking,
        jogadoresFinalizados,
        dadosPendentes,
        bonusGiros,
        seisSeguidos
    });
}
function limparTurno() {
    dadosPendentes = [];
    bonusGiros = 0;
    seisSeguidos = 0;
    pararTimerAFK();
    atualizarPainel();
}
function soltarConfetes() {

    const canvas = document.getElementById("confetes");
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const confetes = [];

    for (let i = 0; i < 200; i++) {
        confetes.push({
            x: Math.random() * canvas.width,
            y: -20,
            tamanho: Math.random() * 8 + 4,
            velocidade: Math.random() * 4 + 2,
            cor: [
                "#ff0000",
                "#00ff00",
                "#0000ff",
                "#ffff00",
                "#ff00ff",
                "#00ffff"
            ][Math.floor(Math.random() * 6)]
        });
    }

    let frames = 0;

    function animar() {

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        confetes.forEach(c => {

            c.y += c.velocidade;

            ctx.fillStyle = c.cor;
            ctx.fillRect(c.x, c.y, c.tamanho, c.tamanho);
        });

        frames++;

        if (frames < 250) {
            requestAnimationFrame(animar);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    animar();
}

function mostrarTelaFinal() {

    telaFinal.style.display = "flex";

    soltarConfetes();

    const frasesVitoria = [
    "👑 Humilhou geral sem dó!",
    "🔥 Jogou igual um monstro!",
    "💀 Os adversários pediram revisão!",
    "🚀 Deixou os outros comendo poeira!",
    "🎯 Vitória limpa e sem discussão!",
    "😎 Já pode cobrar ingresso!",
    "🏆 Nasceu para vencer!",
    "⚡ Passou o trator em todo mundo!",
    "🤣 Os outros esqueceram como joga!",
    "🍷 Vitória saborosa demais!"
];

campeaoFinal.textContent = `🏆 CAMPEÃO: ${nomes[ranking[0]]} 🏆`;

hallDaFama[ranking[0]]++;

localStorage.setItem(
    "hallDaFama",
    JSON.stringify(hallDaFama)
);

fraseFinal.textContent =
    frasesVitoria[
        Math.floor(Math.random() * frasesVitoria.length)
    ];

rankingFinal.innerHTML = ranking
    .map((j, i) => {

        const medalha =
            i === 0 ? "🥇" :
            i === 1 ? "🥈" :
            i === 2 ? "🥉" :
            "🏅";

        return `<div>${medalha} TOP ${i + 1}: ${nomes[j]}</div>`;
    })
    .join("");

hallFama.innerHTML = `
    <hr>
    <strong>🏆 HALL DA FAMA</strong><br><br>

    🔴 Vermelho: ${hallDaFama[0]} vitórias<br>
    🔵 Azul: ${hallDaFama[1]} vitórias<br>
    🟡 Amarelo: ${hallDaFama[2]} vitórias<br>
    🟢 Verde: ${hallDaFama[3]} vitórias
`;
}

function passarTurno() {
    pararTimerAFK();
    limparTurno();

    if (ranking.length >= 3) {
    for (let i = 0; i < 4; i++) {
        if (!jogadoresFinalizados[i]) {
            jogadoresFinalizados[i] = true;
            ranking.push(i);
            break;
        }
    }

    pararTimerAFK();

    animando = true;
    dadoTravado = true;

    botoesDados.forEach(dado => {
        dado.disabled = true;
    });

        mostrarTelaFinal();
return;

}

    do {
        jogadorAtual++;
        if (jogadorAtual > 3) jogadorAtual = 0;
    } while (jogadoresFinalizados[jogadorAtual]);

turnoTexto.textContent = nomes[jogadorAtual];
info.textContent = `Vez de ${nomes[jogadorAtual]}.`;

if (salaAtual && !recebendoEstadoOnline) {
    socket.emit("sincronizarEstado", {
    sala: salaAtual,
    jogadorAtual,
    progresso,
    golsFeitos,
    ranking,
    jogadoresFinalizados,
    dadosPendentes,
    bonusGiros,
    seisSeguidos
});
}

animando = false;
dadoTravado = false;

botoesDados.forEach(dado => {
    const jogadorDoDado = Number(dado.dataset.jogador);

    dado.classList.remove("rolando");

    if (meuJogador !== null) {
        dado.disabled = jogadorDoDado !== meuJogador || jogadorDoDado !== jogadorAtual;
    } else {
        dado.disabled = jogadorDoDado !== jogadorAtual;
    }
});

    atualizarPainel();
iniciarTimerAFK();
}

function verificarVitoria(jogador) {
    const venceu = golsFeitos[jogador].every(gol => gol === true);

    if (!venceu) return;

    if (!jogadoresFinalizados[jogador]) {
        jogadoresFinalizados[jogador] = true;
        ranking.push(jogador);

        tocarSomFinal(sonsWin);
    }

    pararTimerAFK();

    info.textContent =
        `🏆 ${nomes[jogador]} ficou TOP ${ranking.length}! ` +
        `Ranking: ${ranking.map((j, i) => `TOP ${i + 1}: ${nomes[j]}`).join(" | ")}`;

    dadosPendentes = [];
    bonusGiros = 0;
    seisSeguidos = 0;
    animando = false;
    dadoTravado = false;

    botoesDados.forEach(dado => {
        dado.disabled = false;
        dado.classList.remove("rolando");
    });

    if (ranking.length >= 3) {
        passarTurno();
        return;
    }

    setTimeout(passarTurno, 1200);
}
function botRolarDadoAFK() {
    const dadoDoJogador =
        document.querySelector(`.dado-card[data-jogador="${jogadorAtual}"]`);

    if (!dadoDoJogador) return;

    mostrarAviso(`🤖 ${nomes[jogadorAtual]} dormiu no ponto. O bot vai rodar o dado!`);

    dadoDoJogador.click();
}
function iniciarTimerAFK() {
    if (meuJogador !== null && jogadorAtual !== meuJogador) {
    pararTimerAFK();
    limparTimerVisualAFK();
    return;
}
    pararTimerAFK();
    limparTimerVisualAFK();

segundosTimerAFK = Math.floor(
    pegarTempoAFK(jogadorAtual) / 1000
);

const timerCard =
    document
        .querySelector(`.card-jogador[data-jogador="${jogadorAtual}"]`)
        .querySelector(".timer-afk-card");

timerCard.textContent =
    dadosPendentes.length === 0
        ? `🎲 ${segundosTimerAFK}s`
        : `⌛ ${segundosTimerAFK}s`;

intervaloTimerAFK = setInterval(() => {
    segundosTimerAFK--;

  timerCard.textContent =
    dadosPendentes.length === 0
        ? `🎲 ${segundosTimerAFK}s`
        : `⌛ ${segundosTimerAFK}s`;

    if (segundosTimerAFK <= 5) {
        timerCard.classList.add("perigo");
    }

    if (segundosTimerAFK <= 0) {
        clearInterval(intervaloTimerAFK);
        intervaloTimerAFK = null;
    }
}, 1000);

    timerAFK = setTimeout(() => {

        if (dadosPendentes.length === 0 && bonusGiros === 0) {
    botRolarDadoAFK();
    return;
}
        const jogadas = jogadasValidas(jogadorAtual);

        if (jogadas.length === 0) {
    afkSeguidos[jogadorAtual]++;
    limparTurno();
    passarTurno();
    return;
}

        afkSeguidos[jogadorAtual]++;

info.textContent =
`${nomes[jogadorAtual]} ficou AFK de novo. Agora o jogo não tem paciência.`;

        const pecaEscolhida = jogadas[0];

        for (let i = 0; i < dadosPendentes.length; i++) {
            if (jogadaValidaComDado(jogadorAtual, pecaEscolhida, dadosPendentes[i])) {
                jogadaAutomatica = true;
usarDadoNaPeca(jogadorAtual, pecaEscolhida, i);
jogadaAutomatica = false;
                return;
            }
        }
    }, pegarTempoAFK(jogadorAtual));
}

function pararTimerAFK() {
    if (timerAFK) {
        clearTimeout(timerAFK);
        timerAFK = null;
    }
}

function atualizarPainel() {
    nickJogador.textContent = nomes[jogadorAtual];
    turnoTexto.textContent = nomes[jogadorAtual];

    document.querySelectorAll(".card-jogador").forEach(card => {
        card.classList.remove("ativo");
    });

    document.querySelectorAll(".card-jogador").forEach(card => {
    card.classList.remove("ativo");
    card.classList.remove("aguardando-dado");
});

    painelJogador.classList.remove(
        "painel-vermelho",
        "painel-azul",
        "painel-amarelo",
        "painel-verde"
    );

    painelJogador.classList.add(classesPainel[jogadorAtual]);

    const cardAtivo = document.querySelector(
    `.card-jogador[data-jogador="${jogadorAtual}"]`
);

if (cardAtivo) {
    cardAtivo.classList.add("ativo");
    cardAtivo.classList.add("aguardando-dado");
}

    if (dadosPendentes.length === 0) {
        dadosAcumuladosTexto.textContent = "Dados: -";
    } else {
        dadosAcumuladosTexto.textContent =
            dadosPendentes.map(d => `🎲${d}`).join(" ");
    }

    document.querySelectorAll(".dados-card").forEach(dados => {
        dados.textContent = "Dados: -";
    });

    const dadosCardAtivo = document.querySelector(
        `.card-jogador[data-jogador="${jogadorAtual}"] .dados-card`
    );

    if (dadosCardAtivo) {
        if (dadosPendentes.length === 0) {
            dadosCardAtivo.textContent = "Dados: -";
        } else {
            dadosCardAtivo.textContent =
                "Dados: " + dadosPendentes.map(d => `🎲${d}`).join(" ");
        }
    }
}

function esperar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

criarTabuleiro();
criarPecas();
atualizarPainel();
info.textContent = `Vez de ${nomes[jogadorAtual]}.`;
iniciarTimerAFK();

setTimeout(() => {
    organizarTodasAsCasas();
}, 500);

document.addEventListener("keydown", (e) => {

    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "l") {

        const senha = prompt("Digite a senha ADM:");

        if (senha !== "papafigo2") {
            alert("❌ Senha incorreta!");
            return;
        }

        modoADM = !modoADM;
const painelADM = document.getElementById("painel-adm");

if (painelADM) {
    painelADM.style.display = modoADM ? "block" : "none";
}
        alert(
            modoADM
                ? "🎮 MODO ADM ATIVADO"
                : "❌ MODO ADM DESATIVADO"
        );
    }
});
const fecharADM = document.getElementById("fechar-adm");

if (fecharADM) {
    fecharADM.addEventListener("click", () => {
        modoADM = false;
        document.getElementById("painel-adm").style.display = "none";
    });
}
document.querySelectorAll(".adm-forcar-dado").forEach(botao => {
    botao.addEventListener("click", () => {
        if (!modoADM) return;

        const valor = Number(botao.dataset.valor);

        dadosPendentes.push(valor);

animando = false;
dadoTravado = false;

botoesDados.forEach(dado => {
    dado.disabled = false;
    dado.classList.remove("rolando");
});

atualizarPainel();
iniciarTimerAFK();

        info.textContent = `ADM adicionou 🎲${valor} para ${nomes[jogadorAtual]}.`;
    });
});

const admProximoTurno = document.getElementById("adm-proximo-turno");

if (admProximoTurno) {
    admProximoTurno.addEventListener("click", () => {
        if (!modoADM) return;
        passarTurno();
    });
}

const admTurnoAnterior = document.getElementById("adm-turno-anterior");

if (admTurnoAnterior) {
    admTurnoAnterior.addEventListener("click", () => {
        if (!modoADM) return;

        limparTurno();

        jogadorAtual--;

        if (jogadorAtual < 0) jogadorAtual = 3;

        atualizarPainel();
        info.textContent = `ADM voltou para ${nomes[jogadorAtual]}.`;
    });
}

document.querySelectorAll(".adm-virar-jogador").forEach(botao => {
    botao.addEventListener("click", () => {
        if (!modoADM) return;

        pararTimerAFK();
        limparTurno();

        animando = false;
        dadoTravado = false;

        botoesDados.forEach(dado => {
            dado.disabled = false;
            dado.classList.remove("rolando");
        });

        jogadorAtual = Number(botao.dataset.jogador);

        atualizarPainel();
        info.textContent = `ADM mudou para ${nomes[jogadorAtual]}.`;
    });
});
const admMandarGol = document.getElementById("adm-mandar-gol");

if (admMandarGol) {
    admMandarGol.addEventListener("click", () => {

        const pecaIndex = progresso[jogadorAtual].findIndex(p => p >= 0 && p < GOL);

        if (pecaIndex === -1) {
            alert("Nenhuma peça disponível para mandar ao gol!");
            return;
        }

        progresso[jogadorAtual][pecaIndex] = GOL;
        golsFeitos[jogadorAtual][pecaIndex] = true;

        tocarSomAleatorio(sonsGol);

        renderizarPeca(jogadorAtual, pecaIndex);
        verificarVitoria(jogadorAtual);
        atualizarPainel();

        info.textContent =
            `👑 ADM mandou uma peça do ${nomes[jogadorAtual]} para o gol!`;
    });
}
["click", "mousemove", "keydown", "touchstart"].forEach(evento => {
    document.addEventListener(evento, registrarAtividadeJogador);
});

const telaLobby = document.getElementById("tela-lobby");
const inputNick = document.getElementById("nick");
const selectAvatar = document.getElementById("avatar");
const inputCodigoSala = document.getElementById("codigo-sala");
const btnCriarSala = document.getElementById("btn-criar-sala");
const btnEntrarSala = document.getElementById("btn-entrar-sala");

function gerarCodigoSala() {
    const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let codigo = "";

    for (let i = 0; i < 6; i++) {
        codigo += letras[Math.floor(Math.random() * letras.length)];
    }

    return codigo;
}

btnCriarSala.addEventListener("click", () => {
    meuNick = inputNick.value.trim() || "Jogador";
    meuAvatar = selectAvatar.value;
    salaAtual = gerarCodigoSala();
    souHost = true;

    socket.emit("criarSala", {
    codigo: salaAtual,
    nick: meuNick,
    avatar: meuAvatar,
    idUnico: meuIdUnico
});
});

btnEntrarSala.addEventListener("click", () => {
    meuNick = inputNick.value.trim() || "Jogador";
    meuAvatar = selectAvatar.value;
    const campoCodigo = document.getElementById("codigo-sala");

if (!campoCodigo) {
    mostrarAviso("❌ Campo código da sala não encontrado no HTML!");
    return;
}

salaAtual = campoCodigo.value.trim().toUpperCase();

    if (!salaAtual) {
        mostrarAviso("Digite o código da sala!");
        return;
    }

    socket.emit("entrarSala", {
    codigo: salaAtual,
    nick: meuNick,
    avatar: meuAvatar,
    idUnico: meuIdUnico
});
});

function aplicarDadosOnline(dados) {
    salaAtual = dados.codigo;
    meuJogador = dados.jogador;
    souHost = dados.host === true || meuJogador === 0;
    localStorage.setItem("ludoSalaAtual", salaAtual);
localStorage.setItem("ludoNick", meuNick);
localStorage.setItem("ludoAvatar", meuAvatar);
localStorage.setItem("ludoJogador", meuJogador);
    jogadoresDaSala = dados.jogadores;

console.log("MEU JOGADOR:", meuJogador);
console.log("NICK:", meuNick);

    mostrarAviso(`Sala: ${salaAtual} | Você é ${nomes[meuJogador]}`);

    document.getElementById("codigo-sala").value = salaAtual;

    const nomeCard = document.querySelector(
        `.card-jogador[data-jogador="${meuJogador}"] .nome-card`
    );

    const avatarCard = document.querySelector(
        `.card-jogador[data-jogador="${meuJogador}"] .avatar-jogador`
    );

    if (nomeCard) nomeCard.textContent = meuNick;
    if (avatarCard) avatarCard.textContent = meuAvatar;

    btnCriarSala.disabled = true;
    btnEntrarSala.disabled = true;

    info.textContent = `Sala ${salaAtual} criada. Passe esse código para o outro jogador.`;
    atualizarPainelSala(jogadoresDaSala);
}

socket.on("salaCriada", aplicarDadosOnline);
socket.on("entrouSala", aplicarDadosOnline);

socket.on("jogadoresAtualizados", (jogadores) => {
    jogadoresDaSala = jogadores;

    jogadores.forEach((j, i) => {
        const nomeCard = document.querySelector(
            `.card-jogador[data-jogador="${i}"] .nome-card`
        );

        const avatarCard = document.querySelector(
            `.card-jogador[data-jogador="${i}"] .avatar-jogador`
        );

        if (nomeCard) nomeCard.textContent = j.nick;
        if (avatarCard) avatarCard.textContent = j.avatar;

        atualizarPainelSala(jogadores);
    });
});

socket.on("erroSala", (msg) => {
    mostrarAviso(msg);

    localStorage.removeItem("ludoSalaAtual");
    localStorage.removeItem("ludoNick");
    localStorage.removeItem("ludoAvatar");
    localStorage.removeItem("ludoJogador");

    salaAtual = null;
    meuJogador = null;
    souHost = false;
    jogadoresDaSala = [];

    btnCriarSala.disabled = false;
    btnEntrarSala.disabled = false;

    if (painelSala) {
        painelSala.style.display = "none";
    }
});

const painelSala = document.getElementById("painel-sala");
const codigoSalaOnline = document.getElementById("codigo-sala-online");
const contadorJogadoresOnline = document.getElementById("contador-jogadores-online");
const listaJogadoresOnline = document.getElementById("lista-jogadores-online");
const btnIniciarPartida = document.getElementById("btn-iniciar-partida");

function atualizarPainelSala(jogadores) {
    if (!painelSala) return;

    painelSala.style.display = "block";

    codigoSalaOnline.textContent = salaAtual || "----";
    contadorJogadoresOnline.textContent = `Jogadores: ${jogadores.length}/4`;

    listaJogadoresOnline.innerHTML = jogadores.map((j, i) => {
        return `
            <div class="jogador-online">
                <strong>${j.avatar} ${j.nick}</strong>
                <span>${nomes[i]}</span>
            </div>
        `;
    }).join("");

    if (souHost) {
        btnIniciarPartida.style.display = "block";

       btnIniciarPartida.disabled = false;

if (jogadores.length === 1) {
    btnIniciarPartida.textContent = "🎮 Iniciar Teste";
} else {
    btnIniciarPartida.textContent = "🎮 Iniciar Partida";
}
    }
}

btnIniciarPartida.addEventListener("click", () => {
    if (!souHost) return;

    if (jogadoresDaSala.length < 1) {
    mostrarAviso("🚫 Precisa de pelo menos 1 jogador!");
    return;
}
    socket.emit("iniciarPartida", salaAtual);
});

socket.on("partidaIniciada", () => {
    telaLobby.style.display = "none";
    mostrarAviso("🎲 Partida iniciada!");
    iniciarTimerAFK();
});

function aplicarEstadoOnline(estado) {
    recebendoEstadoOnline = true;

    jogadorAtual = estado.jogadorAtual;
    progresso = estado.progresso;
    golsFeitos = estado.golsFeitos;
    ranking = estado.ranking;
    jogadoresFinalizados = estado.jogadoresFinalizados;

    dadosPendentes = estado.dadosPendentes || [];
    bonusGiros = estado.bonusGiros || 0;
    seisSeguidos = estado.seisSeguidos || 0;

    for (let j = 0; j < 4; j++) {
        for (let p = 0; p < 4; p++) {
            renderizarPeca(j, p);
        }
    }

    atualizarPainel();

    info.textContent = `Vez de ${nomes[jogadorAtual]}.`;

    animando = false;
    dadoTravado = false;

    botoesDados.forEach(dado => {
        dado.disabled = false;
        dado.classList.remove("rolando");
    });

    recebendoEstadoOnline = false;
}

socket.on("estadoAtualizado", (estado) => {
    if (animandoMovimentoOnline) {
        estadoPendenteOnline = estado;
        return;
    }

    aplicarEstadoOnline(estado);
});

socket.on("dadoRolado", async (dados) => {
    const botao = document.querySelector(
        `.dado-card[data-jogador="${dados.jogador}"]`
    );

    if (!botao) return;
    
    tocarSomAleatorio(sonsDadoGiro);

    const visual = botao.querySelector(".dado-3d");

    botao.classList.add("rolando");
    visual.textContent = "🎲";

    await esperar(500);

    botao.classList.remove("rolando");
    visual.textContent = facesDado[dados.numero];

    const cardDados = document.querySelector(
        `.card-jogador[data-jogador="${dados.jogador}"] .dados-card`
    );

    if (cardDados) {
        cardDados.textContent = `Dados: 🎲${dados.numero}`;
    }
});

socket.on("pecaMovendo", async (dados) => {
    recebendoEstadoOnline = true;
    animandoMovimentoOnline = true;

    progresso[dados.jogador][dados.pecaIndex] = dados.progressoInicial;

    await moverPeca(
        dados.jogador,
        dados.pecaIndex,
        dados.passos
    );

    animandoMovimentoOnline = false;
    recebendoEstadoOnline = false;

    if (estadoPendenteOnline) {
        aplicarEstadoOnline(estadoPendenteOnline);
        estadoPendenteOnline = null;
    }
});

function estadoAtualCompleto() {
    return {
        sala: salaAtual,
        jogadorAtual,
        progresso,
        golsFeitos,
        ranking,
        jogadoresFinalizados,
        dadosPendentes,
        bonusGiros,
        seisSeguidos
    };
}

socket.on("alguemPediuEstado", (destino) => {
    if (!salaAtual) return;

    socket.emit("responderEstado", {
        destino,
        estado: estadoAtualCompleto()
    });
});

function pedirResyncOnline() {
    if (!salaAtual) {
        mostrarAviso("Você não está em uma sala!");
        return;
    }

    mostrarAviso("🔄 Sincronizando com a sala...");
    socket.emit("pedirEstado", salaAtual);
}

document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "r") {
        pedirResyncOnline();
    }
});

socket.on("somComer", () => {
    tocarSomAleatorio(sonsComer);
});

document.addEventListener("visibilitychange", () => {
    if (!document.hidden && salaAtual) {
        pedirResyncOnline();
    }
});

const btnSyncOnline = document.getElementById("btn-sync-online");

if (btnSyncOnline) {
    btnSyncOnline.addEventListener("click", () => {
        pedirResyncOnline();
    });
}

socket.on("hostAtualizado", (novoHostId) => {
    souHost = socket.id === novoHostId;

    atualizarPainelSala(jogadoresDaSala);

    if (souHost) {
        mostrarAviso("👑 Você virou o novo líder da sala!");
    }
});

window.addEventListener("load", () => {
    const salaSalva = localStorage.getItem("ludoSalaAtual");
    const nickSalvo = localStorage.getItem("ludoNick");
    const avatarSalvo = localStorage.getItem("ludoAvatar");

    if (!salaSalva || !meuIdUnico) return;

    socket.emit("reconectarSala", {
        codigo: salaSalva,
        nick: nickSalvo,
        avatar: avatarSalvo,
        idUnico: meuIdUnico
    });
});

