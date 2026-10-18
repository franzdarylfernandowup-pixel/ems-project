import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { SMTPClient } from "https://deno.land/x/denomailer/mod.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function buildActivationEmail(fullName: string, username: string, password: string, appUrl?: string) {
  const name = escapeHtml(fullName)
  const user = escapeHtml(username)
  const pass = escapeHtml(password)

  const button = appUrl
    ? `<tr>
        <td style="padding:8px 32px 0 32px;">
          <a href="${appUrl}" style="display:inline-block;background:#0a0a0a;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:14px 28px;border-radius:8px;">Log in to your account</a>
        </td>
      </tr>`
    : ""

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f4f4f5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:#171717;">

          <tr>
            <td style="background:#0a0a0a;padding:28px 32px;">
              <span style="font-size:22px;font-weight:700;letter-spacing:0.5px;color:#ffffff;">FND's FIRM</span>
            </td>
          </tr>

          <tr>
            <td style="padding:32px 32px 8px 32px;">
              <h1 style="margin:0;font-size:24px;line-height:1.3;color:#0a0a0a;">Your account is ready</h1>
              <p style="margin:12px 0 0 0;font-size:15px;line-height:1.6;color:#525252;">
                Hi ${name},<br>
                Your account has been activated. Use the details below to log in.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:16px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;border:1px solid #e5e5e5;border-radius:12px;">
                <tr>
                  <td style="padding:16px 20px 4px 20px;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#737373;">Username</td>
                </tr>
                <tr>
                  <td style="padding:0 20px 12px 20px;font-family:Consolas,'Courier New',monospace;font-size:18px;font-weight:700;color:#0a0a0a;">${user}</td>
                </tr>
                <tr>
                  <td style="padding:0 20px 4px 20px;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#737373;">Password</td>
                </tr>
                <tr>
                  <td style="padding:0 20px 16px 20px;font-family:Consolas,'Courier New',monospace;font-size:18px;font-weight:700;color:#0a0a0a;">${pass}</td>
                </tr>
              </table>
            </td>
          </tr>

          ${button}

          <tr>
            <td style="padding:24px 32px 28px 32px;">
              <p style="margin:0;font-size:13px;line-height:1.6;color:#737373;">
                For your security, you'll be asked to set a new username the first time you log in.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 32px;background:#fafafa;border-top:1px solid #e5e5e5;font-size:12px;line-height:1.5;color:#a3a3a3;">
              This is an automated message from FND's Firm. Please don't reply to this email.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

Deno.serve(async (req) => {
  // Browsers send a preflight OPTIONS request before the real one — must answer it
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  const { employeeId, email } = await req.json()

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL"),
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  )

  const { data: profile, error: findError } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .ilike("employee_id", employeeId.trim())
    .ilike("email", email.trim())
    .maybeSingle()

  if (findError || !profile) {
    return Response.json({ status: "not_found" }, { status: 404, headers: corsHeaders })
  }
  if (profile.activated) {
    return Response.json({ status: "already_activated" }, { status: 409, headers: corsHeaders })
  }

  const digits = profile.employee_id.replace(/\D/g, "")
  const username = `id${digits}`
  const password = `FND@${digits}`

  const { data: authUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: profile.email,
    password,
    email_confirm: true,
  })

  if (createError) {
    return Response.json({ status: "error", message: createError.message }, { status: 500, headers: corsHeaders })
  }

  await supabaseAdmin
    .from("profiles")
    .update({
      auth_id: authUser.user.id,
      username,
      activated: true,
    })
    .eq("employee_id", profile.employee_id)

  // Send the real email via Brevo SMTP
  let emailSent = true
  try {
    const client = new SMTPClient({
      connection: {
        hostname: "smtp-relay.brevo.com",
        port: 465,
        tls: true,
        auth: {
          username: Deno.env.get("BREVO_SMTP_LOGIN"),
          password: Deno.env.get("BREVO_SMTP_KEY"),
        },
      },
    })

    await client.send({
      from: `FND's Firm <${Deno.env.get("BREVO_SENDER_EMAIL")}>`,
      to: profile.email,
      subject: "Your FND's Firm account is ready",
      content: `Hi ${profile.full_name},\n\nYour account has been activated.\n\nUsername: ${username}\nPassword: ${password}\n\nYou'll be asked to set a new username the first time you log in.`,
      html: buildActivationEmail(profile.full_name, username, password, Deno.env.get("APP_URL")),
    })

    await client.close()
  } catch (emailError) {
    console.error("Email send failed:", emailError)
    emailSent = false
  }

  return Response.json({
    status: "ok",
    defaultUsername: username,
    defaultPassword: password,
    emailSent,
  }, { headers: corsHeaders })
})