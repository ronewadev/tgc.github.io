import { db, storage } from './firebase.js';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, where } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js";

// Load jobs dynamically on careers page
async function loadJobsOnCareersPage() {
  const loadingStatus = document.getElementById('loading-status');
  const jobsList = document.getElementById('jobs-list');
  const positionSelect = document.getElementById('position');
  
  console.log('🔍 Starting to load jobs...');
  
  if (loadingStatus) {
    loadingStatus.innerHTML = 'Connecting to database...';
  }
  
  try {
    console.log('📡 Fetching jobs from Firestore...');
    
    // First, try to get all jobs to see if there are any
    const allJobsSnapshot = await getDocs(collection(db, "jobs"));
    console.log(`📊 Total jobs in database: ${allJobsSnapshot.size}`);
    
    if (loadingStatus) {
      loadingStatus.innerHTML = `Found ${allJobsSnapshot.size} jobs in database. Filtering active jobs...`;
    }
    
    // Now get only active jobs
    const jobsQuery = query(collection(db, "jobs"), where("isActive", "==", true));
    const querySnapshot = await getDocs(jobsQuery);
    console.log(`✅ Active jobs: ${querySnapshot.size}`);
    
    if (!jobsList) {
      console.error('❌ jobs-list element not found');
      return;
    }
    
    // Clear the jobs list
    jobsList.innerHTML = '';
    
    // Clear and reset position select
    if (positionSelect) {
      positionSelect.innerHTML = '<option value="">Select a position</option>';
    }
    
    // Hide loading status
    if (loadingStatus) {
      loadingStatus.style.display = 'none';
    }
    
    if (querySnapshot.empty) {
      console.log('📝 No active jobs found');
      jobsList.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;"><p>No job openings available at the moment.</p><p><small>Check back later for new opportunities!</small></p></div>';
      return;
    }
    
    let jobCount = 0;
    querySnapshot.forEach((doc) => {
      jobCount++;
      const job = doc.data();
      const jobId = doc.id;
      
      console.log(`🎯 Processing job ${jobCount}:`, job.title);
      
      // Create job card
      const jobCard = document.createElement('div');
      jobCard.className = 'job-card';
      jobCard.innerHTML = `
        <h3>${job.title || 'Untitled Position'}</h3>
        <div class="job-meta">
          <div class="job-meta-item"><i class="fas fa-map-marker-alt"></i> ${job.location || 'Location TBD'}</div>
          <div class="job-meta-item"><i class="fas fa-briefcase"></i> ${job.type || 'Full-time'}</div>
          <div class="job-meta-item"><i class="fas fa-clock"></i> Posted ${job.postedDate ? new Date(job.postedDate.toDate()).toLocaleDateString() : 'Recently'}</div>
        </div>
        <div class="job-description">
          <p>${job.description || 'Job description coming soon.'}</p>
        </div>
        <div class="job-requirements">
          <h4>Requirements:</h4>
          <ul>
            ${job.requirements && job.requirements.length > 0 
              ? job.requirements.map(req => `<li>${req}</li>`).join('') 
              : '<li>No specific requirements listed</li>'}
          </ul>
        </div>
        <a href="#apply" class="apply-btn" onclick="scrollToApplication()">Apply Now</a>
      `;
      
      jobsList.appendChild(jobCard);
      
      // Add to position select dropdown
      if (positionSelect) {
        const option = document.createElement('option');
        option.value = jobId;
        option.textContent = job.title || 'Untitled Position';
        positionSelect.appendChild(option);
      }
    });
    
    console.log(`🎉 Successfully loaded ${jobCount} jobs!`);
    
  } catch (error) {
    console.error('❌ Error loading jobs:', error);
    
    if (loadingStatus) {
      loadingStatus.innerHTML = `❌ Error loading jobs: ${error.message}`;
      loadingStatus.style.color = '#d32f2f';
    }
    
    if (jobsList) {
      jobsList.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #d32f2f; border: 1px solid #ffcdd2; background: #ffebee; border-radius: 8px;">
          <h3>Unable to Load Jobs</h3>
          <p>There was an error loading job openings: ${error.message}</p>
          <p><small>Please try refreshing the page or contact support.</small></p>
        </div>
      `;
    }
    
    // Check for specific error types
    if (error.code === 'permission-denied') {
      console.error('🔒 Firestore security rules are blocking read access');
    } else if (error.code === 'unavailable') {
      console.error('🔌 Firestore service is unavailable');
    }
  }
}

// Helper function to scroll to application form
window.scrollToApplication = function() {
  document.getElementById('apply').scrollIntoView({ behavior: 'smooth' });
};

// Load events dynamically on events page
async function loadEventsOnEventsPage() {
  try {
    const eventsQuery = query(collection(db, "events"), where("isActive", "==", true));
    const querySnapshot = await getDocs(eventsQuery);
    const eventsList = document.getElementById('events-list');
    
    if (!eventsList) return;
    
    eventsList.innerHTML = '';
    
    if (querySnapshot.empty) {
      eventsList.innerHTML = '<li>No upcoming events at the moment.</li>';
      return;
    }
    
    querySnapshot.forEach((doc) => {
      const event = doc.data();
      const eventItem = document.createElement('li');
      eventItem.innerHTML = `<strong>${event.title}</strong> - ${new Date(event.date?.toDate()).toLocaleDateString()}`;
      eventsList.appendChild(eventItem);
    });
    
  } catch (error) {
    console.error('Error loading events:', error);
  }
}

// Load programs dynamically on events page
async function loadProgramsOnEventsPage() {
  try {
    const programsQuery = query(collection(db, "programs"), where("isActive", "==", true));
    const querySnapshot = await getDocs(programsQuery);
    const programsList = document.getElementById('programs-list');
    
    if (!programsList) return;
    
    programsList.innerHTML = '';
    
    if (querySnapshot.empty) {
      programsList.innerHTML = '<p>No programs available at the moment.</p>';
      return;
    }
    
    querySnapshot.forEach((doc) => {
      const program = doc.data();
      const programCard = document.createElement('div');
      programCard.className = 'program-card';
      programCard.innerHTML = `
        <span class="program-type">${program.type?.toUpperCase() || 'PROGRAM'}</span>
        <h3>${program.title}</h3>
        <p>${program.description}</p>
        <div class="program-meta">
          ${program.stats?.map(stat => 
            `<div class="program-meta-item">
              <i class="${stat.icon || 'fas fa-info-circle'}"></i> ${stat.label}: ${stat.value}
            </div>`
          ).join('') || ''}
        </div>
        <a href="#" class="learn-more-btn">Learn More</a>
      `;
      programsList.appendChild(programCard);
    });
    
  } catch (error) {
    console.error('Error loading programs:', error);
  }
}

// Upload resume to Firebase Storage
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

// Submit job application
async function submitJobApplication(formData, jobId) {
  try {
    const applicationData = {
      jobId: jobId,
      applicantName: `${formData.get('first-name')} ${formData.get('last-name')}`,
      applicantEmail: formData.get('email'),
      applicantPhone: formData.get('phone'),
      coverLetter: formData.get('cover-letter'),
      applicationDate: new Date(),
      status: 'Pending'
    };
    
    // Add application to Firestore first to get the ID
    const docRef = await addDoc(collection(db, "applications"), applicationData);
    const applicationId = docRef.id;
    
    // Handle resume upload if file is selected
    const resumeFile = formData.get('resume');
    if (resumeFile && resumeFile.size > 0) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(resumeFile.type)) {
        throw new Error('Please upload a PDF or Word document');
      }
      
      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (resumeFile.size > maxSize) {
        throw new Error('File size must be less than 5MB');
      }
      
      try {
        const resumeURL = await uploadResumeToStorage(resumeFile, applicationId);
        
        // Update the application with the resume URL
        await updateDoc(doc(db, "applications", applicationId), {
          resumeURL: resumeURL
        });
      } catch (uploadError) {
        console.error('Resume upload failed:', uploadError);
        // Don't fail the entire application if resume upload fails
        // Just log the error and continue
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error submitting application:', error);
    throw error;
  }
}

// Initialize page-specific functionality
document.addEventListener('DOMContentLoaded', () => {
  const currentPage = window.location.pathname;
  
  if (currentPage.includes('careers.html')) {
    loadJobsOnCareersPage();
    
    // Handle job application form
    const careerForm = document.getElementById('career-form');
    if (careerForm) {
      careerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(careerForm);
        const selectedJobId = formData.get('position');
        
        if (!selectedJobId) {
          alert('Please select a position to apply for.');
          return;
        }
        
        try {
          await submitJobApplication(formData, selectedJobId);
          alert('Your application has been submitted successfully! We will contact you if there is a match with our current openings.');
          careerForm.reset();
        } catch (error) {
          alert('Failed to submit application. Please try again.');
        }
      });
    }
  }
  
  if (currentPage.includes('events.html')) {
    loadEventsOnEventsPage();
    loadProgramsOnEventsPage();
  }
});
