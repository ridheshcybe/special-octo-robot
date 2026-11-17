// Minimal Deno globals for TypeScript compilation of Edge Functions
declare const Deno: {
  env: {
    get(name: string): string | undefined;
    set?(name: string, value: string): void;
  };
  // serve is used in the edge functions; we type it loosely
  serve(handler: (req: Request) => Response | Promise<Response>, opts?: any): void;
};
