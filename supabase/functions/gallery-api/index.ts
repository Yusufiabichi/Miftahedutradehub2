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
    const galleryId = pathParts[pathParts.length - 1];

    // GET all gallery items or single item
    if (req.method === 'GET') {
      // Check if user is authenticated (for admin access to all items)
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

      if (galleryId && galleryId !== 'gallery-api') {
        const query = supabaseClient
          .from('gallery')
          .select('*')
          .eq('id', galleryId);
        
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
        .from('gallery')
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

    // POST - Create new gallery item
    if (req.method === 'POST') {
      const body = await req.json();
      const { data, error } = await supabaseClient
        .from('gallery')
        .insert([body])
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        return new Response(
          JSON.stringify({ error: error.message || 'Failed to create gallery item' }), 
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      });
    }

    // PUT - Update gallery item
    if (req.method === 'PUT') {
      if (!galleryId || galleryId === 'gallery-api') {
        return new Response(
          JSON.stringify({ error: 'Gallery item ID is required' }), 
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }

      const body = await req.json();
      const { data, error } = await supabaseClient
        .from('gallery')
        .update({ ...body, updated_at: new Date().toISOString() })
        .eq('id', galleryId)
        .select()
        .single();

      if (error) {
        console.error('Supabase update error:', error);
        return new Response(
          JSON.stringify({ error: error.message || 'Failed to update gallery item' }), 
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // DELETE - Delete gallery item
    if (req.method === 'DELETE') {
      if (!galleryId || galleryId === 'gallery-api') {
        return new Response(
          JSON.stringify({ error: 'Gallery item ID is required for deletion' }), 
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }

      console.log('Attempting to delete gallery item:', galleryId);

      const { error } = await supabaseClient
        .from('gallery')
        .delete()
        .eq('id', galleryId);

      if (error) {
        console.error('Supabase delete error:', error);
        return new Response(
          JSON.stringify({ error: error.message || 'Failed to delete gallery item from database' }), 
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }

      console.log('Successfully deleted gallery item:', galleryId);

      return new Response(
        JSON.stringify({ success: true, message: 'Gallery item deleted successfully' }), 
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    });
  } catch (error) {
    console.error('Gallery API error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        details: error.toString()
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});