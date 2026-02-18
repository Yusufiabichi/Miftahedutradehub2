import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const serviceId = pathParts[pathParts.length - 1];

    // GET all services or single service
    if (req.method === 'GET') {
      if (serviceId && serviceId !== 'services-api') {
        const { data, error } = await supabaseClient
          .from('services')
          .select('*')
          .eq('id', serviceId)
          .eq('is_active', true)
          .single();

        if (error) throw error;

        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data, error } = await supabaseClient
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST - Create new service
    if (req.method === 'POST') {
      const body = await req.json();

      // 1. Get the user from the token you just fixed
      const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
      if (authError || !user) throw new Error("Unauthenticated");

      // 2. Attach the user.id to the record
      const { data, error } = await supabaseClient
        .from('services')
        .insert([{ 
          ...body, 
          user_id: user.id 
        }])
        .select()
        .single();

      if (error) throw error;
      // ... return response
      return new Response(JSON.stringify({ 
        error: error.message,
        details: error.details || "No extra details" 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400, // This is what you see in the console
      });
    }

    // PUT - Update service
    if (req.method === 'PUT') {
      const body = await req.json();
      const { data, error } = await supabaseClient
        .from('services')
        .update({ ...body, updated_at: new Date().toISOString() })
        .eq('id', serviceId)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // DELETE - Delete service
    if (req.method === 'DELETE') {
      const { error } = await supabaseClient
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});