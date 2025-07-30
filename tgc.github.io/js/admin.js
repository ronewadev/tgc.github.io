document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    setupTabs();
    loadJobs();
    setupJobForm();
    document.getElementById('logout-btn').addEventListener('click', logout);
});

function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
    }
}

function setupTabs() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs and contents
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            document.getElementById(`${tabId}-content`).classList.add('active');
            
            // Load applications if that tab is selected
            if (tabId === 'applications') {
                loadApplications();
            }
        });
    });
}

function loadJobs() {
    const token = localStorage.getItem('token');
    
    fetch('/api/jobs/all', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to fetch jobs');
        return response.json();
    })
    .then(jobs => {
        const jobsList = document.getElementById('jobs-list');
        jobsList.innerHTML = '';
        
        if (jobs.length === 0) {
            jobsList.innerHTML = '<p>No jobs posted yet.</p>';
            return;
        }
        
        const jobFilter = document.getElementById('job-filter');
        jobFilter.innerHTML = '<option value="">All Jobs</option>';
        
        jobs.forEach(job => {
            // Add to jobs list
            const jobItem = document.createElement('div');
            jobItem.className = 'job-item';
            jobItem.innerHTML = `
                <h4>${job.title} <small>(${job.type})</small></h4>
                <p>${job.location} | Posted: ${new Date(job.postedDate).toLocaleDateString()}</p>
                <p>${job.description.substring(0, 100)}...</p>
                <div>
                    <button class="edit-job" data-id="${job._id}">Edit</button>
                    <button class="delete-job" data-id="${job._id}">Delete</button>
                    <label>
                        Active: <input type="checkbox" class="job-status" data-id="${job._id}" ${job.isActive ? 'checked' : ''}>
                    </label>
                </div>
            `;
            jobsList.appendChild(jobItem);
            
            // Add to job filter dropdown
            const option = document.createElement('option');
            option.value = job._id;
            option.textContent = job.title;
            jobFilter.appendChild(option);
        });
        
        // Add event listeners for edit/delete buttons
        document.querySelectorAll('.edit-job').forEach(btn => {
            btn.addEventListener('click', function() {
                editJob(this.getAttribute('data-id'));
            });
        });
        
        document.querySelectorAll('.delete-job').forEach(btn => {
            btn.addEventListener('click', function() {
                deleteJob(this.getAttribute('data-id'));
            });
        });
        
        document.querySelectorAll('.job-status').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                updateJobStatus(this.getAttribute('data-id'), this.checked);
            });
        });
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to load jobs');
    });
}

function loadApplications(jobId = '') {
    const token = localStorage.getItem('token');
    let url = '/api/applications';
    if (jobId) {
        url = `/api/applications/job/${jobId}`;
    }
    
    fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to fetch applications');
        return response.json();
    })
    .then(applications => {
        const appsList = document.getElementById('applications-list');
        appsList.innerHTML = '';
        
        if (applications.length === 0) {
            appsList.innerHTML = '<p>No applications found.</p>';
            return;
        }
        
        applications.forEach(app => {
            const appItem = document.createElement('div');
            appItem.className = 'application-item';
            appItem.innerHTML = `
                <h4>${app.applicantName} - ${app.job.title}</h4>
                <p>Email: ${app.applicantEmail} | Phone: ${app.applicantPhone}</p>
                <p>Applied: ${new Date(app.applicationDate).toLocaleDateString()}</p>
                <p>Status: 
                    <select class="status-select" data-id="${app._id}">
                        <option value="Pending" ${app.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Reviewed" ${app.status === 'Reviewed' ? 'selected' : ''}>Reviewed</option>
                        <option value="Interview" ${app.status === 'Interview' ? 'selected' : ''}>Interview</option>
                        <option value="Rejected" ${app.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                        <option value="Hired" ${app.status === 'Hired' ? 'selected' : ''}>Hired</option>
                    </select>
                </p>
                <p>Cover Letter: ${app.coverLetter || 'None provided'}</p>
                <a href="/${app.resumePath}" target="_blank">View Resume</a>
            `;
            appsList.appendChild(appItem);
        });
        
        // Add event listeners for status changes
        document.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', function() {
                updateApplicationStatus(this.getAttribute('data-id'), this.value);
            });
        });
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to load applications');
    });
}

function setupJobForm() {
    const form = document.getElementById('job-form');
    const requirementsContainer = document.getElementById('requirements-container');
    
    // Add requirement field
    document.getElementById('add-requirement').addEventListener('click', function() {
        const div = document.createElement('div');
        div.className = 'requirement-item';
        div.innerHTML = `
            <input type="text" class="requirement" placeholder="Requirement" required>
            <button type="button" class="remove-requirement"><i class="fas fa-times"></i></button>
        `;
        requirementsContainer.appendChild(div);
        
        // Add event listener to remove button
        div.querySelector('.remove-requirement').addEventListener('click', function() {
            if (requirementsContainer.children.length > 1) {
                div.remove();
            }
        });
    });
    
    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const requirements = [];
        document.querySelectorAll('.requirement').forEach(input => {
            if (input.value.trim()) {
                requirements.push(input.value.trim());
            }
        });
        
        if (requirements.length === 0) {
            alert('Please add at least one requirement');
            return;
        }
        
        const jobData = {
            title: document.getElementById('job-title').value.trim(),
            description: document.getElementById('job-description').value.trim(),
            requirements: requirements,
            location: document.getElementById('job-location').value.trim(),
            type: document.getElementById('job-type').value,
            deadline: document.getElementById('job-deadline').value || undefined
        };
        
        const token = localStorage.getItem('token');
        
        fetch('/api/jobs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(jobData)
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to create job');
            return response.json();
        })
        .then(() => {
            alert('Job posted successfully!');
            form.reset();
            // Reset requirements to one field
            requirementsContainer.innerHTML = `
                <div class="requirement-item">
                    <input type="text" class="requirement" placeholder="Requirement" required>
                    <button type="button" class="remove-requirement"><i class="fas fa-times"></i></button>
                </div>
            `;
            loadJobs();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to post job');
        });
    });
}

function updateJobStatus(jobId, isActive) {
    const token = localStorage.getItem('token');
    
    fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive })
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to update job status');
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to update job status');
    });
}

function updateApplicationStatus(appId, status) {
    const token = localStorage.getItem('token');
    
    fetch(`/api/applications/${appId}/status`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to update application status');
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to update application status');
    });
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

// Job filter change
document.getElementById('job-filter').addEventListener('change', function() {
    loadApplications(this.value);
});