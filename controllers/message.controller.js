const {Message} = require('../models');

const getMessageByIdRoom = async (req, res) => {
    const idRoom = req.params.id || req.body.id || req.query.id;
    try {
        let query = `SELECT u.id, u.avatar, u.name, m.message, m.createdAt FROM messages m
        JOIN users u ON u.id = m.userId
        JOIN rooms r ON r.id = m.roomId
        WHERE r.id = ${idRoom}
        ORDER BY m.createdAt`;
        const data = await Message.sequelize.query(query, { type: Message.sequelize.QueryTypes.SELECT });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

const saveMessage = async (req, res) => {
    const {message, userId, roomId, isLinkLocation, date} = req.body;
    try {
        const newMessage = await Message.create({message, userId, roomId, isLinkLocation, time: date});
        res.status(201).json(newMessage);
    }
    catch (error) {
        res.status(500).json({error: error.message});
    }
};

module.exports = {
    saveMessage,
    getMessageByIdRoom
}