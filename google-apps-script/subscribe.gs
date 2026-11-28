/**
 * Digital Trust Toolkit: email subscription → Google Sheet
 *
 * Paste this into the "Subscribers" Google Sheet:
 *   Extensions › Apps Script › replace everything in Code.gs with this file › Save.
 * Then: Deploy › New deployment › type "Web app"
 *   Execute as: Me    Who has access: Anyone
 * Copy the Web app URL into index.html (data-endpoint on the subscribe form).
 *
 * Each sign-up adds one row: Email | Subscribed. An address that's already in
 * the sheet (any upper/lower case) is never added twice.
 *
 * New subscribers are also emailed the printable pack (PACK_FILES below).
 * After changing this file: Deploy › Manage deployments › pencil icon ›
 * Version: New version › Deploy. The Web app URL stays the same.
 * The first time, Google asks again for permission (now also to send email,
 * read the pack files in Drive and download the activities PDF): allow it.
 */

var SHEET_NAME = 'Subscribers';   // the tab the emails go into (created if missing)
var EMAIL_PATTERN = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;
var THANKS = 'Thanks! You’re on the list.';

/* ---------- The printable pack, emailed to each new subscriber ----------
 * Each file comes either from Google Drive (driveId: the long ID in the file's
 * share link, .../file/d/THIS_PART/view) or from the website (url). The Digital
 * Trust Team account must be able to open every Drive file listed here.
 *
 * "title" is how the file is listed in the email. A file that can't be loaded
 * (or isn't a PDF) is skipped and the rest are still sent; the reason shows
 * under Executions in the Apps Script editor.
 *
 * ✏️ EDIT HERE to send the rest of the pack: when Ash's toolbox infographic and
 * any other PDFs are ready, uncomment their line (or add a new one) with the
 * file's Drive ID or website address, then redeploy (see the top of this file).
 */
var PACK_FILES = [
  // Joan's printable checklist infographic: "_INFOGRAPHICS (1).pdf" in Google Drive.
  // ✏️ When Joan uploads the version with the 4th Credit point as a new file, put its ID here.
  { title: 'Before you post or upload: printable checklist', name: 'Before you post or upload - printable checklist.pdf', driveId: '16d3W7fc-PMTiAq9sHJE3_evwjhuwkPwW' },

  // The educator activities: the same PDF as "Print the activities" on the website
  // (assets/pdfs/educator-activities.pdf). Make it again when the activities change (see README).
  { title: 'For educators: classroom activities', name: 'For educators - classroom activities.pdf', url: 'https://digitaltrust.nerudaarts.ca/assets/pdfs/educator-activities.pdf' }

  // ✏️ EDIT HERE: Ash's toolbox infographic, once it's ready (remove the // and add a comma above):
  // { title: 'The digital trust toolbox', name: 'The digital trust toolbox.pdf', driveId: 'PASTE_THE_DRIVE_FILE_ID_HERE' }
];

var PACK_SUBJECT = 'Your Digital Trust Toolkit pack';
var REPLY_TO = 'digitaltrustteam@nerudaarts.ca';
var SITE_URL = 'https://digitaltrust.nerudaarts.ca/';

function doPost(e) {
  var data = {};
  try {
    data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return reply(false, 'Something went wrong. Please try again.');
  }

  // Hidden spam-trap field: people leave it empty, bots usually fill it in.
  // Pretend it worked so bots learn nothing.
  if (data.website) return reply(true, THANKS);

  var email = String(data.email || '').trim().toLowerCase();
  if (!email || email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return reply(false, 'Please enter a valid email address.');
  }
  if (data.consent !== true) {
    return reply(false, 'Please tick the box to agree to receive emails.');
  }

  // One sign-up at a time, so two people subscribing at the same moment
  // can't create a duplicate.
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return reply(false, 'The list is busy. Please try again in a moment.');
  try {
    var sheet = getSheet();
    var last = sheet.getLastRow();
    if (last > 1) {
      var existing = sheet.getRange(2, 1, last - 1, 1).getValues();
      for (var i = 0; i < existing.length; i++) {
        if (String(existing[i][0]).trim().toLowerCase() === email) {
          // Already subscribed: same answer, so nobody can find out who is on the list
          return reply(true, THANKS);
        }
      }
    }
    // Saved as plain text so Sheets never treats an address as a formula
    sheet.appendRow(["'" + email, new Date()]);
  } finally {
    lock.releaseLock();
  }

  // Only new subscribers get the pack, so the form can't be used to send
  // the same person email again and again. If sending fails, the address is
  // still saved: see the error under Executions in the Apps Script editor.
  try {
    sendPack(email);
  } catch (err) {
    console.error('Pack email to ' + email + ' failed: ' + err);
  }
  return reply(true, THANKS);
}

/* ---------- Pack email ---------- */
function sendPack(email) {
  if (MailApp.getRemainingDailyQuota() < 1) {
    throw new Error('daily email limit reached');
  }
  // Load each file; skip any that fails, so one missing file doesn't stop the email.
  var attachments = [], titles = [];
  PACK_FILES.forEach(function (file) {
    try {
      attachments.push(getPackFile(file));
      titles.push(file.title);
    } catch (err) {
      console.error('Pack file skipped (' + file.name + '): ' + err);
    }
  });
  if (!attachments.length) throw new Error('no pack files could be loaded');
  var listText = titles.map(function (item) { return '- ' + item; }).join('\n');
  var listHtml = titles.map(function (item) { return '<li>' + item + '</li>'; }).join('');

  MailApp.sendEmail({
    to: email,
    subject: PACK_SUBJECT,
    name: 'Digital Trust Toolkit',
    replyTo: REPLY_TO,
    attachments: attachments,
    body: [
      'Thanks for subscribing to the Digital Trust Toolkit!',
      '',
      'Your printable pack is attached:',
      listText,
      '',
      'More resources, including our second infographic, “The digital trust toolbox”, are on the way: we’ll email you when they’re ready, along with details of our free webinar for students and educators in January.',
      '',
      'The toolkit is always free online: ' + SITE_URL,
      '',
      'You’re receiving this because you subscribed at ' + SITE_URL + '. To unsubscribe, reply to this email with “unsubscribe”.',
      '',
      'The Digital Trust Toolkit team, with Neruda Arts'
    ].join('\n'),
    htmlBody:
      '<p>Thanks for subscribing to the Digital Trust Toolkit!</p>' +
      '<p>Your printable pack is attached:</p><ul>' + listHtml + '</ul>' +
      '<p>More resources, including our second infographic, “The digital trust toolbox”, are on the way: we’ll email you when they’re ready, ' +
      'along with details of our free webinar for students and educators in January.</p>' +
      '<p>The toolkit is always free online: <a href="' + SITE_URL + '">digitaltrust.nerudaarts.ca</a></p>' +
      '<p style="color:#555;font-size:13px">You’re receiving this because you subscribed at digitaltrust.nerudaarts.ca. ' +
      'To unsubscribe, reply to this email with “unsubscribe”.</p>' +
      '<p>The Digital Trust Toolkit team, with Neruda Arts</p>'
  });
  // Shows under Executions, so you can confirm it went out (Apps Script emails
  // are not saved in the Sent folder).
  console.log('Pack sent to ' + email + ' from ' + Session.getEffectiveUser().getEmail() +
    ' with ' + titles.length + ' file(s): ' + titles.join(', ') +
    '. Emails left today: ' + MailApp.getRemainingDailyQuota());
}

// One pack file as an email attachment, from Drive or from the website.
function getPackFile(file) {
  var blob;
  if (file.driveId) {
    blob = DriveApp.getFileById(file.driveId).getBlob();
  } else {
    var res = UrlFetchApp.fetch(file.url, { muteHttpExceptions: true });
    if (res.getResponseCode() !== 200) {
      throw new Error(file.url + ' returned ' + res.getResponseCode());
    }
    blob = res.getBlob();
  }
  // The website answers a missing file with its home page, so check it's really a PDF
  var head = blob.getBytes().slice(0, 5).map(function (b) { return String.fromCharCode(b & 255); }).join('');
  if (head !== '%PDF-') {
    throw new Error((file.url || file.driveId) + ' is not a PDF (is the website deployed?)');
  }
  return blob.setName(file.name);
}

// Run this once from the editor (select testPackEmail › Run) to send the pack to
// yourself and check it before going live. ✏️ Put your own address in the quotes.
function testPackEmail() {
  sendPack('PUT_YOUR_EMAIL_HERE');
}

// Opening the Web app URL in a browser just shows that it's running.
function doGet() {
  return ContentService.createTextOutput('Digital Trust subscription service is running.');
}

function getSheet() {
  var book = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = book.getSheetByName(SHEET_NAME) || book.getSheets()[0];
  if (sheet.getName() !== SHEET_NAME) sheet.setName(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Email', 'Subscribed']);
    sheet.getRange('A1:B1').setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 320);
    sheet.setColumnWidth(2, 180);
  }
  return sheet;
}

function reply(ok, message) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: ok, message: message }))
    .setMimeType(ContentService.MimeType.JSON);
}
