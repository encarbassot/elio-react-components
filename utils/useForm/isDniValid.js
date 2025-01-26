export function isDniNieValid(id) {
  // Remove spaces and convert to uppercase
  id = id.replace(/\s/g, '').toUpperCase();

  // Regular expressions for valid DNI and NIE formats
  const dniRegex = /^[0-9]{8}[A-Z]$/;
  const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/;

  if (dniRegex.test(id)) {
    // Check validity of DNI
    const letter = 'TRWAGMYFPDXBNJZSQVHLCKE';
    const lastChar = id.charAt(8);
    const num = parseInt(id, 10);
    return letter.charAt(num % 23) === lastChar;
  } else if (nieRegex.test(id)) {
    // Check validity of NIE
    const nieFirstChar = id.charAt(0);
    const nieNum = id.substr(1, 7);
    const nieLastChar = id.charAt(8);

    let firstCharNum;
    if (nieFirstChar === 'X') {
      firstCharNum = 0;
    } else if (nieFirstChar === 'Y') {
      firstCharNum = 1;
    } else if (nieFirstChar === 'Z') {
      firstCharNum = 2;
    }

    const fullNIE = firstCharNum + nieNum;

    return 'TRWAGMYFPDXBNJZSQVHLCKE'.charAt(fullNIE % 23) === nieLastChar;
  } else {
    return false; // Neither DNI nor NIE format
  }
}
