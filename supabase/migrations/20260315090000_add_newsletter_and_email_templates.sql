alter table public.users
  add column if not exists newsletter_opt_in boolean not null default true;

create table if not exists public.email_templates (
  key text primary key,
  label text not null,
  subject text not null,
  preview_text text not null default '',
  html_content text not null,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.newsletter_campaigns (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subject text not null,
  preheader text not null default '',
  html_content text not null,
  status text not null default 'draft' check (status in ('draft', 'sent')),
  recipient_count integer not null default 0,
  sent_at timestamptz,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create or replace trigger email_templates_updated_at
  before update on public.email_templates
  for each row execute function public.set_updated_at();

alter table public.email_templates enable row level security;
alter table public.newsletter_campaigns enable row level security;

create policy "email_templates_admin_read"
  on public.email_templates for select
  using (public.is_app_admin());

create policy "email_templates_admin_write"
  on public.email_templates for all
  using (public.is_app_admin());

create policy "newsletter_campaigns_admin_read"
  on public.newsletter_campaigns for select
  using (public.is_app_admin());

create policy "newsletter_campaigns_admin_write"
  on public.newsletter_campaigns for all
  using (public.is_app_admin());

insert into public.email_templates (key, label, subject, preview_text, html_content) values
  (
    'signup_confirm',
    'Confirmation d''inscription',
    'Confirmez votre compte PLANILLE',
    'Activez votre espace en un clic.',
    '<!doctype html><html lang="fr"><body style="margin:0;background:#f3f5ff;font-family:Inter,Arial,sans-serif;color:#1a1f36;"><table width="100%" cellpadding="0" cellspacing="0" style="padding:24px;"><tr><td align="center"><table width="620" cellpadding="0" cellspacing="0" style="max-width:620px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #d9e4ff;"><tr><td style="padding:28px 32px;background:linear-gradient(135deg,#3559e6,#6d5ef4,#00a9ff);color:#ffffff;"><h1 style="margin:0;font-size:26px;line-height:1.2;">Bienvenue sur PLANILLE ✨</h1><p style="margin:10px 0 0;font-size:14px;opacity:.9;">Votre foyer passe en mode organisation premium.</p></td></tr><tr><td style="padding:30px 32px;"><p style="margin:0 0 14px;font-size:16px;">Bonjour {{display_name}},</p><p style="margin:0 0 20px;font-size:15px;line-height:1.6;">Merci pour votre inscription. Cliquez sur le bouton ci-dessous pour confirmer votre adresse email et finaliser votre compte.</p><p style="margin:0 0 24px;"><a href="{{action_url}}" style="display:inline-block;padding:12px 18px;border-radius:12px;background:#3559e6;color:#fff;text-decoration:none;font-weight:700;">Confirmer mon compte</a></p><p style="margin:0;color:#68708f;font-size:13px;line-height:1.6;">Si le bouton ne fonctionne pas, copiez ce lien :<br/>{{action_url}}</p></td></tr></table></td></tr></table></body></html>'
  ),
  (
    'signup_welcome',
    'Email de bienvenue',
    'PLANILLE est prêt pour votre famille',
    'Démarrez votre première semaine en 3 étapes.',
    '<!doctype html><html lang="fr"><body style="margin:0;background:#f3f5ff;font-family:Inter,Arial,sans-serif;color:#1a1f36;"><table width="100%" cellpadding="0" cellspacing="0" style="padding:24px;"><tr><td align="center"><table width="620" cellpadding="0" cellspacing="0" style="max-width:620px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #d9e4ff;"><tr><td style="padding:26px 32px;background:#0f172a;color:#fff;"><p style="margin:0;font-size:12px;letter-spacing:.08em;text-transform:uppercase;opacity:.75;">PLANILLE</p><h2 style="margin:10px 0 0;font-size:24px;">Votre foyer, mieux organisé.</h2></td></tr><tr><td style="padding:30px 32px;"><p style="margin:0 0 14px;font-size:16px;">Bonjour {{display_name}},</p><p style="margin:0 0 20px;font-size:15px;line-height:1.6;">Votre espace est prêt. Voici votre démarrage rapide :</p><ul style="margin:0 0 20px;padding-left:18px;color:#1f2a44;line-height:1.8;"><li>Ajoutez les membres du foyer.</li><li>Activez vos modules (tâches, budget, repas).</li><li>Lancez votre premier planning en 1 clic.</li></ul><p style="margin:0;"><a href="{{dashboard_url}}" style="display:inline-block;padding:12px 18px;border-radius:12px;background:#6d5ef4;color:#fff;text-decoration:none;font-weight:700;">Ouvrir mon tableau de bord</a></p></td></tr></table></td></tr></table></body></html>'
  ),
  (
    'reset_password',
    'Réinitialisation mot de passe',
    'Réinitialisez votre mot de passe PLANILLE',
    'Votre lien de sécurité est prêt.',
    '<!doctype html><html lang="fr"><body style="margin:0;background:#f3f5ff;font-family:Inter,Arial,sans-serif;color:#1a1f36;"><table width="100%" cellpadding="0" cellspacing="0" style="padding:24px;"><tr><td align="center"><table width="620" cellpadding="0" cellspacing="0" style="max-width:620px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #d9e4ff;"><tr><td style="padding:26px 32px;background:linear-gradient(120deg,#0ea5e9,#3559e6);color:#fff;"><h2 style="margin:0;font-size:24px;">Sécurité de votre compte</h2></td></tr><tr><td style="padding:30px 32px;"><p style="margin:0 0 14px;font-size:16px;">Bonjour {{display_name}},</p><p style="margin:0 0 20px;font-size:15px;line-height:1.6;">Nous avons reçu une demande de réinitialisation de mot de passe. Cliquez ci-dessous pour choisir un nouveau mot de passe.</p><p style="margin:0 0 22px;"><a href="{{action_url}}" style="display:inline-block;padding:12px 18px;border-radius:12px;background:#3559e6;color:#fff;text-decoration:none;font-weight:700;">Réinitialiser mon mot de passe</a></p><p style="margin:0;color:#68708f;font-size:13px;line-height:1.6;">Si vous n''êtes pas à l''origine de cette demande, ignorez simplement ce message.</p></td></tr></table></td></tr></table></body></html>'
  )
on conflict (key) do nothing;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, display_name, newsletter_opt_in)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(coalesce(new.email, 'PLANILLE'), '@', 1)),
    coalesce((new.raw_user_meta_data ->> 'newsletter_opt_in')::boolean, true)
  )
  on conflict (id) do update
  set email = excluded.email,
      display_name = excluded.display_name,
      newsletter_opt_in = excluded.newsletter_opt_in,
      updated_at = timezone('utc', now());

  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;
