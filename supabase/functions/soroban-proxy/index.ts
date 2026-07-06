import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SorobanRpcRequest {
  jsonrpc: "2.0";
  id: number;
  method: string;
  params: unknown;
}

interface SorobanRpcResponse {
  jsonrpc: string;
  id: number;
  result?: unknown;
  error?: { code: number; message: string };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();

    // Proxy to Soroban Testnet RPC
    const rpcUrl = "https://soroban-testnet.stellar.org";
    const rpcBody: SorobanRpcRequest = {
      jsonrpc: "2.0",
      id: body.id ?? 1,
      method: body.method,
      params: body.params ?? {},
    };

    const rpcRes = await fetch(rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(rpcBody),
    });

    const rpcData: SorobanRpcResponse = await rpcRes.json();

    return new Response(JSON.stringify(rpcData), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
