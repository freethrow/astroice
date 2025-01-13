/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
declare module 'astro:assets' {
    export interface ImageMetadata {
      src: string;
      width: number;
      height: number;
      format: string;
    }
  }