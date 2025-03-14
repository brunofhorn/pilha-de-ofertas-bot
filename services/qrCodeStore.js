let qrCode = null;

module.exports = {
    setQr: (code) => { qrCode = code; },
    getQr: () => qrCode
};
