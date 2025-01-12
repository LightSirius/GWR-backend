export function isEmpty(obj) {
  if (obj == null) return true;
  if (obj.length === 0) return true;
  if (Object.keys(obj).length === 0) return true;

  return false;
}

export function createRandomString(length) {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomArray = new Uint8Array(length);
  crypto.getRandomValues(randomArray);
  randomArray.forEach((number) => {
    result += chars[number % chars.length];
  });
  return result;
}
