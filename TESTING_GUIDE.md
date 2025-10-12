# 🧪 Testing Guide - Video Call & Symptom Checker

## Quick Start Testing

### 1. Start Local Server
```powershell
cd e:\DoCare\DoCare
python -m http.server 8080
```

Then open: `http://localhost:8080/index.html`

---

## 🎥 Video Call Testing

### Step-by-Step Test Flow

**1. Login to Application**
- Use any email/password combination
- Navigate to Dashboard

**2. Go to Appointments Page**
- Click "Appointments" in sidebar
- OR click "Appointments" in Quick Actions

**3. Join Video Call**
- Find any "Virtual" appointment
- Click the "Join Video" button
- Camera permission will be requested

**4. Test Camera Controls**
- ✅ Should see your camera feed in bottom-right corner (mirrored)
- ✅ Should see simulated doctor view with avatar
- ✅ Call timer should start counting (00:00, 00:01, etc.)
- ✅ Connection status should show "Connected • HD Quality"

**5. Test Call Controls**

| Control | Expected Behavior |
|---------|------------------|
| **Microphone** | Click to mute/unmute. Icon changes 🎤 ↔️ 🔇 |
| **Camera** | Click to disable/enable video. Icon changes 📹 ↔️ 🚫 |
| **Share Screen** | Opens browser screen sharing dialog |
| **Chat** | Opens sliding chat panel from right |
| **End Call** | Stops camera, returns to appointments page |

**6. Test Chat Feature**
- Click "Chat" button (💬 icon)
- Chat panel slides in from right
- Type a message and press Enter (or click send 📤)
- Your message appears in blue bubble
- Simulated doctor response appears after 2 seconds
- Click X to close chat panel

**7. Mobile Testing**
- Resize browser to < 768px width
- Local video should resize to 120x90px
- Controls should stack properly
- Chat panel should be full width

### Expected Results

✅ **Camera Access**: Permission prompt, then live video feed
✅ **Video Quality**: Clear image in local preview
✅ **Controls Responsive**: All buttons change state visibly
✅ **Timer Works**: Increases every second
✅ **Chat Functions**: Messages send and appear correctly
✅ **End Call**: Returns to appointments, camera stops

### Troubleshooting

**Camera Not Working**
- Check browser permissions (usually top-left of address bar)
- Try different browser (Chrome recommended)
- Ensure no other app is using camera

**No Video Feed**
- Check console for errors (F12)
- Verify HTTPS or localhost (WebRTC requirement)
- Camera hardware must be present

---

## 🩺 Symptom Checker Testing

### Test Scenarios

#### Scenario 1: Common Cold Search
**Input**: `runny nose and cough`
**Expected**:
- 2 conditions found: Common Cold, Flu
- Each shows symptoms, recommendations, warnings
- 6 YouTube videos total (3 per condition)
- "Schedule Appointment" and "Message Doctor" buttons

#### Scenario 2: Digestive Issues
**Input**: `stomach pain and nausea`
**Expected**:
- 2 conditions: Food Poisoning, Gastritis
- Home remedies section visible
- Warning signs highlighted in red
- Recommendations in green boxes

#### Scenario 3: Mental Health
**Input**: `anxiety and worry`
**Expected**:
- 1 condition: Anxiety Disorder
- Emergency hotline not shown (not life-threatening)
- Breathing exercise video links
- Self-care recommendations

#### Scenario 4: Emergency Condition
**Input**: `shortness of breath and chest pain`
**Expected**:
- Multiple conditions including Asthma, COVID-19
- Emergency warnings clearly visible
- Red warning badges
- Critical signs listed first

#### Scenario 5: No Matches
**Input**: `random gibberish xyz123`
**Expected**:
- "No specific conditions found" message
- General health tips displayed
- "Schedule Doctor's Appointment" button
- No condition cards

### Example Search Chips Testing

Click each pre-filled chip and verify results:

| Chip Text | Expected Conditions |
|-----------|-------------------|
| "Runny nose and cough" | Common Cold, Flu |
| "Stomach pain and nausea" | Food Poisoning, Gastritis |
| "Headache and fever" | Common Cold, Flu, COVID-19, Migraine |
| "Anxiety and worry" | Anxiety Disorder |
| "Joint pain and stiffness" | Arthritis |

### Video Testing

**For Each Condition:**
1. Scroll to "📺 Educational Videos" section
2. Should see 3 video cards with thumbnails
3. Hover over video - thumbnail should zoom slightly
4. Click play button (▶)
5. YouTube should open in new tab
6. Video should be relevant to condition

**Sample Videos to Check:**
- Common Cold: "How to Treat Common Cold Naturally"
- COVID-19: "COVID-19: What You Need to Know"
- Anxiety: "Understanding Anxiety Disorders"

### UI Element Checks

**✅ Search Box**
- Large input field with placeholder text
- "Analyze Symptoms" button with magnifying glass
- Hint text below: "💡 Be specific..."

**✅ Condition Cards**
- Header with condition name + severity badge
- Color-coded badges (green=mild, yellow=moderate, red=severe)
- Description in highlighted box
- Expandable sections for symptoms, recommendations, warnings
- Video grid at bottom
- Action buttons at footer

**✅ Visual Design**
- Smooth fade-in animation when results load
- Cards have hover effect (lift up 4px)
- Play button overlay on videos
- Responsive layout on mobile

### Mobile Testing (< 768px)

1. **Search Box**
   - Input and button stack vertically
   - Button full width

2. **Condition Cards**
   - Header stacks (title above badge)
   - Actions stack vertically
   - Videos in single column

3. **Example Chips**
   - Stack vertically
   - Full width buttons

### Accessibility Testing

**Keyboard Navigation**
- Tab through search input → button
- Enter key submits search
- Video play buttons accessible via keyboard
- Action buttons focusable

**Screen Reader**
- Alt text on video thumbnails
- Aria labels on buttons
- Semantic HTML structure

### Content Verification

**Check Random Condition (e.g., Migraine):**
- [ ] Name displayed correctly
- [ ] Severity badge present
- [ ] 7+ symptoms listed
- [ ] 6+ recommendations (with checkmarks)
- [ ] 3+ warning signs (with ⚠️ icons)
- [ ] 3+ home remedies (with 🌿 icons)
- [ ] 3 YouTube videos with valid thumbnails

**Medical Disclaimer**
- Yellow box at bottom of results
- Clear warning text
- Mentions "educational purposes only"

---

## 🐛 Known Issues & Limitations

### Video Call
- Camera access requires HTTPS or localhost
- No real backend signaling (simulated doctor)
- No actual call connection
- Chat responses are simulated (not real doctor)

### Symptom Checker
- Keyword-based matching (not AI/ML)
- Limited to 15 conditions
- US/English-centric content
- No personalization based on age/history

---

## 📊 Success Metrics

### Video Call - Definition of Done
- [ ] Camera starts automatically on page load
- [ ] All 5 controls functional
- [ ] Chat sends/receives messages
- [ ] Timer counts up continuously
- [ ] End call navigates back
- [ ] No console errors

### Symptom Checker - Definition of Done
- [ ] Search returns relevant conditions
- [ ] All 45 videos have valid thumbnails
- [ ] Videos open in new tab
- [ ] Example chips fill search box
- [ ] Mobile layout responsive
- [ ] Medical disclaimer visible
- [ ] Action buttons navigate correctly

---

## 🔄 Regression Testing

After any code changes, verify:

**Core Navigation**
1. Login works
2. Sidebar navigation functional
3. All routes load without errors

**Video Call Integration**
1. "Join Video" button on appointments page
2. Navigation to /video-call works
3. Back navigation returns to appointments

**Symptom Checker Integration**
1. Available in sidebar navigation
2. Search persists on re-render
3. Route /symptom-checker loads correctly

---

## 📝 Test Reporting Template

```markdown
## Test Session Report

**Date**: [Date]
**Tester**: [Name]
**Browser**: [Chrome/Firefox/Safari + version]
**Device**: [Desktop/Mobile/Tablet]

### Video Call Tests
- [ ] Camera access: PASS / FAIL
- [ ] All controls working: PASS / FAIL
- [ ] Chat functional: PASS / FAIL
- [ ] End call works: PASS / FAIL
- **Issues**: [List any problems]

### Symptom Checker Tests
- [ ] Search returns results: PASS / FAIL
- [ ] Videos play correctly: PASS / FAIL
- [ ] Mobile responsive: PASS / FAIL
- [ ] Content accurate: PASS / FAIL
- **Issues**: [List any problems]

### Overall Rating
- [ ] Production Ready
- [ ] Minor Issues
- [ ] Major Issues
```

---

## 🚀 Production Checklist

Before deploying:

**Video Call**
- [ ] Test on Chrome, Firefox, Safari
- [ ] Test on iOS and Android browsers
- [ ] Verify camera permissions messaging
- [ ] Test on slow connections (3G)
- [ ] Verify cleanup on navigation away

**Symptom Checker**
- [ ] Medical content reviewed by professional
- [ ] All 45 YouTube videos verified active
- [ ] Disclaimer text approved by legal
- [ ] Emergency hotlines correct for region
- [ ] Accessibility audit passed

**Integration**
- [ ] All routes working in production
- [ ] CSS loaded without CORS issues
- [ ] JavaScript modules loading correctly
- [ ] No console errors in production build

---

**Happy Testing!** 🎉

For issues or questions, refer to:
- Main docs: `VIDEO_CALL_SYMPTOM_CHECKER_DOCS.md`
- Implementation: `IMPLEMENTATION_SUMMARY.md`
