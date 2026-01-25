# DreamScale Email Templates for Supabase

This folder contains branded email templates for Supabase authentication emails.

## 📧 Magic Link Template

The `magic-link-template.html` file contains a fully branded DreamScale email template for magic link authentication.

### How to Use

1. **Go to Supabase Dashboard**
   - Visit https://supabase.com/dashboard
   - Select your DreamScale project
   - Navigate to **Authentication** → **Email Templates**

2. **Edit the Magic Link Template**
   - Find the "Magic Link" template
   - Click **Edit** or **Customize**

3. **Copy the Template**
   - Open `magic-link-template.html` in this folder
   - Copy the entire HTML content
   - Paste it into the Supabase email template editor

4. **Update the Logo URL** (Important!)
   - The template uses `{{ .SiteURL }}/Logo.png` for the logo
   - Make sure your logo is accessible at: `https://yourdomain.com/Logo.png`
   - Or replace it with a full CDN URL if you host the logo elsewhere
   - Example: `https://dreamscale.app/Logo.png`

5. **Save and Test**
   - Click **Save** in Supabase
   - Test by requesting a magic link from your login page
   - Check your email to see the branded template

### Template Variables

The template uses these Supabase variables:
- `{{ .ConfirmationURL }}` - The magic link URL
- `{{ .Email }}` - User's email address
- `{{ .SiteURL }}` - Your app's base URL
- `{{ .Year }}` - Current year (if available)

### Brand Colors Used

- **Primary Blue**: `#005DFF`
- **Dark Blue**: `#0048CC`
- **Background**: `#f5f5f5`
- **Text**: `#1a1a1a` (dark), `#4a4a4a` (medium), `#666666` (light)

### Features

✅ Fully branded with DreamScale logo and colors
✅ Responsive design (works on mobile and desktop)
✅ Professional gradient header
✅ Clear call-to-action button
✅ Security notice
✅ Alternative link for copy-paste
✅ Footer with contact information

### Notes

- The logo must be publicly accessible via URL
- Test the template after saving to ensure all links work
- The template is HTML-only (no external CSS dependencies)
- All styling is inline for maximum email client compatibility

### Troubleshooting

**Logo not showing?**
- Check that `/Logo.png` is accessible at your site URL
- Try using a full URL: `https://yourdomain.com/Logo.png`
- Or upload the logo to a CDN and use that URL

**Template not updating?**
- Clear your browser cache
- Wait a few minutes for Supabase to propagate changes
- Try requesting a new magic link

**Styling issues?**
- Some email clients (like Gmail) strip certain CSS
- The template uses inline styles for maximum compatibility
- Test in multiple email clients if possible