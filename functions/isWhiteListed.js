const isWhitelisted = (chat, groups) => {
	return groups.some(
		(group) =>
			group.name === (chat?.username?.toString() ?? "") ||
			group.channelId === (chat?.id?.toString() ?? "")
	);
};

module.exports = { isWhitelisted };
