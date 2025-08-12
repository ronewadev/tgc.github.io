import { auth, db, storage } from './firebase.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, getDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js";

document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    setupTabs();
    setupJobForm();
    setupEventForm();
    setupProgramForm();
    document.getElementById('logout-btn')?.addEventListener('click', logout);
});

// Make functions globally available for onclick handlers
window.toggleJobStatus = toggleJobStatus;
window.editJob = editJob;
window.deleteJob = deleteJob;
window.showApplications = showApplications;
window.toggleEventStatus = toggleEventStatus;
window.editEvent = editEvent;
window.deleteEvent = deleteEvent;
window.toggleProgramStatus = toggleProgramStatus;
window.editProgram = editProgram;
window.deleteProgram = deleteProgram;

function checkAuth() {
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.href = 'login.html';
        } else {
            // User is signed in, load all data
            loadJobs();
            loadApplications();
            loadEvents();
            loadPrograms();
        }
    });
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

async function loadJobs() {
    try {
        const querySnapshot = await getDocs(collection(db, "jobs"));
        const jobsList = document.getElementById('jobs-list');
        const jobFilter = document.getElementById('job-filter');
        
        if (!jobsList) return;
        
        jobsList.innerHTML = '';
        if (jobFilter) {
            jobFilter.innerHTML = '<option value="">All Jobs</option>';
        }
        
        if (querySnapshot.empty) {
            jobsList.innerHTML = '<p>No jobs posted yet.</p>';
            return;
        }
        
        querySnapshot.forEach((doc) => {
            const job = doc.data();
            const jobId = doc.id;
            
            // Add to jobs list with new structure
            const jobItem = document.createElement('div');
            jobItem.className = 'job-item';
            jobItem.setAttribute('data-id', jobId);
            jobItem.innerHTML = `
                <div class="job-header">
                    <h4>${job.title}</h4>
                    <span class="job-status ${job.isActive ? 'active' : 'inactive'}">${job.isActive ? 'Active' : 'Inactive'}</span>
                </div>
                <p><strong>Location:</strong> ${job.location}</p>
                <p><strong>Type:</strong> ${job.type}</p>
                <p><strong>Posted:</strong> ${job.postedDate?.toDate ? job.postedDate.toDate().toLocaleDateString() : new Date(job.postedDate).toLocaleDateString()}</p>
                ${job.deadline ? `<p><strong>Deadline:</strong> ${job.deadline?.toDate ? job.deadline.toDate().toLocaleDateString() : new Date(job.deadline).toLocaleDateString()}</p>` : ''}
                <p><strong>Description:</strong> ${job.description.length > 150 ? job.description.substring(0, 150) + '...' : job.description}</p>
                <div class="job-actions">
                    <button onclick="toggleJobStatus('${jobId}', ${!job.isActive})" class="btn ${job.isActive ? 'btn-danger' : 'btn-success'}">
                        ${job.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onclick="editJob('${jobId}')" class="btn btn-secondary">Edit</button>
                    <button onclick="deleteJob('${jobId}')" class="btn btn-danger">Delete</button>
                    <button onclick="showApplications('${jobId}')" class="btn btn-primary">Applications</button>
                </div>
            `;
            jobsList.appendChild(jobItem);
            
            // Add to job filter dropdown
            if (jobFilter) {
                const option = document.createElement('option');
                option.value = jobId;
                option.textContent = job.title;
                jobFilter.appendChild(option);
            }
        });
        
    } catch (error) {
        console.error('Error loading jobs:', error);
        alert('Failed to load jobs');
    }
}

async function loadApplications(jobId = '') {
    try {
        let applicationsQuery;
        if (jobId) {
            applicationsQuery = query(collection(db, "applications"), where("jobId", "==", jobId), orderBy("applicationDate", "desc"));
        } else {
            applicationsQuery = query(collection(db, "applications"), orderBy("applicationDate", "desc"));
        }
        
        const querySnapshot = await getDocs(applicationsQuery);
        const appsList = document.getElementById('applications-list');
        
        if (!appsList) return;
        
        appsList.innerHTML = '';
        
        if (querySnapshot.empty) {
            appsList.innerHTML = '<p>No applications found.</p>';
            return;
        }
        
        for (const docSnap of querySnapshot.docs) {
            const app = docSnap.data();
            const appId = docSnap.id;
            
            // Get job details
            let jobTitle = 'Unknown Job';
            if (app.jobId) {
                try {
                    const jobDoc = await getDocs(query(collection(db, "jobs"), where("__name__", "==", app.jobId)));
                    if (!jobDoc.empty) {
                        jobTitle = jobDoc.docs[0].data().title;
                    }
                } catch (error) {
                    console.error('Error fetching job details:', error);
                }
            }
            
            const appItem = document.createElement('div');
            appItem.className = 'application-item';
            appItem.innerHTML = `
                <h4>${app.applicantName} - ${jobTitle}</h4>
                <p>Email: ${app.applicantEmail} | Phone: ${app.applicantPhone}</p>
                <p>Applied: ${new Date(app.applicationDate?.toDate()).toLocaleDateString()}</p>
                <p>Status: 
                    <select class="status-select" data-id="${appId}">
                        <option value="Pending" ${app.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Reviewed" ${app.status === 'Reviewed' ? 'selected' : ''}>Reviewed</option>
                        <option value="Interview" ${app.status === 'Interview' ? 'selected' : ''}>Interview</option>
                        <option value="Rejected" ${app.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                        <option value="Hired" ${app.status === 'Hired' ? 'selected' : ''}>Hired</option>
                    </select>
                </p>
                <p>Cover Letter: ${app.coverLetter || 'None provided'}</p>
                ${app.resumeURL ? `<a href="${app.resumeURL}" target="_blank">View Resume</a>` : '<p>No resume uploaded</p>'}
            `;
            appsList.appendChild(appItem);
        }
        
        // Add event listeners for status changes
        document.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', function() {
                updateApplicationStatus(this.getAttribute('data-id'), this.value);
            });
        });
        
    } catch (error) {
        console.error('Error loading applications:', error);
        alert('Failed to load applications');
    }
}

async function setupJobForm() {
    console.log('Setting up job form...'); // Debug log
    const form = document.getElementById('job-form');
    const requirementsContainer = document.getElementById('requirements-container');
    
    if (!form || !requirementsContainer) {
        console.error('Job form or requirements container not found');
        return;
    }
    
    console.log('Job form found, setting up event listeners...'); // Debug log
    
    // Add requirement field
    document.getElementById('add-requirement')?.addEventListener('click', function() {
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
    form.addEventListener('submit', async function(e) {
        console.log('Job form submitted!'); // Debug log
        e.preventDefault();
        
        const requirements = [];
        document.querySelectorAll('.requirement').forEach(input => {
            if (input.value.trim()) {
                requirements.push(input.value.trim());
            }
        });
        
        console.log('Requirements:', requirements); // Debug log
        
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
            deadline: document.getElementById('job-deadline').value ? new Date(document.getElementById('job-deadline').value) : null,
            postedDate: new Date(),
            isActive: true
        };
        
        console.log('Job data:', jobData); // Debug log
        
        const editingJobId = form.getAttribute('data-editing');
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        
        // Add loading state
        submitBtn.classList.add('btn-loading');
        submitBtn.disabled = true;
        
        try {
            if (editingJobId) {
                // Update existing job
                const jobRef = doc(db, "jobs", editingJobId);
                await updateDoc(jobRef, {
                    ...jobData,
                    postedDate: (await getDoc(jobRef)).data().postedDate // Keep original posted date
                });
                alert('Job updated successfully!');
                form.removeAttribute('data-editing');
                submitBtn.textContent = 'POST JOB';
            } else {
                // Create new job
                await addDoc(collection(db, "jobs"), jobData);
                alert('Job posted successfully!');
                console.log('Job created successfully!'); // Debug log
            }
            
            form.reset();
            // Reset requirements to one field
            requirementsContainer.innerHTML = `
                <div class="requirement-item">
                    <input type="text" class="requirement" placeholder="Requirement" required>
                    <button type="button" class="remove-requirement"><i class="fas fa-times"></i></button>
                </div>
            `;
            loadJobs();
        } catch (error) {
            console.error('Error saving job:', error);
            alert('Failed to save job: ' + error.message);
        } finally {
            // Remove loading state
            submitBtn.classList.remove('btn-loading');
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
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

async function updateApplicationStatus(appId, status) {
    try {
        const applicationRef = doc(db, "applications", appId);
        await updateDoc(applicationRef, {
            status: status
        });
        console.log('Application status updated successfully');
    } catch (error) {
        console.error('Error updating application status:', error);
        alert('Failed to update application status');
    }
}

async function toggleJobStatus(jobId, isActive) {
    try {
        const jobRef = doc(db, "jobs", jobId);
        await updateDoc(jobRef, {
            isActive: isActive
        });
        console.log('Job status updated successfully');
        loadJobs(); // Refresh the jobs list
    } catch (error) {
        console.error('Error updating job status:', error);
        alert('Failed to update job status');
    }
}

async function editJob(jobId) {
    try {
        const jobDoc = await getDoc(doc(db, "jobs", jobId));
        if (!jobDoc.exists()) {
            alert('Job not found');
            return;
        }
        
        const job = jobDoc.data();
        
        // Populate form fields
        document.getElementById('job-title').value = job.title;
        document.getElementById('job-description').value = job.description;
        document.getElementById('job-location').value = job.location;
        document.getElementById('job-type').value = job.type;
        
        if (job.deadline) {
            const deadline = job.deadline?.toDate ? job.deadline.toDate() : new Date(job.deadline);
            document.getElementById('job-deadline').value = deadline.toISOString().split('T')[0];
        }
        
        // Handle requirements
        const requirementsContainer = document.getElementById('requirements-container');
        requirementsContainer.innerHTML = '';
        
        if (job.requirements && job.requirements.length > 0) {
            job.requirements.forEach(req => {
                const div = document.createElement('div');
                div.className = 'requirement-item';
                div.innerHTML = `
                    <input type="text" class="requirement" value="${req}" required>
                    <button type="button" class="remove-requirement"><i class="fas fa-times"></i></button>
                `;
                requirementsContainer.appendChild(div);
                
                div.querySelector('.remove-requirement').addEventListener('click', function() {
                    if (requirementsContainer.children.length > 1) {
                        div.remove();
                    }
                });
            });
        } else {
            // Add default requirement field
            const div = document.createElement('div');
            div.className = 'requirement-item';
            div.innerHTML = `
                <input type="text" class="requirement" placeholder="Requirement" required>
                <button type="button" class="remove-requirement"><i class="fas fa-times"></i></button>
            `;
            requirementsContainer.appendChild(div);
        }
        
        // Store job ID for update
        document.getElementById('job-form').setAttribute('data-editing', jobId);
        
        // Scroll to form
        document.getElementById('job-form').scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('Error loading job for editing:', error);
        alert('Failed to load job details');
    }
}

async function deleteJob(jobId) {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
        return;
    }
    
    try {
        await deleteDoc(doc(db, "jobs", jobId));
        alert('Job deleted successfully');
        loadJobs(); // Refresh the jobs list
    } catch (error) {
        console.error('Error deleting job:', error);
        alert('Failed to delete job');
    }
}

async function showApplications(jobId) {
    // Load applications for this specific job
    await loadApplications(jobId);
    
    // Scroll to applications section
    const applicationsSection = document.getElementById('applications-list');
    if (applicationsSection) {
        applicationsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

async function logout() {
    try {
        await signOut(auth);
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Error signing out:', error);
        alert('Error signing out');
    }
}

// Job filter change
document.getElementById('job-filter').addEventListener('change', function() {
    loadApplications(this.value);
});

// Example login function
function loginAdmin(email, password) {
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;
      // Check if user is admin (optional: check Firestore for admin role)
    })
    .catch((error) => {
      // Handle errors
    });
}

// File Upload Functions
async function uploadResumeToStorage(file, applicationId) {
    try {
        // Create a reference to the file location
        const storageRef = ref(storage, `resumes/${applicationId}/${file.name}`);
        
        // Upload the file
        const snapshot = await uploadBytes(storageRef, file);
        
        // Get the download URL
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        return downloadURL;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
}

// Helper function to handle file uploads in application forms
function handleResumeUpload(fileInput, applicationId) {
    return new Promise((resolve, reject) => {
        const file = fileInput.files[0];
        if (!file) {
            resolve(null);
            return;
        }
        
        // Validate file type
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            reject(new Error('Please upload a PDF or Word document'));
            return;
        }
        
        // Validate file size (5MB limit)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            reject(new Error('File size must be less than 5MB'));
            return;
        }
        
        uploadResumeToStorage(file, applicationId)
            .then(resolve)
            .catch(reject);
    });
}
async function setupEventForm() {
    const form = document.getElementById('event-form');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const eventData = {
            title: document.getElementById('event-title').value.trim(),
            description: document.getElementById('event-description').value.trim(),
            date: new Date(document.getElementById('event-date').value),
            location: document.getElementById('event-location').value.trim(),
            capacity: parseInt(document.getElementById('event-capacity').value) || null,
            registrationDeadline: document.getElementById('event-registration-deadline').value ? 
                new Date(document.getElementById('event-registration-deadline').value) : null,
            createdDate: new Date(),
            isActive: true
        };
        
        const editingEventId = form.getAttribute('data-editing');
        
        try {
            if (editingEventId) {
                // Update existing event
                const eventRef = doc(db, "events", editingEventId);
                await updateDoc(eventRef, {
                    ...eventData,
                    createdDate: (await getDoc(eventRef)).data().createdDate // Keep original created date
                });
                alert('Event updated successfully!');
                form.removeAttribute('data-editing');
            } else {
                // Create new event
                await addDoc(collection(db, "events"), eventData);
                alert('Event created successfully!');
            }
            
            form.reset();
            loadEvents();
        } catch (error) {
            console.error('Error saving event:', error);
            alert('Failed to save event');
        }
    });
}

async function loadEvents() {
    try {
        const eventsRef = collection(db, "events");
        const q = query(eventsRef, orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);
        
        const eventsList = document.getElementById('events-list');
        if (!eventsList) return;
        
        if (querySnapshot.empty) {
            eventsList.innerHTML = '<p class="no-data">No events created yet.</p>';
            return;
        }
        
        const events = [];
        querySnapshot.forEach((doc) => {
            events.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        eventsList.innerHTML = events.map(event => `
            <div class="event-item" data-id="${event.id}">
                <div class="event-header">
                    <h4>${event.title}</h4>
                    <span class="event-status ${event.isActive ? 'active' : 'inactive'}">${event.isActive ? 'Active' : 'Inactive'}</span>
                </div>
                <p><strong>Date:</strong> ${event.date?.toDate ? event.date.toDate().toLocaleDateString() : new Date(event.date).toLocaleDateString()}</p>
                <p><strong>Location:</strong> ${event.location}</p>
                <p><strong>Capacity:</strong> ${event.capacity || 'Unlimited'}</p>
                <div class="event-actions">
                    <button onclick="toggleEventStatus('${event.id}', ${!event.isActive})" class="btn ${event.isActive ? 'btn-danger' : 'btn-success'}">
                        ${event.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onclick="editEvent('${event.id}')" class="btn btn-secondary">Edit</button>
                    <button onclick="deleteEvent('${event.id}')" class="btn btn-danger">Delete</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading events:', error);
        const eventsList = document.getElementById('events-list');
        if (eventsList) {
            eventsList.innerHTML = '<p class="error">Failed to load events.</p>';
        }
    }
}

async function toggleEventStatus(eventId, isActive) {
    try {
        const eventRef = doc(db, "events", eventId);
        await updateDoc(eventRef, {
            isActive: isActive
        });
        loadEvents();
    } catch (error) {
        console.error('Error updating event status:', error);
        alert('Failed to update event status');
    }
}

async function editEvent(eventId) {
    try {
        const eventDoc = await getDoc(doc(db, "events", eventId));
        if (!eventDoc.exists()) {
            alert('Event not found');
            return;
        }
        
        const event = eventDoc.data();
        
        // Populate form fields
        document.getElementById('event-title').value = event.title;
        document.getElementById('event-description').value = event.description;
        document.getElementById('event-location').value = event.location;
        document.getElementById('event-capacity').value = event.capacity || '';
        
        if (event.date) {
            const eventDate = event.date?.toDate ? event.date.toDate() : new Date(event.date);
            document.getElementById('event-date').value = eventDate.toISOString().split('T')[0];
        }
        
        if (event.registrationDeadline) {
            const deadline = event.registrationDeadline?.toDate ? event.registrationDeadline.toDate() : new Date(event.registrationDeadline);
            document.getElementById('event-registration-deadline').value = deadline.toISOString().split('T')[0];
        }
        
        // Store event ID for update
        document.getElementById('event-form').setAttribute('data-editing', eventId);
        
        // Scroll to form
        document.getElementById('event-form').scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('Error loading event for editing:', error);
        alert('Failed to load event details');
    }
}

async function deleteEvent(eventId) {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
        return;
    }
    
    try {
        await deleteDoc(doc(db, "events", eventId));
        alert('Event deleted successfully');
        loadEvents();
    } catch (error) {
        console.error('Error deleting event:', error);
        alert('Failed to delete event');
    }
}

// Program Management Functions
async function setupProgramForm() {
    const form = document.getElementById('program-form');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const programData = {
            title: document.getElementById('program-title').value.trim(),
            description: document.getElementById('program-description').value.trim(),
            duration: document.getElementById('program-duration').value.trim(),
            requirements: document.getElementById('program-requirements').value.trim().split('\n').filter(req => req.trim()),
            startDate: document.getElementById('program-start-date').value ? 
                new Date(document.getElementById('program-start-date').value) : null,
            applicationDeadline: document.getElementById('program-application-deadline').value ? 
                new Date(document.getElementById('program-application-deadline').value) : null,
            createdDate: new Date(),
            isActive: true
        };
        
        const editingProgramId = form.getAttribute('data-editing');
        
        try {
            if (editingProgramId) {
                // Update existing program
                const programRef = doc(db, "programs", editingProgramId);
                await updateDoc(programRef, {
                    ...programData,
                    createdDate: (await getDoc(programRef)).data().createdDate // Keep original created date
                });
                alert('Program updated successfully!');
                form.removeAttribute('data-editing');
            } else {
                // Create new program
                await addDoc(collection(db, "programs"), programData);
                alert('Program created successfully!');
            }
            
            form.reset();
            loadPrograms();
        } catch (error) {
            console.error('Error saving program:', error);
            alert('Failed to save program');
        }
    });
}

async function loadPrograms() {
    try {
        const programsRef = collection(db, "programs");
        const q = query(programsRef, orderBy("createdDate", "desc"));
        const querySnapshot = await getDocs(q);
        
        const programsList = document.getElementById('programs-list');
        if (!programsList) return;
        
        if (querySnapshot.empty) {
            programsList.innerHTML = '<p class="no-data">No programs created yet.</p>';
            return;
        }
        
        const programs = [];
        querySnapshot.forEach((doc) => {
            programs.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        programsList.innerHTML = programs.map(program => `
            <div class="program-item" data-id="${program.id}">
                <div class="program-header">
                    <h4>${program.title}</h4>
                    <span class="program-status ${program.isActive ? 'active' : 'inactive'}">${program.isActive ? 'Active' : 'Inactive'}</span>
                </div>
                <p><strong>Duration:</strong> ${program.duration}</p>
                <p><strong>Start Date:</strong> ${program.startDate ? (program.startDate?.toDate ? program.startDate.toDate().toLocaleDateString() : new Date(program.startDate).toLocaleDateString()) : 'TBA'}</p>
                <p><strong>Application Deadline:</strong> ${program.applicationDeadline ? (program.applicationDeadline?.toDate ? program.applicationDeadline.toDate().toLocaleDateString() : new Date(program.applicationDeadline).toLocaleDateString()) : 'None'}</p>
                <div class="program-actions">
                    <button onclick="toggleProgramStatus('${program.id}', ${!program.isActive})" class="btn ${program.isActive ? 'btn-danger' : 'btn-success'}">
                        ${program.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onclick="editProgram('${program.id}')" class="btn btn-secondary">Edit</button>
                    <button onclick="deleteProgram('${program.id}')" class="btn btn-danger">Delete</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading programs:', error);
        const programsList = document.getElementById('programs-list');
        if (programsList) {
            programsList.innerHTML = '<p class="error">Failed to load programs.</p>';
        }
    }
}

async function toggleProgramStatus(programId, isActive) {
    try {
        const programRef = doc(db, "programs", programId);
        await updateDoc(programRef, {
            isActive: isActive
        });
        loadPrograms();
    } catch (error) {
        console.error('Error updating program status:', error);
        alert('Failed to update program status');
    }
}

async function editProgram(programId) {
    try {
        const programDoc = await getDoc(doc(db, "programs", programId));
        if (!programDoc.exists()) {
            alert('Program not found');
            return;
        }
        
        const program = programDoc.data();
        
        // Populate form fields
        document.getElementById('program-title').value = program.title;
        document.getElementById('program-description').value = program.description;
        document.getElementById('program-duration').value = program.duration;
        document.getElementById('program-requirements').value = program.requirements ? program.requirements.join('\n') : '';
        
        if (program.startDate) {
            const startDate = program.startDate?.toDate ? program.startDate.toDate() : new Date(program.startDate);
            document.getElementById('program-start-date').value = startDate.toISOString().split('T')[0];
        }
        
        if (program.applicationDeadline) {
            const deadline = program.applicationDeadline?.toDate ? program.applicationDeadline.toDate() : new Date(program.applicationDeadline);
            document.getElementById('program-application-deadline').value = deadline.toISOString().split('T')[0];
        }
        
        // Store program ID for update
        document.getElementById('program-form').setAttribute('data-editing', programId);
        
        // Scroll to form
        document.getElementById('program-form').scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('Error loading program for editing:', error);
        alert('Failed to load program details');
    }
}

async function deleteProgram(programId) {
    if (!confirm('Are you sure you want to delete this program? This action cannot be undone.')) {
        return;
    }
    
    try {
        await deleteDoc(doc(db, "programs", programId));
        alert('Program deleted successfully');
        loadPrograms();
    } catch (error) {
        console.error('Error deleting program:', error);
        alert('Failed to delete program');
    }
}

// Job filter functionality
document.addEventListener('DOMContentLoaded', () => {
    // Job filter change event
    const jobFilter = document.getElementById('job-filter');
    if (jobFilter) {
        jobFilter.addEventListener('change', function() {
            loadApplications(this.value);
        });
    }
});