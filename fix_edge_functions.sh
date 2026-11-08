#!/usr/bin/env bash

# Exit on any error
set -e

# 1️⃣ Install Supabase JS client (adds proper typings)
echo "Installing @supabase/supabase-js..."
npm install @supabase/supabase-js

# 2️⃣ Add minimal Deno type declarations for the compiler
DENOTYPE="deno.d.ts"
if [ ! -f "$DENOTYPE" ]; then
  cat <<'EOF' > "$DENOTYPE"
// Minimal Deno globals for TypeScript compilation of Edge Functions
declare const Deno: {
  env: {
    get(name: string): string | undefined;
    set?(name: string, value: string): void;
  };
  // serve is used in the edge functions; we type it loosely
  serve(handler: (req: Request) => Response | Promise<Response>, opts?: any): void;
};
EOF
  echo "Created $DENOTYPE"
else
  echo "$DENOTYPE already exists"
fi

# 3️⃣ Replace remote Supabase import with local package import in all edge functions
echo "Updating edge function imports..."
find supabase/functions -type f -name 'index.ts' | while read -r file; do
  # Use sed to replace the exact import line
  # It may appear with double quotes or single quotes; handle both
  if grep -q "https://esm.sh/@supabase/supabase-js" "$file"; then
    sed -i '' "s|import { createClient[^;]*;|import { createClient } from '@supabase/supabase-js';|" "$file"
    echo "Updated $file"
  fi
done

# 4️⃣ Ensure TypeScript includes the deno.d.ts file (add to tsconfig if missing)
TSCONFIG="tsconfig.json"
if ! grep -q "deno.d.ts" "$TSCONFIG"; then
  # Insert into the "include" array or create one if missing
  if grep -q '"include"' "$TSCONFIG"; then
    # Append to the existing include array (assume JSON format with trailing ] )
    perl -0777 -i -pe 's/("include"\s*:\s*\[)([^\]]*)(\])/\1$2, "deno.d.ts"\3/s' "$TSCONFIG"
    echo "Added deno.d.ts to tsconfig include array"
  else
    # Add a new include field after the opening brace
    perl -0777 -i -pe 's/\{\s*/{\n  "include": ["deno.d.ts"],\n  /' "$TSCONFIG"
    echo "Created include array with deno.d.ts in tsconfig"
  fi
fi

# 5️⃣ Run TypeScript type‑checking (next build) to verify
echo "Running Next.js build to verify..."
npm run build

echo "All done! Edge functions are now using the local Supabase client and Deno types are provided."
