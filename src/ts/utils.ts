import { isValidNumber } from 'libphonenumber-js';

export const isEmpty = (text: any) => {
  const txt = typeof text === 'string' ? text.trim() : text;

  if (
    (txt !== 0 && !txt) ||
    txt === '' ||
    txt === null ||
    txt === 'null' ||
    txt === ' ' ||
    txt === undefined ||
    txt === 'undefined'
  ) {
    return true;
  }
  return false;
};

export function getNumberAfterPossiblyEliminatingZero(
  code: string,
  number: string
) {
  if (number.length > 0 && number.startsWith('0')) {
    number = number.substring(1);
    return { number, formattedNumber: code ? `${code}${number}` : number };
  } else {
    return { number, formattedNumber: code ? `${code}${number}` : number };
  }
}

export const isValidPhoneNumber = (countryCode: string, number: string) => {
  try {
    const parsedNumber = getNumberAfterPossiblyEliminatingZero(
      countryCode,
      number
    )?.formattedNumber?.replace(/\s+/g, '');
    return isValidNumber(parsedNumber);
  } catch (err) {
    return false;
  }
};

export function removeWhitespace(str: string): string {
  return str.replace(/\s+/g, '');
}

export function toEnglishNumber(strNum: any) {
  var ar = '٠١٢٣٤٥٦٧٨٩'.split('');
  var en = '0123456789'.split('');
  strNum = strNum.replace(/[٠١٢٣٤٥٦٧٨٩]/g, (x: any) => en[ar.indexOf(x)]);
  return strNum;
}
