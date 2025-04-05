// Your JavaScript code here
document.addEventListener('DOMContentLoaded', function() {
    // --- Newsletter Signup Form Handling ---
    const newsletterForm = document.getElementById('newsletter-form');
    const newsletterMessageDiv = document.getElementById('newsletter-message');
    const pageURL = window.location.href;
    const apiBaseUrl = "https://api.sparkyminis.com/catchmini/v1"; // Assuming the same base URL is used
    const apiEndpointUrl_submitNewsletterEmail = `${apiBaseUrl}/submit_newsletter_email`; // <---- Newsletter API endpoint URL

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const emailInput = newsletterForm.querySelector('#newsletter-email');
            const email = emailInput.value.trim();

            if (!isValidEmailFormat(email)) {
                displayNewsletterMessage('warning', 'Please enter a valid email address.');
                return;
            }

            const newsletterData = { email: email, page_url: pageURL };

            fetch(apiEndpointUrl_submitNewsletterEmail, { // <---- Use absolute URL from apiEndpointUrl_submitNewsletterEmail
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newsletterData)
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw err; });
                }
                return response.json();
            })
            .then(data => {
                console.log('Newsletter subscription successful:', data);
                displayNewsletterMessage('success', data.message || 'Successfully subscribed!');
                newsletterForm.reset();
            })
            .catch(error => {
                console.error('Newsletter subscription error:', error);
                let errorMessage = error.error || 'Failed to subscribe. Please try again.';
                displayNewsletterMessage('danger', errorMessage);
            });
        });
    }


    // --- Alert Display Functions (for newsletter form) ---
    function displayNewsletterMessage(type, message) {
        const alertHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                <strong>${type === 'success' ? 'Success!' : 'Oops!'}</strong> ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        newsletterMessageDiv.innerHTML = alertHTML;

        // --- Auto-dismissal logic ---
        const alertElement = newsletterMessageDiv.querySelector('.alert'); // Select the alert element that was just added
        if (alertElement) {
            setTimeout(() => {
                const bsAlert = bootstrap.Alert.getInstance(alertElement); // Get Bootstrap Alert instance
                if (bsAlert) {
                    bsAlert.close(); // Programmatically close the alert using Bootstrap's API
                } else {
                    // Fallback if Bootstrap Alert API is not properly initialized or found
                    alertElement.remove(); // Fallback: Just remove the element from the DOM
                }
            }, 10000); // Auto-dismiss after 10 seconds (10000 milliseconds) - adjust duration as needed
        }
    }


    function isValidEmailFormat(email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    }
});