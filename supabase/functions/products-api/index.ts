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
    const productId = pathParts[pathParts.length - 1];

    // GET all products or single product
    if (req.method === 'GET') {
      // Check if user is authenticated (for admin access to all products)
      const authHeader = req.headers.get('Authorization');
      let isAdmin = false;
      
      if (authHeader) {
        try {
          const { data: { user } } = await supabaseClient.auth.getUser();
          isAdmin = !!user;
        } catch (error) {
          // Not authenticated, treat as public access
          isAdmin = false;
        }
      }

      if (productId && productId !== 'products-api') {
        const query = supabaseClient
          .from('products')
          .select('*')
          .eq('id', productId);
        
        // Only filter by is_active for public access
        if (!isAdmin) {
          query.eq('is_active', true);
        }

        const { data, error } = await query.single();

        if (error) throw error;

        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const query = supabaseClient
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Only filter by is_active for public access
      if (!isAdmin) {
        query.eq('is_active', true);
      }

      const { data, error } = await query;

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // For POST, PUT, DELETE - require authentication
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ code: 401, message: 'Unauthorized - Authentication required' }), 
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      );
    }

    // POST - Create new product
    if (req.method === 'POST') {
      const body = await req.json();
      const { data, error } = await supabaseClient
        .from('products')
        .insert([body])
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      });
    }

    // PUT - Update product
    if (req.method === 'PUT') {
      const body = await req.json();
      const { data, error } = await supabaseClient
        .from('products')
        .update({ ...body, updated_at: new Date().toISOString() })
        .eq('id', productId)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // DELETE - Delete product
    if (req.method === 'DELETE') {
      const { error } = await supabaseClient
        .from('products')
        .delete()
        .eq('id', productId);

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