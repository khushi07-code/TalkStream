
// import { Server } from "socket.io";

// let connections = {}
// let messages = {}
// let timeOnline = {}


// const connectToSocket = (server) => {
//     const io = new Server(server, {
//         cors: {
//             origin: "*",
//             methods: ["GET", "POST", "DELETE", "PUT"],
//             allowedHeaders: ["*"],
//             credentials: true
//         }
//     });

//     io.on("connection", (socket) => {
//         const path = socket.handshake.query.path || "default";

//         if (!connections[path]) {
//             connections[path] = [];
//             messages[path] = []; // initialize chat history
//         }
//         connections[path].push(socket.id)
//         timeOnline[socket.id] = new Date();

//         for (let a = 0; a < connections[path].length; a++) {
//             io.to(connections[path][a]).emit("user-joined", socket.id, connections[path]);
//         }

//         for (let a = 0; a < messages[path].length; a++) {
//             io.to(socket.id).emit(
//                 "chat-message",
//                 messages[path][a].data,
//                 messages[path][a].sender,
//                 messages[path][a]["socket-id-sender"]
//             );
//         }


//     })
//     io.on("signal", (toId, message) => {
//         io.to(toId).emit("signal", socket.id, message);
//     })
//     io.on("chat-message", (data, sender) => {
//         const [matchingRoom, found] = Object.entries(connections).reduce(([room, isFound], [roomKey, roomValue]) => {
//             if (!isFound && Array.isArray(roomValue) && roomValue.includes(socket.id)) {
//                 return [roomKey, true];
//             }
//             return [room, isFound];
//         }, ["", false]);

//         if (found) {
//             if (messages[matchingRoom] === undefined) {
//                 messages[matchingRoom] = []
//             }
//             messages[matchingRoom].push({ sender, data, "socket-id-sender": socket.id })

//             console.log("message", matchingRoom, ":", sender, data);

//             connections[matchingRoom].forEach((elem) => {
//                 io.to(elem).emit("chat-message", data, sender, socket.id)
//             })
//         }
//     })
//     io.on("disconnect", () => {
//         var diffTime = Math.abs(Date.now() - timeOnline[socket.id]);
//         var key;

//         for (const [k, v] of Object.entries(connections)) {
//             for (let a = 0; a < v.length; ++a) {
//                 if (v[a] === socket.id) {
//                     key = k

//                     for (let a = 0; a < connections[key].length; ++a) {
//                         io.to(connections[key][a]).emit("user-left", socket.id)
//                     }
//                     var index = connections[key].indexOf(socket.id);
//                     connections[key].splice(index, 1)
//                     if (connections[key].length === 0) {
//                         delete connections[key];
//                     }
//                 }

//             }
//         }

//     })
//     return io;
// };

// export default connectToSocket;


import { Server } from "socket.io";

const connectToSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });
  io.on("connection", (socket) => {
    console.log("connected");

    socket.on("join-call", (roomId) => {

      socket.join(roomId);

      const clients = Array.from(
        io.sockets.adapter.rooms.get(roomId) || []
      );

      // Send existing users to new user
      socket.emit("user-joined", socket.id, clients);

      // Notify others
      socket.to(roomId).emit("user-joined", socket.id, clients);

      // Relay WebRTC signals
      socket.on("signal", (toId, message) => {
        io.to(toId).emit("signal", socket.id, message);
      });

      // Chat messages
      socket.on("chat-message", (data, sender) => {
        console.log(data,sender);
        io.in(roomId).emit("chat-message", data, sender, socket.id);
      });

      // Handle disconnect
      socket.on("disconnect", () => {
        console.log("disconnect")
        socket.to(roomId).emit("user-left", socket.id);
      });
    });

  });

  return io;
};

export default connectToSocket;
