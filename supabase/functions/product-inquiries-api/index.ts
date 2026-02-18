import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Email notification function using Resend
async function sendEmailNotification(inquiry: {
  customer_name: string;
  email: string;
  phone: string;
  product_name: string;
  message: string;
}) {
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
  const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') || 'admin@example.com';
  
  if (!RESEND_API_KEY) {
    console.log('RESEND_API_KEY not configured, skipping email notification');
    return null;
  }

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .field { margin-bottom: 20px; }
        .label { font-weight: bold; color: #374151; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
        .value { margin-top: 5px; padding: 12px; background: white; border-radius: 6px; border: 1px solid #e5e7eb; }
        .message-box { background: white; padding: 15px; border-left: 4px solid #10b981; border-radius: 0 6px 6px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        .cta-button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 24px;">🛒 New Product Inquiry</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">You have received a new inquiry</p>
        </div>
        <div class="content">
          <div class="field">
            <div class="label">Customer Name</div>
            <div class="value">${inquiry.customer_name}</div>
          </div>
          <div class="field">
            <div class="label">Email Address</div>
            <div class="value"><a href="mailto:${inquiry.email}" style="color: #10b981;">${inquiry.email}</a></div>
          </div>
          <div class="field">
            <div class="label">Phone Number</div>
            <div class="value">${inquiry.phone || 'Not provided'}</div>
          </div>
          <div class="field">
            <div class="label">Product Interested In</div>
            <div class="value" style="font-weight: 600; color: #10b981;">${inquiry.product_name}</div>
          </div>
          <div class="field">
            <div class="label">Message</div>
            <div class="message-box">${inquiry.message || 'No message provided'}</div>
          </div>
          <center>
            <a href="mailto:${inquiry.email}?subject=Re: Inquiry about ${encodeURIComponent(inquiry.product_name)}" class="cta-button">
              Reply to Customer
            </a>
          </center>
        </div>
        <div class="footer">
          <p>This is an automated notification from your website.</p>
          <p>© ${new Date().getFullYear()} Your Company. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Product Inquiries <onboarding@resend.dev>',
        to: [ADMIN_EMAIL],
        subject: `New Product Inquiry: ${inquiry.product_name} - from ${inquiry.customer_name}`,
        html: emailHtml,
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('Email send failed:', result);
      return null;
    }
    
    console.log('Email notification sent successfully:', result.id);
    return result;
  } catch (error) {
    console.error('Error sending email notification:', error);
    return null;
  }
}

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
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];

    // POST new inquiry (public access - no auth required)
    if (req.method === 'POST') {
      const body = await req.json();
      const { data, error } = await supabaseClient
        .from('product_inquiries')
        .insert([body])
        .select()
        .single();

      if (error) throw error;

      // Send email notification (non-blocking)
      sendEmailNotification({
        customer_name: body.customer_name,
        email: body.email,
        phone: body.phone,
        product_name: body.product_name,
        message: body.message,
      }).catch(err => console.error('Email notification error:', err));

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // For GET, PUT, DELETE - require authentication (admin only)
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ code: 401, message: 'Unauthorized - Authentication required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET all inquiries
    if (req.method === 'GET' && (!id || id === 'product-inquiries-api')) {
      const { data, error } = await supabaseClient
        .from('product_inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET single inquiry
    if (req.method === 'GET' && id && id !== 'product-inquiries-api') {
      const { data, error } = await supabaseClient
        .from('product_inquiries')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // PUT update inquiry
    if (req.method === 'PUT' && id && id !== 'product-inquiries-api') {
      const body = await req.json();
      const { data, error } = await supabaseClient
        .from('product_inquiries')
        .update(body)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // DELETE inquiry
    if (req.method === 'DELETE' && id && id !== 'product-inquiries-api') {
      const { error } = await supabaseClient
        .from('product_inquiries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});