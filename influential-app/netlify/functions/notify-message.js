// netlify/functions/notify-message.js
// Envía un email al destinatario cuando recibe un mensaje nuevo.
// Requiere: RESEND_API_KEY en Netlify env vars.

const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://lbcgqkoyhhiywfwjvqth.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY
  if (!RESEND_API_KEY) {
    return { statusCode: 500, body: 'RESEND_API_KEY not configured' }
  }

  let body
  try {
    body = JSON.parse(event.body)
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' }
  }

  const { recipientId, senderName, messagePreview } = body
  if (!recipientId || !senderName) {
    return { statusCode: 400, body: 'Missing recipientId or senderName' }
  }

  // Obtener el email del destinatario desde Supabase (service role)
  const { data: userData, error: userError } = await supabase.auth.admin.getUserById(recipientId)
  if (userError || !userData?.user?.email) {
    return { statusCode: 404, body: 'Recipient not found' }
  }

  const recipientEmail = userData.user.email
  const recipientName  = userData.user.user_metadata?.name || ''

  // Enviar email via Resend
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from:    'Influential <onboarding@resend.dev>',
      to:      recipientEmail,
      subject: `Nuevo mensaje de ${senderName} en Influential`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:2rem;">
          <img src="https://influential-app.netlify.app/logo192.png" alt="Influential" style="height:40px;margin-bottom:1.5rem;" />
          <h2 style="color:#111;margin:0 0 0.5rem;">Nuevo mensaje</h2>
          <p style="color:#555;margin:0 0 1.5rem;">
            <strong>${senderName}</strong> te escribió en Influential:
          </p>
          <div style="background:#f7f4ff;border-left:4px solid #6339e0;padding:1rem 1.25rem;border-radius:0 8px 8px 0;margin-bottom:1.5rem;">
            <p style="margin:0;color:#333;font-style:italic;">"${messagePreview}"</p>
          </div>
          <a href="https://influential-app.netlify.app/messages"
             style="display:inline-block;padding:0.75rem 1.5rem;background:#6339e0;color:#fff;text-decoration:none;border-radius:24px;font-weight:600;">
            Ver mensaje
          </a>
          <p style="color:#aaa;font-size:0.75rem;margin-top:2rem;">
            Influential — Conectando marcas con creadores de contenido.
          </p>
        </div>
      `,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('Resend error:', err)
    return { statusCode: 500, body: 'Email send failed' }
  }

  return { statusCode: 200, body: 'OK' }
}
