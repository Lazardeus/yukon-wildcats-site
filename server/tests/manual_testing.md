# Frontend Testing Checklist

## Authentication
- [ ] Login form displays by default
- [ ] Invalid credentials show error message
- [ ] Valid admin login shows admin panel
- [ ] Valid owner login shows owner panel
- [ ] Logout button works and returns to login form
- [ ] Session persists after page reload
- [ ] Cannot access admin features without authentication

## Content Management
- [ ] Content tab loads correctly
- [ ] Can select different sections
- [ ] Can update hero section text
- [ ] Can update about section text
- [ ] Can update services section text
- [ ] Can update community updates
- [ ] Changes appear immediately after update

## Team Management
- [ ] Team tab loads correctly
- [ ] Can select team members
- [ ] Can update team member titles
- [ ] Can upload new team member photos
- [ ] Preview shows current team data
- [ ] Changes reflect immediately after update

## Photo Management
- [ ] Photos tab loads correctly
- [ ] Can view current service icons
- [ ] Can upload new service icons
- [ ] Can update company logo
- [ ] Preview shows current images
- [ ] Changes reflect immediately after update

## Form Submissions
- [ ] Submissions tab loads correctly
- [ ] Can view all form submissions
- [ ] Submissions are sorted by date
- [ ] All submission details are visible
- [ ] New submissions appear in the list

## Responsive Design
- [ ] Admin panel works on desktop (1024px+)
- [ ] Admin panel works on tablet (768px)
- [ ] Admin panel works on mobile (480px)
- [ ] Forms are usable on all screen sizes
- [ ] Navigation is accessible on all devices

## Security
- [ ] Cannot access admin panel without login
- [ ] Session expires after timeout
- [ ] Cannot bypass authentication with direct URLs
- [ ] File uploads are restricted to images
- [ ] API endpoints require valid token