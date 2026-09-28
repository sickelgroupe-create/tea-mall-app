import QRCode from "qrcode";

// Byte segments avoid qrcode's browser-only TextEncoder dependency without
// mutating global APIs. Lone surrogates encode as the replacement character.
export function utf8Bytes(value) {
	const bytes = [];
	for (const character of String(value)) {
		let cp = character.codePointAt(0);
		if (cp >= 0xd800 && cp <= 0xdfff) cp = 0xfffd;
		if (cp < 0x80) bytes.push(cp);
		else if (cp < 0x800) bytes.push(0xc0 | (cp >> 6), 0x80 | (cp & 63));
		else if (cp < 0x10000) bytes.push(0xe0 | (cp >> 12), 0x80 | ((cp >> 6) & 63), 0x80 | (cp & 63));
		else bytes.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 63), 0x80 | ((cp >> 6) & 63), 0x80 | (cp & 63));
	}
	return new Uint8Array(bytes);
}

export function createInviteQr(value) {
	return QRCode.create([{ data: utf8Bytes(value), mode: "byte" }], { errorCorrectionLevel: "M" });
}
