// Use buttons to toggle between views
document.addEventListener('DOMContentLoaded', function() {

  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  // Click to send an email:
  document.querySelector('form').onsubmit = () => sendEmail();
  // By default, load the inbox
  load_mailbox('inbox');
});



function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'flex';
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}



// Call the API and capture the information that the user provides in the form: 
function sendEmail() {
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;
  // fetch sends a get request to the url and the information is stored via post request. Stringify converts a value to a JSON string:
  fetch('/emails', {
    method: "POST",
    body: JSON.stringify({ 
          recipients: recipients,
          subject: subject,
          body: body })
  })
  // Capture the response as key/value and store all in the variable 'result'. 
  // Finally, the console shows the data and the 'sent' page is rendered:
  .then(response => response.json())
  .then(result => {
          console.log(result);
  });
  // Let the browser refresh the response and reload information:
  setTimeout(function(){
    load_mailbox('sent');
  }, 100)
  // To avoid to reload the page, we use false (opposite to by default):
  return false;
}



function load_mailbox(mailbox) {
  //Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#complete-email').style.display = 'none';
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = 
          `<h3 class="mailbox_name">${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  const emailsView = document.querySelector('#emails-view');
  const completeEmail = document.querySelector('#complete-email');
  // To show just one email at a time:
  completeEmail.innerHTML = ' ';

  // Call via GET to get the emails:
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {

    // If mailbox is empty, show a message:
    if (emails.length == 0) {
        let message = document.createElement("div");
        message.innerHTML = "You don't have emails.";
        emailsView.appendChild(message);

    }else{
        // If there are emails, show them creating a div:
        emails.forEach((email) => {
        let emailDiv = document.createElement('div');
        emailDiv.className = "table-light";
        emailDiv.innerHTML =
              `<div class="card_left">
                <h2 class="green_point" style="color: #c7c7c7; background-color: #c7c7c7">·</h2>
              </div>  
              <div class="avatar">
                <h3 title="${email.sender}">${email.sender[0].toUpperCase()}<h3>
              </div>  
              <div class="email_card">
                <p> <i class="fa-solid fa-user-tie"></i> ${email.sender} </p>
                <p class="eBody"> <i class="fa-solid fa-envelope-open"></i> ${email.subject}</p>               
                <p id="timestamp"> <i class="fa-solid fa-calendar-days"> </i>  ${email.timestamp}</p>
              </div>`
        console.log(email);
        emailsView.appendChild(emailDiv);

        let read = email.read;
        if (read == false) { 
          emailDiv.classList.add("email_read");
          emailDiv.innerHTML = 
                `<div class="card_left">
                  <h2 class="green_point">·</h2>
                </div>  
                <div class="avatar">
                  <h3 title="${email.sender}">${email.sender[0].toUpperCase()}<h3>
                </div>  
                <div class="email_card">
                  <p> <i style="color: var(--hotblack_opacity);" class="fa-solid fa-user-tie"></i> ${email.sender} </p>
                  <p class="eBody"> <i style="color: var(--hotblack_opacity);" class="fa-solid fa-envelope"></i> ${email.subject}</p>               
                  <p id="timestamp"> <i class="fa-solid fa-calendar-days"> </i>  ${email.timestamp}</p>
                </div>
                `
        }
        if (mailbox == 'archive') {
          emailDiv.innerHTML = 
                    `<div class="card_left">
                      <h2 class="green_point" style="color: #c7c7c7; background-color: #c7c7c7">·</h2>
                    </div>  
                    <div class="avatar">
                      <h3 title="${email.sender}">${email.sender[0].toUpperCase()}<h3>
                    </div>  
                    <div class="email_card">
                      <p> <i class="fa-solid fa-user-tie"></i> ${email.sender} </p>
                      <p class="eBody"> <i class="fa-solid fa-envelope-open"></i> ${email.subject}</p>               
                      <p id="timestamp"> <i class="fa-solid fa-calendar-days"> </i>  ${email.timestamp}</p>
                    </div>`;
          emailsView.appendChild(emailDiv);
        }
        if (mailbox == 'sent') {
          emailDiv.innerHTML = 
                    `<div class="card_left">
                      <h2 class="green_point" style="color: #c7c7c7; background-color: #c7c7c7">·</h2>
                    </div>
                    <div class="avatar">
                      <h3 title="${email.sender}">${email.sender[0].toUpperCase()}<h3>
                    </div>
                    <div class="email_card">
                      <p> <i class="fa-solid fa-user-tie"></i> To: ${email.recipients} </p>
                      <p class="eBody"> <i class="fa-solid fa-envelope-open"></i> ${email.subject}</p>               
                      <p id="timestamp"> <i class="fa-solid fa-calendar-days"> </i>  ${email.timestamp}</p>
                    </div>`;
          emailsView.appendChild(emailDiv);
        }
      
        // Show the content of the email by clicking:
        emailDiv.addEventListener('click', function() {
          document.querySelector('#emails-view').style.display = 'none';
          document.querySelector('#compose-view').style.display = 'none';
          document.querySelector('#complete-email').style.display = 'block';
          // All email content is added to the #complete-email class:  
          const emailContent = document.createElement("div");
          emailContent.className = "email_content";
          completeEmail.appendChild(emailContent);

          
          // Call the API again. PUT replace the id of an email to true (email read):
          fetch(`/emails/${email.id}`, {
            method: 'PUT',
            body: JSON.stringify ({
              read: true
            })
          })

          // Show the complete email:
          fetch(`/emails/${email.id}`)
          .then(response => response.json())
          .then(email => {
            emailContent.innerHTML =
                      `<div class="email-title"><h6> ${ email.subject } </h6></div>
                        <p class="email-info">
                            From: 
                            <strong> ${ email.sender.split('@',1)}</strong>
                            (${email.sender})
                            <br> 
                            To: <strong>${email.recipients}</strong>
                            on 
                            ${email.timestamp}
                        </p>  
                        <hr>
                        <br>
                      <div class="email-body">  
                      ${email.body.split('\n').join("<br>")}
                      <br><br>
                      </div>`
                      // Show breaklines correctly.

            // Click the button to reply an email:  
            const reply = document.createElement('button');
            reply.className = "btn btn-primary";
            reply.id = "reply";
            reply.textContent = "Reply";
            emailContent.appendChild(reply);

            // Call the function to compose the reply:
            reply.addEventListener('click', () => {
              compose_email();
              document.querySelector('#compose-recipients').value = email.sender;
              document.querySelector('#compose-subject').value =
                        email.subject.slice(0,4) == 
                        'Re: ' ? 'Re: ' 
                        + email.subject.slice(4,) : 
                        'Re: ' 
                        + email.subject;
             document.querySelector('#compose-body').value =
            `\n \n  --------------------------------------- \n 
            On ${email.timestamp}, ${email.sender.split('@',1)} (${email.sender}) wrote: 
            ${email.body}`;           
            })
         

            if (mailbox != 'sent') {
              // If the email is not archived:
              if (email.archived == false) {
                // Show the 'archive' button:
                const archive = document.createElement('button');
                archive.className ="btn btn-primary ";
                archive.id = "archive";
                archive.textContent = "Archive";
                emailContent.appendChild(archive);
                // Archive the email:
                archive.addEventListener('click', () => {
                  fetch(`/emails/${email.id}`, {
                    method: 'PUT',
                    body: JSON.stringify({ archived: true })
                  })
                  load_mailbox('inbox');
                });
              } else {
                // Show the button 'unarchive'
                const unarchive = document.createElement('button');
                unarchive.className ="btn btn-primary";
                unarchive.id = "unarchive";
                unarchive.textContent = "Unarchive";
                emailContent.appendChild(unarchive);
                // Unarchive the email:
                unarchive.addEventListener('click', () => {
                  fetch(`/emails/${email.id}`, {
                    method: 'PUT',
                    body: JSON.stringify({ archived: false })
                  })
                  load_mailbox('inbox')
                });
              }
            }  
          })  
        })
      })
    }
  }) 
}




