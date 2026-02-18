import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Email notification function using Resend
async function sendEmailNotification(inquiry: {
  service_name: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  message: string;
  budget_range?: string;
  timeline?: string;
}) {
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
  const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') || 'admin@example.com';
  
  if (!RESEND_API_KEY) {
    console.log('RESEND_API_KEY not configured, skipping email notification');
    return null;
  }

  const budgetLabels: Record<string, string> = {
    'under-1000': 'Under ₦1,000',
    '1000-5000': '₦1,000 - ₦5,000',
    '5000-10000': '₦5,000 - ₦10,000',
    '10000-50000': '₦10,000 - ₦50,000',
    'over-50000': 'Over ₦50,000',
  };

  const timelineLabels: Record<string, string> = {
    'urgent': 'Urgent (Within 1 week)',
    '1-2-weeks': '1-2 weeks',
    '2-4-weeks': '2-4 weeks',
    '1-3-months': '1-3 months',
    'flexible': 'Flexible',
  };

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .field { margin-bottom: 20px; }
        .label { font-weight: bold; color: #374151; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
        .value { margin-top: 5px; padding: 12px; background: white; border-radius: 6px; border: 1px solid #e5e7eb; }
        .message-box { background: white; padding: 15px; border-left: 4px solid #1e3a8a; border-radius: 0 6px 6px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        .cta-button { display: inline-block; background: #1e3a8a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .service-badge { background: #dbeafe; color: #1e3a8a; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 24px;">📋 New Service Inquiry</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">You have received a new service inquiry</p>
        </div>
        <div class="content">
          <div style="text-align: center; margin-bottom: 25px;">
            <span class="service-badge">${inquiry.service_name}</span>
          </div>
          
          <div class="grid">
            <div class="field">
              <div class="label">Customer Name</div>
              <div class="value">${inquiry.name}</div>
            </div>
            <div class="field">
              <div class="label">Email Address</div>
              <div class="value"><a href="mailto:${inquiry.email}" style="color: #1e3a8a;">${inquiry.email}</a></div>
            </div>
          </div>
          
          <div class="grid">
            <div class="field">
              <div class="label">Phone Number</div>
              <div class="value">${inquiry.phone}</div>
            </div>
            <div class="field">
              <div class="label">Company</div>
              <div class="value">${inquiry.company || 'Not provided'}</div>
            </div>
          </div>
          
          <div class="grid">
            <div class="field">
              <div class="label">Budget Range</div>
              <div class="value">${inquiry.budget_range ? budgetLabels[inquiry.budget_range] || inquiry.budget_range : 'Not specified'}</div>
            </div>
            <div class="field">
              <div class="label">Timeline</div>
              <div class="value">${inquiry.timeline ? timelineLabels[inquiry.timeline] || inquiry.timeline : 'Not specified'}</div>
            </div>
          </div>
          
          <div class="field">
            <div class="label">Message</div>
            <div class="message-box">${inquiry.message}</div>
          </div>
          
          <center>
            <a href="mailto:${inquiry.email}?subject=Re: Inquiry about ${encodeURIComponent(inquiry.service_name)}" class="cta-button">
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
        from: 'Service Inquiries <onboarding@resend.dev>',
        to: [ADMIN_EMAIL],
        subject: `New Service Inquiry: ${inquiry.service_name} - from ${inquiry.name}`,
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
  // Handle CORS preflight
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
    const inquiryId = pathParts[pathParts.length - 1];

    // GET all inquiries or single inquiry
    if (req.method === 'GET') {
      if (inquiryId && inquiryId !== 'service-inquiries-api') {
        const { data, error } = await supabaseClient
          .from('service_inquiries')
          .select('*')
          .eq('id', inquiryId)
          .single();

        if (error) {
          console.error('GET single error:', error);
          throw error;
        }

        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data, error } = await supabaseClient
        .from('service_inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('GET all error:', error);
        throw error;
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST - Create new inquiry
    if (req.method === 'POST') {
      const body = await req.json();
      console.log('Received inquiry data:', body);

      const { data, error } = await supabaseClient
        .from('service_inquiries')
        .insert([{
          service_name: body.service_name,
          name: body.name,
          email: body.email,
          phone: body.phone,
          company: body.company || null,
          message: body.message,
          budget_range: body.budget_range || null,
          timeline: body.timeline || null,
          status: 'new'
        }])
        .select()
        .single();

      if (error) {
        console.error('POST error:', error);
        throw error;
      }

      console.log('Inquiry created successfully:', data);

      // Send email notification (non-blocking)
      sendEmailNotification({
        service_name: body.service_name,
        name: body.name,
        email: body.email,
        phone: body.phone,
        company: body.company,
        message: body.message,
        budget_range: body.budget_range,
        timeline: body.timeline,
      }).catch(err => console.error('Email notification error:', err));

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      });
    }

    // PUT - Update inquiry status
    if (req.method === 'PUT') {
      const body = await req.json();
      const { data, error } = await supabaseClient
        .from('service_inquiries')
        .update({ ...body, updated_at: new Date().toISOString() })
        .eq('id', inquiryId)
        .select()
        .single();

      if (error) {
        console.error('PUT error:', error);
        throw error;
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // DELETE - Delete inquiry
    if (req.method === 'DELETE') {
      const { error } = await supabaseClient
        .from('service_inquiries')
        .delete()
        .eq('id', inquiryId);

      if (error) {
        console.error('DELETE error:', error);
        throw error;
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    });
  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.toString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
