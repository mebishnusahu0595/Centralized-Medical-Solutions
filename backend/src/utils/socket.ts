import { Server } from 'socket.io';

let io: Server;

export const initSocket = (socketIo: Server) => {
  io = socketIo;

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join hospital room
    socket.on('join_hospital', (hospitalId: string) => {
      socket.join(`hospital_${hospitalId}`);
      console.log(`User ${socket.id} joined hospital room: ${hospitalId}`);
    });

    // Join user-specific room for private notifications
    socket.on('join_user', (userId: string) => {
      socket.join(`user_${userId}`);
      console.log(`User ${socket.id} joined user room: ${userId}`);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

export const emitToHospital = (hospitalId: string, event: string, data: any) => {
  if (io) {
    io.to(`hospital_${hospitalId}`).emit(event, data);
  }
};

export const emitToUser = (userId: string, event: string, data: any) => {
  if (io) {
    io.to(`user_${userId}`).emit(event, data);
  }
};

export const emitToAll = (event: string, data: any) => {
  if (io) {
    io.emit(event, data);
  }
};
