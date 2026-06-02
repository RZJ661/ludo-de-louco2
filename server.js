const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

const salas = {};

io.on("connection", (socket) => {
    console.log("Jogador conectado:", socket.id);

    socket.on("reconectarSala", (dados) => {
    const sala = salas[dados.codigo];

    if (!sala) {
        socket.emit("erroSala", "Sala não existe mais!");
        return;
    }

    const jogadorAntigo = sala.jogadores[dados.jogador];

    if (!jogadorAntigo) {
        socket.emit("erroSala", "Jogador não encontrado nessa sala!");
        return;
    }

    sala.jogadores[dados.jogador] = {
        id: socket.id,
        idUnico: dados.idUnico,
        nick: dados.nick,
        avatar: dados.avatar
    };

    socket.join(dados.codigo);

    socket.emit("entrouSala", {
    codigo: dados.codigo,
    jogador: dados.jogador,
    jogadores: sala.jogadores,
    host: sala.host === socket.id
});

    io.to(dados.codigo).emit("jogadoresAtualizados", sala.jogadores);

    socket.to(dados.codigo).emit("alguemPediuEstado", socket.id);
});

    socket.on("criarSala", (dados) => {
        const codigo = dados.codigo;

        if (salas[codigo]) {
            socket.emit("erroSala", "Essa sala já existe!");
            return;
        }

      salas[codigo] = {
    host: socket.id,
    partidaIniciada: false,
    jogadores: [
        {
            id: socket.id,
            idUnico: dados.idUnico,
            nick: dados.nick,
            avatar: dados.avatar
        }
    ]
};

        socket.join(codigo);

        socket.emit("salaCriada", {
            codigo,
            jogador: 0,
            jogadores: salas[codigo].jogadores
        });

        io.to(codigo).emit(
            "jogadoresAtualizados",
            salas[codigo].jogadores
        );

        console.log("Sala criada:", codigo);
    });

    socket.on("entrarSala", (dados) => {
        const codigo = dados.codigo;

        if (!salas[codigo]) {
            socket.emit("erroSala", "Sala não existe!");
            return;
        }

        const nickExiste = salas[codigo].jogadores.some(j =>
    j.nick.toLowerCase() === dados.nick.toLowerCase()
);

if (nickExiste) {
    socket.emit("erroSala", "Esse nick já está em uso nessa sala!");
    return;
}

        if (salas[codigo].jogadores.length >= 4) {
            socket.emit("erroSala", "Sala cheia!");
            return;
        }

        const numeroJogador = salas[codigo].jogadores.length;

        salas[codigo].jogadores.push({
            id: socket.id,
            nick: dados.nick,
            avatar: dados.avatar
        });

        socket.join(codigo);

        socket.emit("entrouSala", {
            codigo,
            jogador: numeroJogador,
            jogadores: salas[codigo].jogadores
        });

        io.to(codigo).emit(
            "jogadoresAtualizados",
            salas[codigo].jogadores
        );

        console.log("Jogador entrou na sala:", codigo);
    });

    socket.on("iniciarPartida", (codigo) => {
        const sala = salas[codigo];

        if (!sala) return;

        if (sala.host !== socket.id) {
            socket.emit("erroSala", "Só o host pode iniciar a partida!");
            return;
        }

        if (sala.jogadores.length < 1) {
    socket.emit("erroSala", "Precisa de pelo menos 1 jogador!");
    return;
}

        sala.partidaIniciada = true;
        io.to(codigo).emit("partidaIniciada");
    });

    socket.on("sincronizarEstado", (estado) => {
        socket.to(estado.sala).emit("estadoAtualizado", estado);
    });

    socket.on("dadoRolado", (dados) => {
    socket.to(dados.sala).emit("dadoRolado", dados);
});

socket.on("pecaMovendo", (dados) => {
    socket.to(dados.sala).emit("pecaMovendo", dados);
});

socket.on("somComer", (dados) => {
    io.to(dados.sala).emit("somComer");
});

socket.on("pedirEstado", (sala) => {
    socket.to(sala).emit("alguemPediuEstado", socket.id);
});

socket.on("responderEstado", (dados) => {
    io.to(dados.destino).emit("estadoAtualizado", dados.estado);
});

    socket.on("disconnect", () => {
    console.log("Jogador saiu:", socket.id);

    for (const codigo in salas) {
        const sala = salas[codigo];

        const index = sala.jogadores.findIndex(j => j.id === socket.id);

        if (index === -1) continue;

        if (sala.partidaIniciada) {
            sala.jogadores[index].desconectado = true;

            io.to(codigo).emit("jogadoresAtualizados", sala.jogadores);
            return;
        }

        sala.jogadores.splice(index, 1);

        if (sala.jogadores.length === 0) {
            delete salas[codigo];
            console.log("Sala apagada:", codigo);
            return;
        }

        if (sala.host === socket.id) {
            sala.host = sala.jogadores[0].id;
            console.log("Novo host da sala", codigo, ":", sala.host);
        }

        io.to(codigo).emit("jogadoresAtualizados", sala.jogadores);
        io.to(codigo).emit("hostAtualizado", sala.host);

        return;
    }
});
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});