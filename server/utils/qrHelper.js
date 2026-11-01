import QRCode from 'qrcode';

export const generateQRCode = async (data) => {
  try {
    const textData = typeof data === 'string' ? data : JSON.stringify(data);
    const qrDataUrl = await QRCode.toDataURL(textData, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 250,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
    return qrDataUrl;
  } catch (error) {
    console.error('Error generating QR Code:', error);
    return '';
  }
};

