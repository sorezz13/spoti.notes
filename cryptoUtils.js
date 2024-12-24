// Derive a key from the Spotify user ID
export async function deriveKeyFromSpotify(userId) {
    const salt = "a-secure-static-salt";
    const iterations = 100000;
    const encoder = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      encoder.encode(userId),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );
    return await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: encoder.encode(salt),
        iterations: iterations,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-CBC", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
  }
  
  // Encrypt data using the derived key
  export async function encryptData(key, data) {
    const iv = window.crypto.getRandomValues(new Uint8Array(16));
    const encoder = new TextEncoder();
    const encrypted = await window.crypto.subtle.encrypt(
      { name: "AES-CBC", iv },
      key,
      encoder.encode(data)
    );
    return {
      iv: Array.from(iv),
      encrypted: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    };
  }
  
  // Decrypt data using the derived key
  export async function decryptData(key, ivArray, encryptedData) {
    const iv = new Uint8Array(ivArray);
    const encrypted = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-CBC", iv },
      key,
      encrypted
    );
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }
  