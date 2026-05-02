import QRCode from 'qrcode';

export const generateQRCode = async (data: any): Promise<string> => {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(data));
    return qrCodeDataUrl;
  } catch (err) {
    console.error('Failed to generate QR Code', err);
    return '';
  }
};
