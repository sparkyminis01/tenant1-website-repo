// Your JavaScript code here
document.addEventListener('DOMContentLoaded', function() {
    const commentsContainer = document.getElementById('lightwebcomments-container');
    if (!commentsContainer) {
        console.log('LightWebComments widget container not found on this page.');
        return;
    }

    const pageURL = window.location.href;
    const apiBaseUrl = "https://flasky.local/engagemini/v1";

    if (!apiBaseUrl) {
        console.error('WEBSITE_COMMENT_SERVER config not found.');
        commentsContainer.innerHTML = '<p>Error: Comment server URL not configured.</p>';
        return;
    }

    const apiEndpointUrl_getComments = `${apiBaseUrl}/get_comments?page_url=${encodeURIComponent(pageURL)}`;
    const apiEndpointUrl_submitComment = `${apiBaseUrl}/submit_comment`;

    // --- Fetch and Render Comments ---
    function fetchComments() {
        console.log('Fetching comments from:', apiEndpointUrl_getComments);
        commentsContainer.innerHTML = '<p>Loading comments from server...</p>';

        fetch(apiEndpointUrl_getComments)
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw err; });
            }
            return response.json();
        })
        .then(data => {
            console.log('Comments data received:', data);
            if (data && data.comments && Array.isArray(data.comments) && data.comments.length > 0) {
                renderComments(commentsContainer, data.comments);
            } else {
                commentsContainer.innerHTML = '<p>No comments yet. Be the first to comment!</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching comments:', error);
            commentsContainer.innerHTML = '<p>Failed to load comments.</p>';
        });
    }


    function renderComments(container, comments) {
        const commentsListHTML = `
            <div class="container my-5 py-5">
                <div class="row d-flex justify-content-center">
                    <div class="col-md-12 col-lg-10">
                        <div class="card text-body">
                            <span class="fs-1 badge bg-secondary">Recent comments</span>
                            <span class="fw-lighter fs-3">Comments powered by <a href="https://www.sparkyminis.com/engagemini">EngageMini API</a></span>

                            <hr class="my-0" />
                            ${comments.map(comment => `
                                <div class="card-body p-4">
                                    <div class="d-flex flex-start">
                                        <div>
                                            <h6 class="fw-bold mb-1" style="font-size: 2rem;">${comment.name || 'Anonymous'}</h6>
                                            <div class="d-flex align-items-center mb-3">
                                                <p class="mark mb-0 comment-date" style="font-size: 0.8rem;">
                                                    ${new Date(comment.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                                                </p>
                                            </div>
                                            <p class="mb-0 comment-body" style="font-size: 1rem;">
                                                ${comment.comment_text}
                                            </p>
                                        </div>
                                    </div>
                                    <hr class="my-0" style="height: 1px;" />
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML = commentsListHTML;
    }



    // --- Comment Submission Form Handling ---
    const commentForm = document.getElementById('lightwebcomments-form');
    if (commentForm) {
        commentForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const nameInput = commentForm.querySelector('#name');
            const commentInput = commentForm.querySelector('#comment');
            const name = nameInput.value.trim();
            const commentText = commentInput.value.trim();

            if (!commentText) {
                showErrorAlert('Please enter your comment.');
                return;
            }

            const commentData = {
                page_url: pageURL,
                name: name || null,
                comment_text: commentText
            };

            console.log('Submitting comment:', commentData);

            fetch(apiEndpointUrl_submitComment, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(commentData)
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw err; });
                }
                return response.json();
            })
            .then(data => {
                console.log('Comment submitted successfully:', data);

                let messageToDisplay = data.message; // Start with the base message from backend

                if (data.truncated) {
                    messageToDisplay += ` Comment was truncated to ${data.max_length} characters.`; // Append truncation info
                }

                showSuccessAlert(messageToDisplay); // Display the dynamic message

                nameInput.value = '';
                commentInput.value = '';

                commentsContainer.innerHTML = '<p>Loading comments from server...</p>';
                fetchComments();
            })
            .catch(error => {
                // ... error handling ...
            });
        });
    }


    // --- Alert Display Functions (for both comment and newsletter forms) ---
    function showAlert(type, message) {
        const alertHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                <strong>${type === 'success' ? 'Success!' : 'Oops!'}</strong> ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        commentForm.insertAdjacentHTML('beforebegin', alertHTML);
        commentForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        setTimeout(() => {
            const alertElement = commentForm.previousElementSibling;
            if (alertElement && alertElement.classList.contains('alert')) {
                alertElement.remove();
            }
        }, 10000);
    }

    function showErrorAlert(message) {
        showAlert('warning', message);
    }

    function showSuccessAlert(message) {
        showAlert('success', message);
    }

    // --- Initial comment load ---
    if (commentsContainer) { // Only fetch comments if the container exists
        fetchComments();
    }

});