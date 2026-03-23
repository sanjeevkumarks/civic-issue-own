let io = null;

const setIO = (serverIO) => {
  io = serverIO;
};

const getIO = () => io;

module.exports = { setIO, getIO };
