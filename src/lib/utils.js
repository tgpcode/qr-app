import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"


export function cn(...inputs) {
     return twMerge(clsx(inputs))
}

// CRC16-CCITT (0xFFFF) Implementation for VietQR
function crc16(data) {
     let crc = 0xFFFF;
     for (let i = 0; i < data.length; i++) {
          crc ^= data.charCodeAt(i) << 8;
          for (let j = 0; j < 8; j++) {
               if ((crc & 0x8000) !== 0) crc = (crc << 1) ^ 0x1021;
               else crc = crc << 1;
          }
     }
     return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function generateVietQR({ bankBin = "970422", bankNumber = "0354424361", amount = "0", content = "" }) {
     // 00: Version (01)
     // 01: Type (11 - Dynamic, 12 - Static) -> 12
     let frame = "000201010212";

     // 38: Payment Info (GUID + Service)
     // GUID: 0010A000000727
     // Service Code (Beneficiary Bank): 01 
     // 00: GUID (0010A000000727)
     // 01: BNPL/Bank BinAndAcc

     // Simplified VietQR Structure:
     // 38 (Merchant Acct Info)
     //    00 (GUID): A000000727
     //    01 (Beneficiary Org): 
     //         00 (BENEFICIARY_ID): 970422 (MB)
     //         01 (MERCHANT_ID): [Account Number]

     const guid = "0010A000000727";
     const paymentInfo = `00${guid.length}${guid}01${(bankBin.length + bankNumber.length + 4)}${`00${bankBin.length}${bankBin}01${bankNumber.length}${bankNumber}`}`;
     frame += `38${paymentInfo.length}${paymentInfo}`;

     // 53: Currency (704 - VND)
     frame += "5303704";

     // 54: Amount
     if (amount && Number(amount) > 0) {
          frame += `54${amount.length.toString().padStart(2, '0')}${amount}`;
     }

     // 58: Country Code (VN)
     frame += "5802VN";

     // 62: Additional Data Field
     // 08: Purpose/Content
     if (content) {
          const contentStr = `08${content.length.toString().padStart(2, '0')}${content}`;
          frame += `62${contentStr.length.toString().padStart(2, '0')}${contentStr}`;
     } else {
          // Default message required? Not strictly.
     }

     // 63: CRC (placeholder)
     frame += "6304";

     // Calculate CRC
     const crc = crc16(frame);
     return frame + crc;
}
