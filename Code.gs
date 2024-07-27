/**
 * Handles HTTP GET requests.
 * @param {Object} e - The event object containing request parameters.
 * @return {HtmlOutput} - The HTML content to display.
 */
function doGet(e) {
  let page = e.parameter.mode || "login";  // Default to Login page
  let htmlTemplate = HtmlService.createTemplateFromFile(page);

  // Include the navbar for pages other than login
  if (page !== "login" && page !== "signup") {
    var userDetails = getUserSession();
    if (userDetails) {
      htmlTemplate.navbar = getNavbar(page, userDetails);
      htmlTemplate.userDetails = userDetails;  // Pass userDetails to the HTML template
    } else {
      return HtmlService.createHtmlOutput("Session expired. Please log in again.");
    }
  } else {
    htmlTemplate.navbar = "";
    htmlTemplate.userDetails = {};  // Default empty userDetails for login/signup pages
  }

  let htmlOutput = htmlTemplate.evaluate();
  htmlOutput.addMetaTag('viewport', 'width=device-width, initial-scale=1');

  return htmlOutput;
}

/**
 * Creates the navigation bar HTML content.
 * @param {string} activePage - The name of the active page for highlighting.
 * @param {Object} userDetails - The user details to display in the profile section.
 * @return {string} - The HTML content of the navigation bar.
 */
function getNavbar(activePage, userDetails) {
  var scriptURLs = {
    dashboard: getScriptURL("mode=dashboard"),
    addLead: getScriptURL("mode=addLead"),
    manageLead: getScriptURL("mode=manageLead"),
    leadStatusNew: getScriptURL("mode=leadStatusNew"),
    leadStatusContacted: getScriptURL("mode=leadStatusContacted"),
    leadStatusPotential: getScriptURL("mode=leadStatusPotential"),
    leadStatusClosed: getScriptURL("mode=leadStatusClosed"),
    leadStatusFailed: getScriptURL("mode=leadStatusFailed"),
    // setFollowUp: getScriptURL("mode=setFollowUp"),
    // viewSchedule: getScriptURL("mode=viewSchedule"),
    profile: getScriptURL("mode=profile"),
    logout: getScriptURL("mode=login")
  };

  var navbar = `
    <nav class="sidebar">
        <div class="logo-details">
            <img src="https://i.postimg.cc/g0TQzD0T/lead-logo.png" alt="logo-leadlab">
            <span class="logo-name">LeadLab</span>
        </div>
        <ul class="nav-links">
            <!-- Dashboard -->
            <li class="${activePage === 'dashboard' ? 'active' : ''}">
                <a href="${scriptURLs.dashboard}">
                    <i class='bx bxs-dashboard'></i>
                    <span class="link-name">Dashboard</span>
                </a>
            </li>
            <!-- Lead -->
            <li class="${activePage === 'addLead' || activePage === 'manageLead' ? 'active' : ''}">
                <div class="icon-link">
                    <a>
                        <i class='bx bxs-contact'></i>
                        <span class="link-name">Lead</span>
                    </a>
                    <button class="toggle-btn">
                        <i class='bx bx-chevron-down'></i>
                    </button>
                </div>
                <ul class="sub-menu">
                    <li><a href="${scriptURLs.addLead}">Add Lead</a></li>
                    <li><a href="${scriptURLs.manageLead}">Manage Lead</a></li>
                </ul>
            </li>
            <!-- Lead Status -->
            <li class="${activePage.startsWith('leadStatus') ? 'active' : ''}">
                <div class="icon-link">
                    <a>
                        <i class='bx bxs-bar-chart-alt-2'></i>
                        <span class="link-name">Lead Status</span>
                    </a>
                    <button class="toggle-btn">
                        <i class='bx bx-chevron-down'></i>
                    </button>
                </div>
                <ul class="sub-menu">
                    <li><a href="${scriptURLs.leadStatusNew}">New</a></li>
                    <li><a href="${scriptURLs.leadStatusContacted}">Contacted</a></li>
                    <li><a href="${scriptURLs.leadStatusPotential}">Potential</a></li>
                    <li><a href="${scriptURLs.leadStatusClosed}">Closed</a></li>
                    <li><a href="${scriptURLs.leadStatusFailed}">Failed</a></li>
                </ul>
            </li>
            <!-- Schedule -->
            <li class="${activePage.startsWith('setFollowUp') || activePage.startsWith('viewSchedule') ? 'active' : ''}">
                <div class="icon-link">
                    <a>
                        <i class='bx bxs-calendar'></i>
                        <span class="link-name">Schedule</span>
                    </a>
                    <button class="toggle-btn">
                        <i class='bx bx-chevron-down'></i>
                    </button>
                </div>
                <ul class="sub-menu">
                    <li><a>Set Follow-Up Date</a></li>
                    <li><a>View Schedule</a></li>
                </ul>
            </li>
            <!-- Profile -->
            <li class="${activePage === 'profile' ? 'active' : ''}">
                <div class="icon-link">
                    <a href="${scriptURLs.profile}">
                        <i class='bx bxs-user-circle'></i>
                        <span class="link-name">Profile</span>
                    </a>
                </div>
            </li>
            <!-- Profile & Logout (Bottom) -->
            <li>
                <div class="profile-details">
                    <div class="profile-content">
                      <div class="profile-name">${userDetails.username}</div>
                      <div class="profile-email">${userDetails.email}</div>
                    </div>
                    <a class="logout-icon" href="${scriptURLs.logout}"><i class='bx bx-log-in-circle'></i></a>
                </div>
            </li>
        </ul>
    </nav>`;

  return navbar;
}

/**
 * Returns the URL of the Google Apps Script web app
 * @param {string} qs - Query string to append to the URL
 * @return {string} - The URL of the web app
 */
function getScriptURL(qs = null) {
  var url = ScriptApp.getService().getUrl();
  if (qs) {
    if (qs.indexOf("?") === -1) {
      qs = "?" + qs;
    }
    url = url + qs;
  }
  return url;
}

/**
 * Includes HTML parts, e.g., JavaScript, CSS, other HTML files
 * @param {string} filename - The name of the file to include
 * @return {string} - The content of the included file
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}



/**
 * Verifies the user credentials and retrieves user details.
 * @param {string} username - The username provided by the user.
 * @param {string} password - The password provided by the user.
 * @return {Object|null} - The user details if the credentials are valid, otherwise null.
 */
function verifyUser(username, password) {
  var sheet = SpreadsheetApp.openById("1-gapkbfee2Gm92EZwJwiEvKUbL4LQxCnH6LC1nPVBV8").getSheetByName("User");
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {  // Start from 1 to skip headers
    if (data[i][0] === username && String(data[i][1]) === password) {
      return {
        username: data[i][0],
        email: data[i][3],
        fullname: data[i][2],
        contact: data[i][4]
      };
    }
  }
  return null;
}

function doPost(e) {
  var username = e.parameter.username;
  var password = e.parameter.password;
  var action = e.parameter.action;
  var response = {
    message: '',
    messageType: '',
    redirect: ''
  };

  if (action === "login") {
    var userDetails = verifyUser(username, password);
    if (userDetails) {
      setUserSession(userDetails);
      response.message = "Login successful!";
      response.messageType = "success";
      response.redirect = getScriptURL('mode=dashboard');
    } else {
      response.message = "Invalid username or password.";
      response.messageType = "error";
    }
  } else if (action === "signup") {
    var user = {
      username: e.parameter.username,
      password: e.parameter.password,
      fullname: e.parameter.fullname,
      email: e.parameter.email,
      contact: "'" + e.parameter.countryCode + e.parameter.contact
    };
    var result = addUser(user);
    if (result === 'Account is created successfully.') {
      response.message = result;
      response.messageType = "success";
      response.redirect = getScriptURL('mode=login');
    } else {
      response.message = result;
      response.messageType = "error";
    }
  } else if (action === "addLead") {
    var lead = {
      leadName: e.parameter.leadName,
      email: e.parameter.email,
      contactNo: "'" + e.parameter.countryCode + e.parameter.contactNo,
      city: e.parameter.city,
      interestedIn: e.parameter.interestedIn,
      note: e.parameter.note || "",
      username: e.parameter.username,
      status: e.parameter.status || "new"
    };
    var result = addLead(lead);
    if (result === 'Lead added successfully.') {
      response.message = result;
      response.messageType = "success";
      response.redirect = getScriptURL('mode=manageLead'); // Redirect to a relevant page
    } else {
      response.message = result;
      response.messageType = "error";
    }
  } else if (action === "updateProfile") {
    var profile = {
      username: e.parameter.username,
      fullname: e.parameter.fullname,
      email: e.parameter.email,
      contact: e.parameter.contact
    };
    var result = updateUserProfile(profile);
    if (result === 'Profile updated successfully.') {
      response.message = result;
      response.messageType = "success";
      response.redirect = getScriptURL('mode=profile');
      response.updatedUserDetails = getUserDetails(profile.username);
    } else {
      response.message = result;
      response.messageType = "error";
    }
  }

  return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Sets the user session using PropertiesService.
 * @param {Object} userDetails - The user details to store in the session.
 */
function setUserSession(userDetails) {
  var userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('username', userDetails.username);
  userProperties.setProperty('email', userDetails.email);
  userProperties.setProperty('fullname', userDetails.fullname);
  userProperties.setProperty('contact', userDetails.contact);
}
/**
 * Retrieves the current user's session details.
 * @return {Object|null} - The user details if the session exists, otherwise null.
 */
function getUserSession() {
  var userProperties = PropertiesService.getUserProperties();
  var username = userProperties.getProperty('username');
  var email = userProperties.getProperty('email');
  var fullname = userProperties.getProperty('fullname');
  var contact = userProperties.getProperty('contact');
  if (username && email && fullname && contact) {
    return {
      username: username,
      email: email,
      fullname: fullname,
      contact: contact
    };
  }
  return null;
}

// Check if the user already exists by username or email
function userExists(username, email) {
  const sheet = SpreadsheetApp.openById("1-gapkbfee2Gm92EZwJwiEvKUbL4LQxCnH6LC1nPVBV8").getSheetByName('User');
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === username || data[i][3] === email) {
      return true;
    }
  }
  return false;
}

// Function to add a new user to google sheet
function addUser(user) {
  if (userExists(user.username, user.email)) {
    return 'User already exists! Please use different username and email.';
  } else {
    const sheet = SpreadsheetApp.openById("1-gapkbfee2Gm92EZwJwiEvKUbL4LQxCnH6LC1nPVBV8").getSheetByName('User');
    sheet.appendRow([user.username, user.password, user.fullname, user.email, user.contact]);
    return 'Account is created successfully.';
  }
}

/**
 * Adds a new lead to the "Lead" sheet.
 * @param {Object} lead - The lead details to add.
 * @return {string} - Success or error message.
 */
function addLead(lead) {
  try {
    const sheet = SpreadsheetApp.openById("1-gapkbfee2Gm92EZwJwiEvKUbL4LQxCnH6LC1nPVBV8").getSheetByName('Lead');
    const lastRow = sheet.getLastRow();

    // Check if there's existing data
    let leadId = 1;  // Default to 1 if no data

    if (lastRow > 0) {
      const lastLeadId = sheet.getRange(lastRow, 1).getValue(); // Retrieve the last Lead ID
      Logger.log("Last Lead ID: " + lastLeadId);

      if (typeof lastLeadId === 'number') {
        leadId = lastLeadId + 1; // Increment the ID
      } else {
        Logger.log("Invalid Last Lead ID");
      }
    }

    Logger.log("New Lead ID: " + leadId);

    sheet.appendRow([
      leadId, // Lead ID
      lead.leadName,
      lead.email,
      lead.contactNo,
      lead.city,
      lead.interestedIn,
      lead.status,
      lead.note,
      lead.username
    ]);
    return 'Lead added successfully.';
  } catch (error) {
    Logger.log(error);
    return 'Error adding lead. Please try again.';
  }
}

function getLeadsForCurrentUser() {
  const userProperties = PropertiesService.getUserProperties();
  const currentUsername = userProperties.getProperty('username');

  const sheet = SpreadsheetApp.openById("1-gapkbfee2Gm92EZwJwiEvKUbL4LQxCnH6LC1nPVBV8").getSheetByName('Lead');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const leads = [];

  for (let i = 1; i < data.length; i++) {
    const lead = {};
    for (let j = 0; j < headers.length; j++) {
      lead[headers[j]] = data[i][j];
    }
    if (lead['Username (Login)'] === currentUsername) {
      leads.push(lead);
    }
  }

  return leads;
}

function updateLead(lead) {
  try {
    const sheet = SpreadsheetApp.openById("1-gapkbfee2Gm92EZwJwiEvKUbL4LQxCnH6LC1nPVBV8").getSheetByName('Lead');
    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] == lead['Lead ID']) {
        for (let j = 1; j < headers.length; j++) {
          const header = headers[j];
          if (lead.hasOwnProperty(header)) {
            sheet.getRange(i + 1, j + 1).setValue(lead[header]);
          }
        }
        return { message: 'Lead updated successfully.', messageType: 'success' };
      }
    }
    return { message: 'Lead not found.', messageType: 'error' };
  } catch (error) {
    console.error('Error updating lead:', error);
    return { message: 'Error updating lead: ' + error.message, messageType: 'error' };
  }
}

function deleteLead(leadId) {
  const sheet = SpreadsheetApp.openById("1-gapkbfee2Gm92EZwJwiEvKUbL4LQxCnH6LC1nPVBV8").getSheetByName('Lead');
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) { // Skip header row
    if (data[i][0] == leadId) { // Assuming Lead ID is the first column
      sheet.deleteRow(i + 1); // +1 because rows are 1-indexed and we have a header row
      break;
    }
  }

  renumberLeadIds(); // Renumber IDs after deletion
}

function renumberLeadIds() {
  const sheet = SpreadsheetApp.openById("1-gapkbfee2Gm92EZwJwiEvKUbL4LQxCnH6LC1nPVBV8").getSheetByName('Lead');
  const data = sheet.getDataRange().getValues();

  let id = 1;
  for (let i = 1; i < data.length; i++) { // Skip header row
    sheet.getRange(i + 1, 1).setValue(id); // Update ID in the first column
    id++;
  }
}

function updateUserProfile(profile) {
  var sheet = SpreadsheetApp.openById("1-gapkbfee2Gm92EZwJwiEvKUbL4LQxCnH6LC1nPVBV8").getSheetByName('User');
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === profile.username) {
      sheet.getRange(i + 1, 3).setValue(profile.fullname);
      sheet.getRange(i + 1, 4).setValue(profile.email);
      sheet.getRange(i + 1, 5).setValue(profile.contact);

      // Update user session
      setUserSession({
        username: profile.username,
        email: profile.email,
        fullname: profile.fullname,
        contact: profile.contact
      });

      return 'Profile updated successfully.';
    }
  }
  return 'Profile update failed. User not found.';
}

function getUserDetails(username) {
  var sheet = SpreadsheetApp.openById("1-gapkbfee2Gm92EZwJwiEvKUbL4LQxCnH6LC1nPVBV8").getSheetByName('User');
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === username) {
      return {
        username: data[i][0],
        email: data[i][3],
        fullname: data[i][2],
        contact: data[i][4]
      };
    }
  }
  return null;
}