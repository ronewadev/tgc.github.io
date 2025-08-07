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
  const eventsLoading = document.getElementById('events-loading');
  const eventsList = document.getElementById('events-list');
  
  console.log('🎪 Loading events for events page...');
  
  try {
    console.log('📡 Fetching events from Firestore...');
    
    // Get all events first to see what's available
    const allEventsSnapshot = await getDocs(collection(db, "events"));
    console.log(`📊 Total events in database: ${allEventsSnapshot.size}`);
    
    // Get active events
    const eventsQuery = query(collection(db, "events"), where("isActive", "==", true));
    const querySnapshot = await getDocs(eventsQuery);
    console.log(`✅ Active events: ${querySnapshot.size}`);
    
    if (!eventsList) {
      console.error('❌ events-list element not found');
      return;
    }
    
    // Clear the events list
    eventsList.innerHTML = '';
    
    // Hide loading indicator
    if (eventsLoading) {
      eventsLoading.style.display = 'none';
    }
    
    if (querySnapshot.empty) {
      console.log('📝 No active events found');
      eventsList.innerHTML = '<li style="color: #666; font-style: italic;">No upcoming events at the moment. Check back soon!</li>';
      return;
    }
    
    let eventCount = 0;
    querySnapshot.forEach((doc) => {
      eventCount++;
      const event = doc.data();
      console.log(`🎯 Processing event ${eventCount}:`, event.title);
      
      const eventItem = document.createElement('li');
      eventItem.innerHTML = `
        <div style="margin-bottom: 15px; padding: 15px; background: rgba(255, 255, 255, 0.1); border-radius: 8px; border-left: 4px solid var(--primary-color);">
          <strong style="color: var(--primary-color);">${event.title || 'Untitled Event'}</strong><br>
          <small style="color: #666;">
            <i class="fas fa-calendar-alt"></i> ${event.date ? new Date(event.date.toDate()).toLocaleDateString() : 'Date TBD'}
            ${event.time ? `<i class="fas fa-clock" style="margin-left: 15px;"></i> ${event.time}` : ''}
            ${event.location ? `<i class="fas fa-map-marker-alt" style="margin-left: 15px;"></i> ${event.location}` : ''}
          </small>
          ${event.description ? `<p style="margin-top: 8px; color: #555;">${event.description}</p>` : ''}
        </div>
      `;
      eventsList.appendChild(eventItem);
    });
    
    console.log(`🎉 Successfully loaded ${eventCount} events!`);
    
  } catch (error) {
    console.error('❌ Error loading events:', error);
    
    if (eventsLoading) {
      eventsLoading.innerHTML = `❌ Error loading events: ${error.message}`;
      eventsLoading.style.color = '#d32f2f';
    }
    
    if (eventsList) {
      eventsList.innerHTML = '<li style="color: #d32f2f;">Error loading events. Please try again later.</li>';
    }
  }
}

// Load programs dynamically on events page
async function loadProgramsOnEventsPage() {
  const programsLoading = document.getElementById('programs-loading');
  const programsList = document.getElementById('programs-list');
  
  console.log('🚀 Loading programs for events page...');
  
  try {
    console.log('📡 Fetching programs from Firestore...');
    
    // Get all programs first
    const allProgramsSnapshot = await getDocs(collection(db, "programs"));
    console.log(`📊 Total programs in database: ${allProgramsSnapshot.size}`);
    
    // Get active programs
    const programsQuery = query(collection(db, "programs"), where("isActive", "==", true));
    const querySnapshot = await getDocs(programsQuery);
    console.log(`✅ Active programs: ${querySnapshot.size}`);
    
    if (!programsList) {
      console.error('❌ programs-list element not found');
      return;
    }
    
    // Clear the programs list
    programsList.innerHTML = '';
    
    // Hide loading indicator
    if (programsLoading) {
      programsLoading.style.display = 'none';
    }
    
    if (querySnapshot.empty) {
      console.log('📝 No active programs found');
      programsList.innerHTML = '<div style="text-align: center; padding: 40px; color: #666; font-style: italic;">No programs available at the moment. Check back soon for exciting new opportunities!</div>';
      return;
    }
    
    let programCount = 0;
    querySnapshot.forEach((doc) => {
      programCount++;
      const program = doc.data();
      console.log(`🎯 Processing program ${programCount}:`, program.title);
      
      const programCard = document.createElement('div');
      programCard.className = 'program-card';
      programCard.innerHTML = `
        <span class="program-type">${program.type?.toUpperCase() || 'PROGRAM'}</span>
        <h3>${program.title || 'Untitled Program'}</h3>
        <p>${program.description || 'Program description coming soon.'}</p>
        <div class="program-meta">
          ${program.stats?.map(stat => 
            `<div class="program-meta-item">
              <i class="${stat.icon || 'fas fa-info-circle'}"></i> ${stat.label}: ${stat.value}
            </div>`
          ).join('') || ''}
          ${program.duration ? `<div class="program-meta-item"><i class="fas fa-clock"></i> Duration: ${program.duration}</div>` : ''}
          ${program.startDate ? `<div class="program-meta-item"><i class="fas fa-calendar-start"></i> Starts: ${new Date(program.startDate.toDate()).toLocaleDateString()}</div>` : ''}
        </div>
        <a href="#" class="learn-more-btn" onclick="showProgramDetails('${doc.id}')">Learn More</a>
      `;
      programsList.appendChild(programCard);
    });
    
    console.log(`🎉 Successfully loaded ${programCount} programs!`);
    
  } catch (error) {
    console.error('❌ Error loading programs:', error);
    
    if (programsLoading) {
      programsLoading.innerHTML = `❌ Error loading programs: ${error.message}`;
      programsLoading.style.color = '#d32f2f';
    }
    
    if (programsList) {
      programsList.innerHTML = '<div style="text-align: center; padding: 40px; color: #d32f2f;">Error loading programs. Please try again later.</div>';
    }
  }
}

// Show program details (placeholder function)
window.showProgramDetails = function(programId) {
  console.log('Show details for program:', programId);
  // TODO: Implement program details modal or page
  alert('Program details feature coming soon!');
};

// Upload resume to Firebase Storage
async function uploadResumeToStorage(file, applicationId) {
  try {
    console.log(`📤 Uploading resume: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    
    // Create a unique filename to prevent conflicts
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `${timestamp}_${file.name}`;
    
    // Create a reference to the file location in Firebase Storage
    const storageRef = ref(storage, `resumes/${applicationId}/${uniqueFileName}`);
    
    console.log(`📁 Storage path: resumes/${applicationId}/${uniqueFileName}`);
    
    // Upload the file with metadata
    const metadata = {
      contentType: file.type,
      customMetadata: {
        'originalName': file.name,
        'uploadedAt': new Date().toISOString(),
        'applicationId': applicationId
      }
    };
    
    console.log('⏳ Starting file upload...');
    const snapshot = await uploadBytes(storageRef, file, metadata);
    console.log('✅ File uploaded successfully!', snapshot);
    
    // Get the download URL
    console.log('🔗 Getting download URL...');
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('✅ Download URL obtained:', downloadURL);
    
    return {
      url: downloadURL,
      fileName: uniqueFileName,
      originalName: file.name,
      size: file.size,
      uploadPath: `resumes/${applicationId}/${uniqueFileName}`
    };
    
  } catch (error) {
    console.error('❌ Error uploading file to Firebase Storage:', error);
    
    // Provide more specific error messages
    if (error.code === 'storage/unauthorized') {
      throw new Error('Unauthorized to upload files. Please check Firebase Storage rules.');
    } else if (error.code === 'storage/canceled') {
      throw new Error('File upload was canceled.');
    } else if (error.code === 'storage/quota-exceeded') {
      throw new Error('Storage quota exceeded. Please try a smaller file.');
    } else {
      throw new Error(`Upload failed: ${error.message}`);
    }
  }
}

// Submit job application
async function submitJobApplication(formData, jobId) {
  try {
    console.log('📋 Starting job application submission...');
    
    const applicationData = {
      jobId: jobId,
      applicantName: `${formData.get('first-name')} ${formData.get('last-name')}`,
      applicantEmail: formData.get('email'),
      applicantPhone: formData.get('phone'),
      coverLetter: formData.get('cover-letter'),
      applicationDate: new Date(),
      status: 'Pending',
      resumeInfo: null // Will be updated if file is uploaded
    };
    
    console.log('💾 Adding application to Firestore...');
    
    // Add application to Firestore first to get the ID
    const docRef = await addDoc(collection(db, "applications"), applicationData);
    const applicationId = docRef.id;
    console.log(`✅ Application created with ID: ${applicationId}`);
    
    // Handle resume upload if file is selected
    const resumeFile = formData.get('resume');
    if (resumeFile && resumeFile.size > 0) {
      console.log('📎 Resume file detected, starting upload process...');
      
      // Validate file type
      const allowedTypes = [
        'application/pdf', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(resumeFile.type)) {
        throw new Error('Please upload a PDF or Word document (.pdf, .doc, .docx)');
      }
      
      // Validate file size (10MB limit - increased for resumes)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (resumeFile.size > maxSize) {
        throw new Error('File size must be less than 10MB');
      }
      
      try {
        console.log('📤 Uploading resume to Firebase Storage...');
        const resumeInfo = await uploadResumeToStorage(resumeFile, applicationId);
        
        console.log('✅ Resume uploaded successfully:', resumeInfo);
        
        // Update the application with the resume information
        await updateDoc(doc(db, "applications", applicationId), {
          resumeInfo: {
            downloadURL: resumeInfo.url,
            fileName: resumeInfo.fileName,
            originalName: resumeInfo.originalName,
            fileSize: resumeInfo.size,
            uploadPath: resumeInfo.uploadPath,
            uploadedAt: new Date()
          }
        });
        
        console.log('✅ Application updated with resume information');
        
      } catch (uploadError) {
        console.error('❌ Resume upload failed:', uploadError);
        
        // Update application with upload error info
        await updateDoc(doc(db, "applications", applicationId), {
          resumeUploadError: uploadError.message,
          resumeUploadAttempted: true
        });
        
        // Don't fail the entire application, but notify the user
        throw new Error(`Application submitted but resume upload failed: ${uploadError.message}`);
      }
    } else {
      console.log('📝 No resume file provided');
      
      // Update application to indicate no resume was provided
      await updateDoc(doc(db, "applications", applicationId), {
        resumeInfo: null,
        noResumeProvided: true
      });
    }
    
    console.log('🎉 Job application submitted successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Error submitting application:', error);
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
        
        // Show loading state
        const submitBtn = careerForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting Application...';
        
        // Add progress feedback
        let progressDiv = document.getElementById('application-progress');
        if (!progressDiv) {
          progressDiv = document.createElement('div');
          progressDiv.id = 'application-progress';
          progressDiv.style.cssText = 'margin: 15px 0; padding: 10px; background: #e3f2fd; border-radius: 5px; display: none;';
          careerForm.appendChild(progressDiv);
        }
        
        progressDiv.style.display = 'block';
        progressDiv.innerHTML = '<i class="fas fa-info-circle"></i> Starting application submission...';
        
        try {
          // Check if resume is provided
          const resumeFile = formData.get('resume');
          if (resumeFile && resumeFile.size > 0) {
            progressDiv.innerHTML = '<i class="fas fa-upload"></i> Uploading resume to secure storage...';
          }
          
          await submitJobApplication(formData, selectedJobId);
          
          // Success feedback
          progressDiv.style.background = '#d4edda';
          progressDiv.innerHTML = '<i class="fas fa-check-circle"></i> Application submitted successfully! We will review your application and contact you soon.';
          
          // Reset form after success
          setTimeout(() => {
            careerForm.reset();
            progressDiv.style.display = 'none';
          }, 5000);
          
        } catch (error) {
          console.error('Application submission error:', error);
          
          // Error feedback
          progressDiv.style.background = '#f8d7da';
          progressDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${error.message}`;
          
        } finally {
          // Restore submit button
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
      });
      
      // Add file validation on file selection
      const resumeInput = document.getElementById('resume');
      if (resumeInput) {
        resumeInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (file) {
            const maxSize = 10 * 1024 * 1024; // 10MB
            const allowedTypes = [
              'application/pdf', 
              'application/msword', 
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ];
            
            let fileInfo = document.getElementById('file-info');
            if (!fileInfo) {
              fileInfo = document.createElement('div');
              fileInfo.id = 'file-info';
              fileInfo.style.cssText = 'margin-top: 5px; font-size: 0.9em; padding: 5px;';
              resumeInput.parentNode.appendChild(fileInfo);
            }
            
            if (!allowedTypes.includes(file.type)) {
              fileInfo.style.color = '#d32f2f';
              fileInfo.innerHTML = '⚠️ Please select a PDF or Word document (.pdf, .doc, .docx)';
              resumeInput.value = '';
              return;
            }
            
            if (file.size > maxSize) {
              fileInfo.style.color = '#d32f2f';
              fileInfo.innerHTML = '⚠️ File size must be less than 10MB';
              resumeInput.value = '';
              return;
            }
            
            // Show file info
            fileInfo.style.color = '#2e7d32';
            fileInfo.innerHTML = `✅ Selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
          }
        });
      }
    }
  }
  
  if (currentPage.includes('events.html')) {
    loadEventsOnEventsPage();
    loadProgramsOnEventsPage();
  }
});
