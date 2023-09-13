const { User } = require("../models");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const SECRET_key = "tainguyen";
const expiresIn = '10h';

const register = async (req, res) => {
    let {id, name, email, password, avatar } = req.body;
    const hashPassword = bcrypt.hashSync(password, 10);
    try {
        let user = null;
        if(!avatar || !id) {
            avatar = gravatar.url(email, { s: '100', r: 'x', d: 'retro' }, true);
            user = await User.create({ name, email, password: hashPassword, avatar, follower: Math.floor(Math.random() * 1000), liked: Math.floor(Math.random() * 1000), disliked: Math.floor(Math.random() * 1000) });
        }
        else {
            user = await User.create({id, name, email, password: hashPassword, avatar, follower: Math.floor(Math.random() * 1000), liked: Math.floor(Math.random() * 1000), disliked: Math.floor(Math.random() * 1000) });
        }
        res.status(201).json({ user });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (user && bcrypt.compareSync(password, user.password)) {
            const token = jwt.sign({ data: user }, SECRET_key, { expiresIn });
            res.cookie('token', token, { maxAge: 10 * 60 * 60 * 1000 });
            res.status(200).json({ token });
        }
        else {
            res.status(401).json({ error: "Invalid login" });
        }
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateUser = async (req, res) => {
    const { name, avatar, roomId } = req.body;
    const { id } = req.params;
    try {
        await User.update({name, avatar, roomId }, { where: { id } });
        res.status(200).json({ message: "Update user successfully" });
        return;
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getUserById = async (req, res) => {
    const id = req.params.id || req.body.id || req.query.id;
    const user = await User.findOne({ where: { id: id } });
    res.status(200).json(user);
};

const upLoadAvatar = async (req, res) => {
    const { file } = req;
    const urlImg = `http://localhost:3000/${file.path}`;
    const id = req.params.id || req.body.id || req.query.id;
    try {
        const user = await User.findByPk(id);
        user.avatar = urlImg;
        await user.save();
        res.status(200).send(user);
    }
    catch (error) {
        res.status(500).send(error);
    }
}

const logout_removeCookie = (req, res) => {
    try {
        res.clearCookie('token');
        res.status(200).json({ message: "Logout successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getAllUsers = async (req, res) => {
    try {
        const id = req.params.id || req.body.id || req.query.id;
        const users = await User.findAll({where: {roomId:id}});
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({error: error.message});   
    }
}

const getUserByRoom = async (id) => {
    try {
        const query = "SELECT u.name, u.avatar, u.id FROM users u JOIN rooms r ON u.roomId = r.id WHERE r.roomNumber = " + id;
        const users = await User.sequelize.query(query, { type: User.sequelize.QueryTypes.SELECT });
        return users;
    } catch (error) {
        console.log(error);
    }
}

const outRoom = async (id) => {
    try {
        await User.update({roomId: null}, {where: {id}});
    } catch (error) {
        console.log(error);
    }
}

const updateLikeDislikeFollow = async (req, res) => {
    const id = req.params.id || req.body.id || req.query.id;
    const {liked, disliked, follower} = req.body;
    try {
        await User.update({liked, disliked, follower}, {where: {id}});
        res.status(200).json({message: "Update successfully"});
    }
    catch (error) {
        res.status(500).json({error: error.message});
    }
}

module.exports = {
    register,
    login,
    SECRET_key,
    updateUser,
    getUserById,
    upLoadAvatar,
    logout_removeCookie,
    getAllUsers,
    getUserByRoom,
    outRoom,
    updateLikeDislikeFollow
};