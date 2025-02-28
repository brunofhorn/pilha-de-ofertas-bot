require("dotenv").config();
const prisma = require("../lib/prisma.js");

const getAllGroups = async (req, res) => {
	try {
		const groups = await prisma.group.findMany({
			orderBy: { createdAt: "desc" },
		});
		res.json(groups);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const createGroup = async (req, res) => {
	try {
		const { name, source, channelId } = req.body;

		const promotion = await prisma.group.create({
			data: {
				name,
				source,
				channelId,
			},
		});

		res.status(201).json(promotion);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const updateGroup = async (req, res) => {
	const { id } = req.params;
	const data = req.body;

	if (!id || Object.keys(data).length === 0) {
		return res.status(400).json({ error: "ID ou dados inválidos" });
	}

	try {
		const { name, channelId, source } = data;

		const updatedGroup = await prisma.group.update({
			data: {
				name,
				channelId,
				source,
			},
			where: {
				id: Number(id),
			},
		});

		return res.status(200).json(updatedGroup);
	} catch (error) {
		return res
			.status(500)
			.json({ error: `Erro ao atualizar o grupo. ${error.message}` });
	}
};

const deleteGroup = async (req, res) => {
	const { id } = req.params;

	if (!id) {
		return res.status(400).json({ error: "ID inválido." });
	}

	try {
		const deletedGroup = await prisma.group.delete({
			where: {
				id: Number(id),
			},
		});

		return res.status(200).json(deletedGroup);
	} catch (error) {
		return res
			.status(500)
			.json({ error: `Erro ao deletar o grupo. ${error.message}` });
	}
};

module.exports = { getAllGroups, createGroup, updateGroup, deleteGroup };
