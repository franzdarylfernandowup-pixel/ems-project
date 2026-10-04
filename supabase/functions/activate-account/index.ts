import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { SMTPClient } from "https://deno.land/x/denomailer/mod.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

  // Send the real email via Gmail SMTP
  let emailSent = true
  try {
    const client = new SMTPClient({
      connection: {
        hostname: "smtp.gmail.com",
        port: 465,
        tls: true,
        auth: {
          username: Deno.env.get("GMAIL_USER"),
          password: Deno.env.get("GMAIL_APP_PASSWORD"),
        },
      },
    })

    await client.send({
      from: Deno.env.get("GMAIL_USER"),
      to: profile.email,
      subject: "Your FND's Firm account is ready",
      content: `Hi ${profile.full_name},\n\nYour account has been activated.\n\nUsername: ${username}\nPassword: ${password}\n\nPlease log in and change your username on first login.`,
      html: `
        <p>Hi ${profile.full_name},</p>
        <p>Your account has been activated. Here are your login details:</p>
        <p><b>Username:</b> ${username}<br><b>Password:</b> ${password}</p>
        <p>You'll be asked to set a new username the first time you log in.</p>
      `,
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