# Production Deployment Checklist

Complete this checklist before deploying to production.

## ✅ Pre-Deployment Tasks

### Code Quality
- [x] Remove all `console.log()` statements
- [x] Remove development documentation files
- [x] Update plugin metadata (author, URI, etc.)
- [x] Verify all TypeScript types are correct
- [ ] Run production build and test
- [ ] Minify assets

### Security
- [x] API keys use WordPress options (not hardcoded)
- [x] Bot protection (honeypot) implemented
- [ ] Rate limiting on email submissions
- [ ] CSRF tokens on all forms
- [ ] Input sanitization verified
- [ ] SQL injection prevention confirmed
- [ ] XSS protection verified

### Performance
- [ ] Test with large zone counts (10+ zones)
- [ ] Verify weather API caching works (3 hour cache)
- [ ] Check bundle size is optimized
- [ ] Test on slow 3G connection
- [ ] Verify lazy loading of admin components

### Accessibility
- [ ] WCAG 2.1 AA compliance verified
- [ ] Keyboard navigation tested
- [ ] Screen reader tested (NVDA/JAWS)
- [ ] Color contrast checked (4.5:1 minimum)
- [ ] Focus indicators visible
- [ ] ARIA labels on all interactive elements

### Responsive Design
- [ ] Test on 375px (iPhone SE)
- [ ] Test on 768px (iPad)
- [ ] Test on 1024px (laptop)
- [ ] Test on 1920px (desktop)
- [ ] Test landscape orientation on mobile

### Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] iOS Safari
- [ ] Chrome Mobile

### WordPress Integration
- [ ] Plugin activates without errors
- [ ] Database table created successfully
- [ ] Shortcode `[irrigation_calculator]` works
- [ ] No CSS conflicts (irc- prefix verified)
- [ ] No JavaScript conflicts
- [ ] Works with default WordPress themes
- [ ] Works with popular page builders (Elementor, etc.)

### API Configuration
- [ ] OpenWeatherMap API key configured
- [ ] Google Places API key configured
- [ ] Google Places API restricted to domain
- [ ] SendGrid API key configured (optional)
- [ ] API error handling tested
- [ ] API rate limits understood

### Email Functionality
- [ ] Email templates customized
- [ ] Test email delivery
- [ ] PDF attachment works
- [ ] Spam filter tested
- [ ] Unsubscribe link added (if marketing emails)
- [ ] SMTP configured for reliability

### Features Testing
- [ ] Weather integration works
- [ ] Location autocomplete works
- [ ] Zone calculations correct
- [ ] Cycle & Soak calculations verified
- [ ] Water savings calculations accurate
- [ ] PDF generation works
- [ ] Print stylesheet works
- [ ] Navigation between steps smooth
- [ ] Auto-save works
- [ ] Form validation works

### Admin Dashboard
- [ ] Analytics page loads
- [ ] Schedule list displays correctly
- [ ] Pagination works
- [ ] Export to CSV works
- [ ] Search/filter works
- [ ] Resend email works
- [ ] Settings save correctly

### Data Privacy & GDPR
- [ ] Privacy policy link added
- [ ] Consent checkbox added
- [ ] Data retention policy defined
- [ ] "Right to be Forgotten" feature
- [ ] Data export functionality
- [ ] Cookie notice (if tracking)
- [ ] Terms of service link

### Documentation
- [x] README.md completed
- [x] WordPress plugin guide updated
- [x] Attributions.md updated
- [ ] API documentation written
- [ ] User guide created
- [ ] Video tutorials (optional)

## 🚀 Deployment Steps

### 1. Build Production Files

```bash
# Build React app
npm run build

# Verify build output
ls dist/assets/
```

### 2. Prepare Plugin Files

```bash
# Create plugin directory structure
mkdir -p irrigation-calculator/build

# Copy plugin PHP file
cp wordpress-plugin/irrigation-calculator.php irrigation-calculator/

# Copy build files
cp dist/assets/index-*.js irrigation-calculator/build/app.js
cp dist/assets/index-*.css irrigation-calculator/build/app.css

# Copy README
cp wordpress-plugin/README.md irrigation-calculator/
```

### 3. Update Plugin Metadata

Edit `irrigation-calculator.php`:
- Update Plugin URI
- Update Author name
- Update Author URI
- Verify version number

### 4. WordPress Installation

```bash
# Upload to WordPress
# Method 1: FTP/SFTP
Upload entire 'irrigation-calculator' folder to:
/wp-content/plugins/

# Method 2: ZIP upload
zip -r irrigation-calculator.zip irrigation-calculator/
# Upload via WordPress Admin → Plugins → Add New → Upload
```

### 5. Plugin Activation

1. Go to WordPress Admin → Plugins
2. Find "Irrigation Schedule Calculator"
3. Click "Activate"
4. Verify no errors in debug.log

### 6. Configure Settings

1. Go to Irrigation Calc → Settings
2. Add API keys:
   - OpenWeatherMap API Key
   - Google Places API Key
   - SendGrid API Key (optional)
3. Set email settings:
   - From Email
   - From Name
   - Reply-To Email
4. Click "Save Changes"

### 7. Test Shortcode

1. Create new page
2. Add shortcode: `[irrigation_calculator]`
3. Publish page
4. View page and test all functionality

### 8. Monitor & Verify

- [ ] Check error logs for PHP errors
- [ ] Check browser console for JS errors
- [ ] Monitor API usage (OpenWeatherMap, Google)
- [ ] Test email delivery
- [ ] Verify database entries
- [ ] Check mobile responsiveness

## 🔍 Post-Deployment Monitoring

### Week 1
- [ ] Monitor error logs daily
- [ ] Check API usage daily
- [ ] Review email deliverability
- [ ] Test on different devices
- [ ] Gather user feedback

### Week 2-4
- [ ] Review analytics data
- [ ] Optimize based on usage patterns
- [ ] Address any bugs reported
- [ ] Update documentation as needed

### Monthly
- [ ] Review API costs
- [ ] Check database size
- [ ] Review security logs
- [ ] Update plugin if needed

## ⚠️ Common Issues & Solutions

### Calculator Not Displaying
**Problem**: Shortcode shows but calculator doesn't load
**Solution**: 
- Check browser console for errors
- Verify build files exist in correct location
- Clear WordPress cache
- Disable conflicting plugins

### Location Autocomplete Not Working
**Problem**: Address search doesn't show suggestions
**Solution**:
- Verify Google Places API key is set
- Check API key restrictions match domain
- Enable Places API in Google Cloud Console
- Check API quota hasn't been exceeded

### Weather Not Loading
**Problem**: Weather section shows mock data
**Solution**:
- Verify OpenWeatherMap API key is set
- Check API usage limits
- Test API key with direct API call
- Check browser console for errors

### Email Not Sending
**Problem**: Schedules saved but emails not received
**Solution**:
- Check WordPress email settings
- Install WP Mail SMTP plugin
- Use SendGrid for better deliverability
- Check spam folder
- Verify email template is correct

### PDF Generation Fails
**Problem**: PDF download doesn't work
**Solution**:
- Check browser console for errors
- Verify html2pdf library is loaded
- Test print functionality instead
- Check for content overflow issues

## 📞 Support Contacts

- Technical Issues: support@yourcompany.com
- API Questions: apis@yourcompany.com
- Security Issues: security@yourcompany.com

## 🔄 Rollback Plan

If critical issues arise:

1. **Immediate**: Deactivate plugin via WordPress Admin
2. **Backup**: Restore from pre-deployment backup
3. **Database**: Keep existing data, only revert code
4. **Communication**: Notify users of temporary outage
5. **Fix**: Address issues in development environment
6. **Redeploy**: Follow checklist again

## 📋 Version History

### Version 1.0.0 (October 2024)
- Initial production release
- 3-step wizard interface
- Weather integration
- Multi-controller support
- Email delivery with PDF
- Admin analytics dashboard

---

**Deployment Date**: _______________  
**Deployed By**: _______________  
**Environment**: Production  
**WordPress Version**: _______________  
**PHP Version**: _______________
