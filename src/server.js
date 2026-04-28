import "dotenv/config";
import app from "./app.js";
import { createServer } from "http";
import { init } from "../socketManager.js"; //Para iniciar el servidor con socket.io

// Para que inicie el servidor de socket.io con HTTP
const httpServer = createServer(app);
const io = init(httpServer);

// Confirmar conexión del servidor con socket.io en consola
io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);
});

httpServer.listen(4000, () => console.log(`Servidor listo en puerto 4000`));