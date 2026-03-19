// src/types/crypto.d.ts
export {};

declare global {
  interface Crypto {
    subtle: SubtleCrypto;
    getRandomValues<T extends ArrayBufferView>(array: T): T;
  }
  
  interface SubtleCrypto {
    encrypt(
      algorithm: AlgorithmIdentifier | RsaOaepParams | AesCtrParams | AesCbcParams | AesGcmParams,
      key: CryptoKey,
       BufferSource
    ): Promise<ArrayBuffer>;
    
    decrypt(
      algorithm: AlgorithmIdentifier | RsaOaepParams | AesCtrParams | AesCbcParams | AesGcmParams,
      key: CryptoKey,
       BufferSource
    ): Promise<ArrayBuffer>;
    
    importKey(
      format: "raw" | "pkcs8" | "spki" | "jwk",
      keyData: BufferSource | JsonWebKey,
      algorithm: AlgorithmIdentifier | RsaHashedImportParams | EcKeyImportParams | HmacImportParams | AesKeyAlgorithm,
      extractable: boolean,
      keyUsages: KeyUsage[]
    ): Promise<CryptoKey>;
    
    deriveKey(
      algorithm: AlgorithmIdentifier | EcdhKeyDeriveParams | HkdfParams | Pbkdf2Params,
      baseKey: CryptoKey,
      derivedKeyType: AlgorithmIdentifier | AesKeyAlgorithm | HmacImportParams,
      extractable: boolean,
      keyUsages: KeyUsage[]
    ): Promise<CryptoKey>;
    
    deriveBits(
      algorithm: AlgorithmIdentifier | EcdhKeyDeriveParams | HkdfParams | Pbkdf2Params,
      baseKey: CryptoKey,
      length: number
    ): Promise<ArrayBuffer>;
  }
}
