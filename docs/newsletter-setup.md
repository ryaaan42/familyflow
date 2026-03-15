# Setup emails personnalisés & newsletter (PLANILLE)

## Ce qui est déjà prêt
- Templates email en base (`email_templates`) pour:
  - confirmation d'inscription,
  - bienvenue,
  - reset mot de passe.
- Module admin `Newsletter` (accessible uniquement aux admins) pour:
  - éditer les templates,
  - créer des campagnes,
  - marquer une campagne comme envoyée et compter les destinataires opt-in.

## Ce qu'il faut brancher pour un envoi réel
1. **Provider email transactionnel**: Resend, Postmark, Brevo, Mailgun, etc.
2. **Clé API serveur** en variable d'environnement (ex: `RESEND_API_KEY`).
3. **Domaine d'envoi vérifié** (SPF + DKIM + DMARC).
4. **Adresse expéditeur** (ex: `hello@planille.app`).
5. **Webhooks** (optionnel) pour tracking bounce/spam/open.

## Variables recommandées
```bash
EMAIL_PROVIDER=resend
EMAIL_FROM="PLANILLE <hello@planille.app>"
EMAIL_REPLY_TO="support@planille.app"
RESEND_API_KEY=re_xxx
```

## Remarques
- La colonne `users.newsletter_opt_in` est utilisée pour cibler uniquement les utilisateurs consentants.
- L'action admin `sendNewsletterCampaign` inclut un TODO explicite pour brancher l'envoi réel via provider.
