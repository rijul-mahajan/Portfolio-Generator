let skillCount = 1;
let projectCount = 1;
let experienceCount = 1;
let blogCount = 1;

// In-memory storage for form data
let formData = {
  images: {},
  files: {},
};

document.addEventListener("DOMContentLoaded", function () {
  loadFromSessionStorage();

  // Update progress on page load
  updateSectionProgress();

  // Set up scroll detection
  let scrollTimeout;
  window.addEventListener("scroll", function () {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      detectCurrentSection();
    }, 100);
  });

  // Update progress when form changes
  const form = document.getElementById("portfolioForm");
  if (form) {
    // Save on input changes
    form.addEventListener("input", function (e) {
      clearTimeout(form.progressTimeout);
      form.progressTimeout = setTimeout(() => {
        updateSectionProgress();
        saveToSessionStorage();
      }, 300);
    });

    // Save on change events
    form.addEventListener("change", function () {
      setTimeout(() => {
        updateSectionProgress();
        saveToSessionStorage();
      }, 100);
    });
  }

  // Save when template is selected
  document.querySelectorAll(".template-option").forEach((option) => {
    option.addEventListener("click", function () {
      setTimeout(() => {
        updateSectionProgress();
        saveToSessionStorage();
      }, 100);
    });
  });

  // Save when blog section is toggled
  const blogCheckbox = document.getElementById("includeBlog");
  if (blogCheckbox) {
    blogCheckbox.addEventListener("change", function () {
      setTimeout(() => {
        updateSectionProgress();
        saveToSessionStorage();
      }, 100);
    });
  }

  // Initial section detection
  detectCurrentSection();

  // Initialize scroll listener with improved handling
  document.addEventListener("scroll", handleScroll, { passive: true });

  // Also detect on page load and resize
  window.addEventListener("load", detectCurrentSection);
  window.addEventListener("resize", detectCurrentSection);
});

// Handle image upload and preview
function handleImageUpload(input, previewId) {
  const file = input.files[0];
  const preview = document.getElementById(previewId);

  if (file && file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = function (e) {
      preview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 200px; max-height: 200px; border-radius: 8px;">`;

      // Store image data in memory
      if (previewId === "aboutImagePreview") {
        formData.images.aboutImage = e.target.result;
      } else if (previewId.startsWith("projectImagePreview")) {
        const index =
          parseInt(previewId.replace("projectImagePreview", "")) - 1;
        if (!formData.images.projectImages) formData.images.projectImages = [];
        formData.images.projectImages[index] = e.target.result;
      } else if (previewId.startsWith("blogImagePreview")) {
        const index = parseInt(previewId.replace("blogImagePreview", "")) - 1;
        if (!formData.images.blogImages) formData.images.blogImages = [];
        formData.images.blogImages[index] = e.target.result;
      }

      // Save to sessionStorage
      saveToSessionStorage();
    };
    reader.readAsDataURL(file);
  } else if (file) {
    showAlert("Please select a valid image file.", "error");
    input.value = "";
  }
}

// Handle resume file upload
function handleFileUpload(input, previewId) {
  const file = input.files[0];
  const preview = document.getElementById(previewId);

  if (file) {
    if (file.type !== "application/pdf") {
      showAlert("Please select a valid PDF file for the resume.", "error");
      input.value = "";
      preview.innerHTML = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      formData.files.resumeFile = e.target.result;
      formData.files.resumeFileName = file.name;
      preview.textContent = `File ready: ${file.name}`;

      // Remove required attribute once file is uploaded and stored
      input.removeAttribute("required");

      // Save to sessionStorage
      saveToSessionStorage();
    };
    reader.readAsDataURL(file);
  } else {
    preview.innerHTML = "";
    // Add required attribute back if no file is selected
    input.setAttribute("required", "");
  }
}

// Template selection
document.querySelectorAll(".template-option").forEach((option) => {
  option.addEventListener("click", function () {
    document
      .querySelectorAll(".template-option")
      .forEach((opt) => opt.classList.remove("selected"));
    this.classList.add("selected");
    document.querySelector('input[name="selectedTemplate"]').value =
      this.dataset.template;
  });
});

// Toggle blog section
function toggleBlogSection() {
  const blogSection = document.getElementById("blogSection");
  const includeBlog = document.getElementById("includeBlog").checked;

  if (includeBlog) {
    blogSection.classList.add("show");
    // Make blog fields required (except Blog URL)
    setBlogFieldsRequired(true);
  } else {
    blogSection.classList.remove("show");
    // Remove required attribute from blog fields
    setBlogFieldsRequired(false);
  }
}

function setBlogFieldsRequired(isRequired) {
  const blogFields = document.querySelectorAll(
    '#blogSection input[name="blogTitle[]"], #blogSection input[name="blogDate[]"], #blogSection textarea[name="blogExcerpt[]"]'
  );

  blogFields.forEach((field) => {
    if (isRequired) {
      field.setAttribute("required", "");
    } else {
      field.removeAttribute("required");
    }
  });
}

// Add skill function
function addSkill() {
  updateSkillCount();
  skillCount++;
  const container = document.getElementById("skillsContainer");
  const skillDiv = document.createElement("div");
  skillDiv.className = "dynamic-section skill-item";
  skillDiv.innerHTML = `
    <h4><i class="fas fa-code"></i> Skill ${skillCount}</h4>
    <div class="form-group">
      <label>Skill Name</label>
      <input type="text" name="skillName[]" required placeholder="Python Programming" />
    </div>
    <div class="form-group">
      <label>Skill Description</label>
      <textarea name="skillDesc[]" required placeholder="Describe your proficiency and experience with this skill"></textarea>
    </div>
    <button type="button" class="remove-btn" onclick="removeSkill(this)"><i class="fas fa-times"></i></button>
  `;
  container.appendChild(skillDiv);
}

function removeSkill(button) {
  button.parentElement.remove();
  updateSkillCount();
  // Update skill headers
  document.querySelectorAll(".skill-item").forEach((item, index) => {
    item.querySelector("h4").innerHTML = `<i class="fas fa-code"></i> Skill ${
      index + 1
    }`;
  });
  saveToSessionStorage();
}

function updateSkillCount() {
  skillCount = document.querySelectorAll(".skill-item").length;
}

// Add project function
function addProject() {
  updateProjectCount();
  projectCount++;
  const container = document.getElementById("projectsContainer");
  const projectDiv = document.createElement("div");
  projectDiv.className = "dynamic-section project-item";
  projectDiv.innerHTML = `
    <h4><i class="fas fa-project-diagram"></i> Project ${projectCount}</h4>
    <div class="form-group">
      <label>Project Title</label>
      <input type="text" name="projectTitle[]" required placeholder="Awesome Web Application" />
    </div>
    <div class="form-group">
      <label>Project Description</label>
      <textarea name="projectDesc[]" required placeholder="Describe your project, its purpose, key features, and impact"></textarea>
    </div>
    <div class="form-group">
      <label>Project Image (Optional)</label>
      <input type="file" name="projectImage[]" accept="image/*" onchange="handleImageUpload(this, 'projectImagePreview${projectCount}')" />
      <div id="projectImagePreview${projectCount}" class="image-preview"></div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>GitHub URL (Optional)</label>
        <input type="url" name="projectGithubUrl[]" placeholder="https://github.com/johndoe/project" />
      </div>
      <div class="form-group">
        <label>Live Demo URL (Optional)</label>
        <input type="url" name="projectLiveUrl[]" placeholder="https://project-demo.com" />
      </div>
    </div>
    <div class="form-group">
      <label>Technologies Used</label>
      <input type="text" name="projectTechs[]" required placeholder="React, Node.js, MongoDB, AWS" />
    </div>
    <button type="button" class="remove-btn" onclick="removeProject(this)"><i class="fas fa-times"></i></button>
  `;
  container.appendChild(projectDiv);
}

function removeProject(button) {
  button.parentElement.remove();
  updateProjectCount();
  // Update project headers and image preview IDs
  document.querySelectorAll(".project-item").forEach((item, index) => {
    item.querySelector(
      "h4"
    ).innerHTML = `<i class="fas fa-project-diagram"></i> Project ${index + 1}`;
    const imageInput = item.querySelector('input[type="file"]');
    const imagePreview = item.querySelector(".image-preview");
    if (imageInput && imagePreview) {
      const newId = `projectImagePreview${index + 1}`;
      imagePreview.id = newId;
      imageInput.setAttribute(
        "onchange",
        `handleImageUpload(this, '${newId}')`
      );
    }
  });
  saveToSessionStorage();
}

function updateProjectCount() {
  projectCount = document.querySelectorAll(".project-item").length;
}

// Add experience function
function addExperience() {
  updateExperienceCount();
  experienceCount++;
  const container = document.getElementById("experienceContainer");
  const experienceDiv = document.createElement("div");
  experienceDiv.className = "dynamic-section experience-item";
  experienceDiv.innerHTML = `
    <h4><i class="fas fa-building"></i> Experience ${experienceCount}</h4>
    <div class="form-row">
      <div class="form-group">
        <label>Job Title</label>
        <input type="text" name="jobTitle[]" required placeholder="Software Developer" />
      </div>
      <div class="form-group">
        <label>Company</label>
        <input type="text" name="jobCompany[]" required placeholder="Tech Solutions Inc." />
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Start Date</label>
        <input type="text" name="jobStartDate[]" required placeholder="Jan 2023" />
      </div>
      <div class="form-group">
        <label>End Date</label>
        <input type="text" name="jobEndDate[]" required placeholder="Present" />
      </div>
    </div>
    <div class="form-group">
      <label>Job Description</label>
      <textarea name="jobDesc[]" required placeholder="Describe your role, responsibilities, and key achievements"></textarea>
    </div>
    <button type="button" class="remove-btn" onclick="removeExperience(this)"><i class="fas fa-times"></i></button>
  `;
  container.appendChild(experienceDiv);
}

function removeExperience(button) {
  button.parentElement.remove();
  updateExperienceCount();
  // Update experience headers
  document.querySelectorAll(".experience-item").forEach((item, index) => {
    item.querySelector(
      "h4"
    ).innerHTML = `<i class="fas fa-building"></i> Experience ${index + 1}`;
  });
  saveToSessionStorage();
}

function updateExperienceCount() {
  experienceCount = document.querySelectorAll(".experience-item").length;
}

// Add blog function
function addBlog() {
  updateBlogCount();
  blogCount++;
  const container = document.getElementById("blogContainer");
  const blogDiv = document.createElement("div");
  blogDiv.className = "dynamic-section blog-item";

  // Check if blog section is currently active to set required attributes
  const includeBlog = document.getElementById("includeBlog").checked;
  const requiredAttr = includeBlog ? "required" : "";

  blogDiv.innerHTML = `
    <h4><i class="fas fa-pen-alt"></i> Blog Post ${blogCount}</h4>
    <div class="form-group">
      <label>Blog Title</label>
      <input type="text" name="blogTitle[]" ${requiredAttr} placeholder="Understanding Artificial Intelligence" />
    </div>
    <div class="form-group">
      <label>Publication Date</label>
      <input type="text" name="blogDate[]" ${requiredAttr} placeholder="March 15, 2024" />
    </div>
    <div class="form-group">
      <label>Blog Excerpt</label>
      <textarea name="blogExcerpt[]" ${requiredAttr} placeholder="A brief summary of your blog post content"></textarea>
    </div>
    <div class="form-group">
      <label>Blog URL</label>
      <input type="url" name="blogUrl[]" placeholder="https://myblog.com/post" />
    </div>
    <div class="form-group">
      <label>Blog Image (Optional)</label>
      <input type="file" name="blogImage[]" accept="image/*" onchange="handleImageUpload(this, 'blogImagePreview${blogCount}')" />
      <div id="blogImagePreview${blogCount}" class="image-preview"></div>
    </div>
    <button type="button" class="remove-btn" onclick="removeBlog(this)"><i class="fas fa-times"></i></button>
  `;
  container.appendChild(blogDiv);
}

function removeBlog(button) {
  button.parentElement.remove();
  updateBlogCount();
  // Update blog headers and image preview IDs
  document.querySelectorAll(".blog-item").forEach((item, index) => {
    item.querySelector(
      "h4"
    ).innerHTML = `<i class="fas fa-pen-alt"></i> Blog Post ${index + 1}`;
    const imageInput = item.querySelector('input[type="file"]');
    const imagePreview = item.querySelector(".image-preview");
    if (imageInput && imagePreview) {
      const newId = `blogImagePreview${index + 1}`;
      imagePreview.id = newId;
      imageInput.setAttribute(
        "onchange",
        `handleImageUpload(this, '${newId}')`
      );
    }
  });
  saveToSessionStorage();
}

function updateBlogCount() {
  blogCount = document.querySelectorAll(".blog-item").length;
}

async function clearForm() {
  const confirmClear = await showConfirm(
    "Are you sure you want to clear all form data? This cannot be undone.",
    "Clear Form Data"
  );

  if (confirmClear) {
    document.getElementById("portfolioForm").reset();
    formData = { images: {}, files: {} };
    skillCount = 1;
    projectCount = 1;
    experienceCount = 1;
    blogCount = 1;

    // Clear sessionStorage
    sessionStorage.removeItem("portfolioFormData");

    location.reload();
  }
}

// Generate portfolio data and open template
function generatePortfolio(portfolioData) {
  const selectedTemplate = document.querySelector(
    'input[name="selectedTemplate"]'
  ).value;

  if (!selectedTemplate) {
    alert("Please select a template first!");
    return;
  }

  // Generate complete HTML
  const portfolioHTML = generatePortfolioHTML(portfolioData);

  // Create a Blob with the HTML content
  const blob = new Blob([portfolioHTML], { type: "text/html" });
  const url = URL.createObjectURL(blob);

  // Open the blob URL in a new window
  const newWindow = window.open(url, "_blank");

  // Clean up the URL after a delay
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 60000);
}

function generatePortfolioHTML(data) {
  const currentYear = new Date().getFullYear();
  const formTag = data.formBackend
    ? `<form id="contactForm" action="${data.formBackend}" method="POST">`
    : `<form id="contactForm">`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="${data.fullName} - Portfolio | ${
    data.degree
  } Student at ${data.university}">
<title>${data.fullName} | Portfolio</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.css">
<link rel="icon" href="https://cdn-icons-png.flaticon.com/512/11441/11441961.png">
<style>
/* ===== Variables ===== */
:root {
  --primary: #3b82f6;
  --primary-dark: #2563eb;
  --secondary: #10b981;
  --dark: #1e293b;
  --darker: #0f172a;
  --light: #f8fafc;
  --gray: #64748b;
  --light-gray: #cbd5e1;

  ${
    data.selectedTemplate === "dark"
      ? `
  --bg-color: #0a0e16;
  --text-color: #e2e8f0;
  --card-bg: #161b26;
  --header-bg: rgba(10, 14, 22, 0.9);
  --border-color: #2a3441;
  --shadow-color: rgba(0, 0, 0, 0.5);
  `
      : `
  --bg-color: #f8fafc;
  --text-color: #0f172a;
  --card-bg: #ffffff;
  --header-bg: rgba(248, 250, 252, 0.9);
  --border-color: #e2e8f0;
  --shadow-color: rgba(0, 0, 0, 0.1);
  `
  }
}

::selection {
  background-color: rgb(59, 130, 246, 0.5);
  color: black;
}

html {
  scrollbar-width: thin;
  scrollbar-color: var(--gray) transparent;
}

/* ===== Reset & Base Styles ===== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    sans-serif;
}

body {
  background-color: var(--bg-color);
  color: var(--text-color);
  font-size: 16px;
  line-height: 1.6;
  transition: background-color 0.3s ease, color 0.3s ease;
  overflow-x: hidden;
}

/* Typography */
h1,
h2,
h3,
h4,
h5,
h6 {
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1rem;
}

h1 {
  font-size: 3rem;
}

h2 {
  font-size: 2.25rem;
  position: relative;
  display: inline-block;
  margin-bottom: 2rem;
}

h2::after {
  content: "";
  position: absolute;
  bottom: -10px;
  left: 0;
  width: 50%;
  height: 4px;
  background: var(--primary);
  border-radius: 2px;
}

h3 {
  font-size: 1.5rem;
}

p {
  margin-bottom: 1rem;
}

a {
  color: var(--primary);
  text-decoration: none;
  transition: color 0.3s ease;
}

a:hover {
  color: var(--primary-dark);
}

/* Container */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Section */
section {
  padding: 5rem 0;
}

/* ===== Header ===== */
header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  transition: all 0.3s ease, box-shadow 0.3s ease;
  background-color: var(--header-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

header.scrolled {
  box-shadow: 0 5px 25px var(--shadow-color);
  background-color: var(--header-bg);
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 0;
}

.logo {
  font-weight: 700;
  font-size: 1.5rem;
  color: var(--text-color);
}

.logo span {
  color: var(--primary);
}

.nav-links {
  display: flex;
  list-style: none;
}

.nav-links li {
  margin-left: 2rem;
}

.nav-links a {
  color: var(--text-color);
  font-weight: 500;
  position: relative;
}

.nav-links a:hover {
  color: var(--primary);
}

.nav-links a::after {
  content: "";
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--primary);
  transition: width 0.3s ease;
}

.nav-links a:hover::after {
  width: 100%;
}

/* Mobile Menu */
.hamburger {
  display: none;
  cursor: pointer;
  background: none;
  border: none;
  color: var(--text-color);
  font-size: 1.5rem;
}

/* ===== Hero Section ===== */
.hero {
  display: flex;
  align-items: center;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.hero-content {
  max-width: 800px;
}

.hero h1 {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 1s ease forwards;
}

.hero h1 span {
  color: var(--primary);
}

.hero p {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 1s ease forwards 0.3s;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 1s ease forwards 0.6s;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: var(--primary);
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: var(--primary-dark);
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(37, 99, 235, 0.2);
  color: white;
}

.btn-outline {
  background-color: transparent;
  color: var(--text-color);
  border: 1px solid var(--border-color);
}

.btn-outline:hover {
  border-color: var(--primary);
  color: var(--primary);
  transform: translateY(-3px);
  box-shadow: 0 10px 20px var(--shadow-color);
}

.btn i {
  margin-right: 0.5rem;
}

.scroll-down {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0) translateX(-50%);
  }
  40% {
    transform: translateY(-20px) translateX(-50%);
  }
  60% {
    transform: translateY(-10px) translateX(-50%);
  }
}

.scroll-down i {
  font-size: 2rem;
  color: var(--primary);
}

/* ===== About Section ===== */
.about-content {
  display: flex;
  gap: 4rem;
  align-items: center;
}

/* Single column layout when no image */
.about-content.no-image {
  display: block;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.about-image {
  flex: 1;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px var(--shadow-color);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.about-image img {
  width: 100%;
  height: auto;
  display: block;
  transition: transform 0.5s ease;
}

.about-image:hover img {
  transform: scale(1.05);
}

.about-text {
  flex: 1;
}

/* Center text when no image */
.about-content.no-image .about-text {
  text-align: left;
  max-width: none;
}

.about-text p {
  margin-bottom: 1.5rem;
}

/* ===== Skills Section ===== */
.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
}

.skill-card {
  background-color: var(--card-bg);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 10px 15px -3px var(--shadow-color);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.skill-card:hover .skill-name {
  color: var(--primary);
}

.skill-icon {
  font-size: 2.5rem;
  color: var(--primary);
  margin-bottom: 1rem;
}

.skill-name {
  font-weight: 700;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
}

/* ===== Projects Section ===== */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.project-card {
  background-color: var(--card-bg);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 15px -3px var(--shadow-color);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.project-image {
  position: relative;
  overflow: hidden;
  height: 200px;
}

.project-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.project-card:hover .project-image img {
  transform: scale(1.1);
}

.project-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.project-card:hover .project-overlay {
  opacity: 1;
}

.project-links {
  display: flex;
  gap: 1rem;
}

.project-links a {
  background-color: white;
  color: var(--dark);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.project-links a:hover {
  background-color: var(--primary);
  color: white;
  transform: translateY(-3px);
}

.project-content {
  padding: 1.5rem;
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.project-tag {
  background-color: var(--primary);
  color: white;
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
}

/* ===== Experience Section ===== */
.timeline {
  position: relative;
  max-width: 800px;
  margin: 0 auto;
}

.timeline::after {
  content: "";
  position: absolute;
  width: 4px;
  background-color: var(--primary);
  top: 0;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
}

.timeline-item {
  padding: 1rem 2rem;
  position: relative;
  width: 50%;
  box-sizing: border-box;
  margin-bottom: 2rem;
}

.timeline-item::after {
  content: "";
  position: absolute;
  width: 20px;
  height: 20px;
  background-color: var(--bg-color);
  border: 4px solid var(--primary);
  border-radius: 50%;
  top: 0;
  z-index: 1;
}

.timeline-item:nth-child(odd) {
  left: 0;
  text-align: right;
}

.timeline-item:nth-child(even) {
  left: 50%;
  text-align: left;
}

.timeline-item:nth-child(odd)::after {
  right: -12px;
}

.timeline-item:nth-child(even)::after {
  left: -12px;
}

.timeline-content {
  background-color: var(--card-bg);
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 10px 15px -3px var(--shadow-color);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.timeline-content:hover {
  transform: translateY(-3px);
  box-shadow: 0 20px 25px -5px var(--shadow-color);
}

.timeline-date {
  color: var(--primary);
  font-weight: 700;
}

/* ===== Blog Section ===== */
.blog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.blog-card {
  background-color: var(--card-bg);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 15px -3px var(--shadow-color);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.blog-image {
  height: 200px;
  overflow: hidden;
}

.blog-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.blog-card:hover .blog-image img {
  transform: scale(1.1);
}

.blog-content {
  padding: 1.5rem;
}

.blog-date {
  color: var(--gray);
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.blog-title {
  margin-bottom: 0.5rem;
}

.blog-excerpt {
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ===== Contact Section ===== */
.contact-container {
  display: flex;
  gap: 2rem;
}

.contact-info {
  flex: 1;
}

.contact-item {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
}

.contact-icon {
  width: 40px;
  height: 40px;
  background-color: var(--primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
}

.social-links {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.social-link {
  width: 40px;
  height: 40px;
  background-color: var(--card-bg);
  color: var(--text-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 5px 10px var(--shadow-color);
}

.social-link:hover {
  background-color: var(--primary);
  color: white;
  transform: translateY(-3px);
  box-shadow: 0 10px 15px rgba(59, 130, 246, 0.3);
}

.contact-form {
  flex: 1;
  background-color: var(--card-bg);
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 10px 15px -3px var(--shadow-color);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--bg-color);
  color: var(--text-color);
  transition: all 0.3s ease, box-shadow 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  transform: translateY(-1px);
}

textarea.form-control {
  min-height: 150px;
  resize: vertical;
}

/* ===== Footer ===== */
footer {
  background-color: var(--card-bg);
  color: var(--text-color);
  padding: 1.5rem 0;
  text-align: center;
  border-top: 1px solid var(--border-color);
}

.footer-content p {
  margin: 0.5rem 0;
}

/* ===== Media Queries ===== */
@media (max-width: 992px) {
  .nav-container {
    padding: 1.25rem;
  }

  h1 {
    font-size: 2.5rem;
  }

  h2 {
    font-size: 2rem;
  }

  .about-content {
    flex-direction: column;
  }

  .timeline::after {
    left: 40px;
  }

  .timeline-item {
    width: 100%;
    padding-left: 80px;
    padding-right: 0;
  }

  .timeline-item:nth-child(odd) {
    text-align: left;
  }

  .timeline-item:nth-child(odd)::after {
    right: auto;
    left: 30px;
  }

  .timeline-item:nth-child(even) {
    left: 0;
  }

  .timeline-item:nth-child(even)::after {
    left: 30px;
  }

  .contact-container {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .nav-links {
    position: fixed;
    top: 80px;
    right: -100%;
    width: min(300px, 80vw);
    height: calc(100vh - 80px);
    background-color: var(--card-bg);
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding-top: 2rem;
    transition: right 0.3s ease;
    box-shadow: -5px 0 15px var(--shadow-color);
    z-index: 99;
  }

  .nav-links.active {
    right: 0;
  }

  .nav-links li {
    margin: 1.5rem 0;
  }

  .hamburger {
    display: block;
  }

  .about-content {
    flex-direction: column;
    gap: 2rem;
  }

  .about-content.no-image {
    gap: 0;
  }

  .projects-grid,
  .blog-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 576px) {
  h1 {
    font-size: 2rem;
  }

  h2 {
    font-size: 1.75rem;
  }

  .hero-buttons {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}

/* ===== Animations ===== */
[data-aos] {
  opacity: 0;
  transition-property: opacity, transform;
}

[data-aos="fade-up"] {
  transform: translateY(50px);
}

[data-aos="fade-down"] {
  transform: translateY(-50px);
}

[data-aos="fade-right"] {
  transform: translateX(-50px);
}

[data-aos="fade-left"] {
  transform: translateX(50px);
}

[data-aos].aos-animate {
  opacity: 1;
  transform: translateX(0) translateY(0);
}
</style>
</head>
<body>
<!-- Header -->
<header id="header">
<div class="container nav-container">
  <a href="#home" class="logo">${data.firstName}<span>${
    data.lastName
  }</span></a>
  <button class="hamburger" id="hamburger">
      <i class="fas fa-bars"></i>
  </button>
  <ul class="nav-links" id="navLinks">
      <li><a href="#about">About</a></li>
      <li><a href="#skills">Skills</a></li>
      <li><a href="#projects">Projects</a></li>
      <li><a href="#experience">Experience</a></li>
      ${data.includeBlog ? '<li><a href="#blog">Blog</a></li>' : ""}
      <li><a href="#contact">Contact</a></li>
  </ul>
</div>
</header>

<!-- Hero Section -->
<section class="hero" id="home">
<div class="container hero-content">
  <h1>Hi, I'm <span>${data.fullName}</span></h1>
  <p>${data.title} | ${data.specialty}</p>
  <div class="hero-buttons">
      <a href="#projects" class="btn btn-primary">
          <i class="fas fa-laptop-code"></i> View My Work
      </a>
      <a href="#contact" class="btn btn-outline">
          <i class="fas fa-paper-plane"></i> Get In Touch
      </a>
  </div>
</div>
<a href="#about" class="scroll-down">
  <i class="fas fa-chevron-down"></i>
</a>
</section>

<!-- About Section -->
<section id="about" class="about">
<div class="container">
  <h2 data-aos="fade-up">About Me</h2>
  <div class="about-content${!data.aboutImage ? " no-image" : ""}">
      ${
        data.aboutImage
          ? `
      <div class="about-image" data-aos="fade-right">
          <img src="${data.aboutImage}" alt="${data.fullName}" />
      </div>`
          : ""
      }
      <div class="about-text" data-aos="fade-left">
          ${data.aboutMe
            .split("\n")
            .map((paragraph) => `<p>${paragraph}</p>`)
            .join("")}
          ${
            data.resumeFile
              ? `
          <div class="hero-buttons">
              <a href="${data.resumeFile}" download="${
                  data.resumeFileName || "resume.pdf"
                }" class="btn btn-primary">
                  <i class="fas fa-download"></i> Download Resume
              </a>
          </div>`
              : ""
          }
      </div>
  </div>
</div>
</section>

<!-- Skills Section -->
<section id="skills" class="skills">
<div class="container">
  <h2 data-aos="fade-up">My Skills</h2>
  <div class="skills-grid">
      ${
        data.skillName
          ? data.skillName
              .map(
                (skill, index) => `
      <div class="skill-card" data-aos="fade-up" data-aos-delay="${
        (index + 2) * 100
      }">
          <div class="skill-icon">
              <i class="${getSkillIcon(skill)}"></i>
          </div>
          <h3 class="skill-name">${skill}</h3>
          <p>${data.skillDesc[index]}</p>
      </div>`
              )
              .join("")
          : ""
      }
  </div>
</div>
</section>

<!-- Projects Section -->
<section id="projects" class="projects">
<div class="container">
  <h2 data-aos="fade-up">Featured Projects</h2>
  <div class="projects-grid">
      ${
        data.projectTitle
          ? data.projectTitle
              .map(
                (title, index) => `
      <div class="project-card" data-aos="fade-up" data-aos-delay="${
        (index + 1) * 100
      }">
          <div class="project-image" ${
            !data.projectImages?.[index]
              ? 'style="background: linear-gradient(135deg, #2563eb, #4facfe 100%); min-height: 200px; display: flex; align-items: center; justify-content: center;"'
              : ""
          }>
              ${
                data.projectImages?.[index]
                  ? `<img src="${data.projectImages[index]}" alt="${title}" />`
                  : ""
              }
              <div class="project-overlay">
                  <div class="project-links">
                      ${
                        data.projectGithubUrl?.[index]
                          ? `<a href="${data.projectGithubUrl[index]}" target="_blank"><i class="fab fa-github"></i></a>`
                          : ""
                      }
                      ${
                        data.projectLiveUrl?.[index]
                          ? `<a href="${data.projectLiveUrl[index]}" target="_blank"><i class="fas fa-external-link-alt"></i></a>`
                          : ""
                      }
                  </div>
              </div>
          </div>
          <div class="project-content">
              <div class="project-tags">
                  ${
                    data.projectTechs[index]
                      ? data.projectTechs[index]
                          .split(",")
                          .map(
                            (tech) =>
                              `<span class="project-tag">${tech.trim()}</span>`
                          )
                          .join("")
                      : ""
                  }
              </div>
              <h3>${title}</h3>
              <p>${data.projectDesc[index]}</p>
          </div>
      </div>`
              )
              .join("")
          : ""
      }
  </div>
</div>
</section>

<!-- Experience Section -->
<section id="experience" class="experience">
<div class="container">
  <h2 data-aos="fade-up">Experience</h2>
  <div class="timeline">
      ${
        data.jobTitle
          ? data.jobTitle
              .map(
                (title, index) => `
      <div class="timeline-item" data-aos="${
        index % 2 === 0 ? "fade-right" : "fade-left"
      }">
          <div class="timeline-content">
              <span class="timeline-date">${data.jobStartDate[index]} - ${
                  data.jobEndDate[index]
                }</span>
              <h3>${title}</h3>
              <h4>${data.jobCompany[index]}</h4>
              <p>${data.jobDesc[index]}</p>
          </div>
      </div>`
              )
              .join("")
          : ""
      }
  </div>
</div>
</section>

${
  data.includeBlog
    ? `
<!-- Blog Section -->
<section id="blog" class="blog">
<div class="container">
  <h2 data-aos="fade-up">Latest Blogs</h2>
  <div class="blog-grid">
      ${
        data.blogTitle
          ? data.blogTitle
              .map(
                (title, index) => `
      <div class="blog-card" data-aos="fade-up" data-aos-delay="${
        (index + 1) * 100
      }">
          <div class="blog-image" ${
            !data.blogImages?.[index]
              ? 'style="background: linear-gradient(135deg, #2563eb, #4facfe 100%);"'
              : ""
          }>
              ${
                data.blogImages?.[index]
                  ? `<img src="${data.blogImages[index]}" alt="${title}" />`
                  : ""
              }
          </div>
          <div class="blog-content">
              <span class="blog-date">${data.blogDate[index]}</span>
              <h3 class="blog-title">${title}</h3>
              <p class="blog-excerpt">${data.blogExcerpt[index]}</p>
              ${
                data.blogUrl?.[index]
                  ? `<a href="${data.blogUrl[index]}" target="_blank" class="btn btn-outline">Read More</a>`
                  : ""
              }
          </div>
      </div>`
              )
              .join("")
          : ""
      }
  </div>
</div>
</section>`
    : ""
}

<!-- Contact Section -->
<section id="contact" class="contact">
<div class="container">
  <h2 data-aos="fade-up">Get In Touch</h2>
  <div class="contact-container">
      <div class="contact-info" data-aos="fade-right">
          <p>I'm always open to discussing new projects, innovative ideas, or opportunities to collaborate and create something meaningful.</p>
          <div class="contact-item">
              <div class="contact-icon"><i class="fas fa-envelope"></i></div>
              <div><h3>Email</h3><p>${data.email}</p></div>
          </div>
          <div class="contact-item">
              <div class="contact-icon"><i class="fas fa-phone"></i></div>
              <div><h3>Phone</h3><p>${data.phone}</p></div>
          </div>
          <div class="contact-item">
              <div class="contact-icon"><i class="fas fa-map-marker-alt"></i></div>
              <div><h3>Location</h3><p>${data.location}</p></div>
          </div>
          <div class="social-links">
              ${
                data.linkedinUrl
                  ? `<a href="${data.linkedinUrl}" target="_blank" class="social-link"><i class="fab fa-linkedin"></i></a>`
                  : ""
              }
              ${
                data.githubUrl
                  ? `<a href="${data.githubUrl}" target="_blank" class="social-link"><i class="fab fa-github"></i></a>`
                  : ""
              }
              ${
                data.twitterUrl
                  ? `<a href="${data.twitterUrl}" target="_blank" class="social-link"><i class="fab fa-twitter"></i></a>`
                  : ""
              }
              ${
                data.instagramUrl
                  ? `<a href="${data.instagramUrl}" target="_blank" class="social-link"><i class="fab fa-instagram"></i></a>`
                  : ""
              }
          </div>
      </div>
      <div class="contact-form" data-aos="fade-left">
          ${formTag}
              <div class="form-group">
                  <label for="name" class="form-label">Name</label>
                  <input type="text" id="name" name="name" class="form-control" required />
              </div>
              <div class="form-group">
                  <label for="email" class="form-label">Email</label>
                  <input type="email" id="email" name="email" class="form-control" required />
              </div>
              <div class="form-group">
                  <label for="message" class="form-label">Message</label>
                  <textarea id="message" name="message" class="form-control" required></textarea>
              </div>
              <button type="submit" class="btn btn-primary">
                  <i class="fas fa-paper-plane"></i> Send Message
              </button>
          </form>
      </div>
  </div>
</div>
</section>

<!-- Footer -->
<footer>
<div class="container footer-content">
  <p>&copy; ${currentYear} ${data.fullName}. All Rights Reserved.</p>
  <p>Built with <i class="fas fa-heart" style="color: #ff6b6b"></i> by ${
    data.firstName
  }</p>
</div>
</footer>

<!-- Scripts -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.js"></script>
<script>
// Initialize AOS
document.addEventListener("DOMContentLoaded", function () {
  AOS.init({
    duration: 800,
    easing: "ease",
    once: true,
    offset: 100,
  });

  // Header Scroll Effect
  const header = document.getElementById("header");
  window.addEventListener("scroll", function () {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });

  // Mobile Menu Toggle
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("navLinks");

  hamburger.addEventListener("click", function () {
    navLinks.classList.toggle("active");
    hamburger.innerHTML = navLinks.classList.contains("active")
      ? '<i class="fas fa-times"></i>'
      : '<i class="fas fa-bars"></i>';
  });

  // Close mobile menu when clicking links
  const menuLinks = document.querySelectorAll(".nav-links a");
  menuLinks.forEach((link) => {
    link.addEventListener("click", function () {
      navLinks.classList.remove("active");
      hamburger.innerHTML = '<i class="fas fa-bars"></i>';
    });
  });

  // Custom smooth scroll function with ease-in-out
  function smoothScrollTo(target, duration = 1000) {
    const targetElement =
      typeof target === "string" ? document.querySelector(target) : target;
    if (!targetElement) return;

    const startPosition = window.pageYOffset;
    const targetPosition = targetElement.offsetTop - 80;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    }

    function animation(currentTime) {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const ease = easeInOutCubic(progress);

      window.scrollTo(0, startPosition + distance * ease);

      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    }

    requestAnimationFrame(animation);
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        smoothScrollTo(targetElement, 1200);
      }
    });
  });

  // Contact Form Submission
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      // If no action attribute is present, prevent submission and show an alert.
      if (!contactForm.getAttribute("action")) {
        e.preventDefault();
        alert(
          "Thank you for your message! I will get back to you soon."
        );
        contactForm.reset();
      }
      // If an action attribute exists, the form will submit normally.
    });
  }

  // Resume download button
  const resumeBtn = document.getElementById("resumeBtn");
  if(resumeBtn) {
    resumeBtn.addEventListener("click", function (e) {
        e.preventDefault();
        const portfolioData = sessionStorage.getItem("portfolioData");
        if (!portfolioData) {
        alert("No portfolio data found!");
        return;
        }

        const data = JSON.parse(portfolioData);

        if (data.resumeFile) {
        const link = document.createElement("a");
        link.href = data.resumeFile;

        // Use the stored file name or generate a new one
        link.download =
            data.resumeFileName || \`${data.fullName.replace(
              " ",
              "_"
            )}_Resume.pdf\`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        } else {
        alert("Resume file not available for download.");
        }
    });
  }
});
</script>
</body>
</html>`;
}

async function downloadSourceCode() {
  const form = document.getElementById("portfolioForm");
  const formDataObj = new FormData(form);
  const data = {};

  // Validate form first
  if (!form.checkValidity()) {
    showModal(
      "Form Validation Error",
      "Please fill in all required fields before downloading.",
      "error"
    );
    return;
  }

  // Process form data
  for (let [key, value] of formDataObj.entries()) {
    if (value instanceof File) {
      continue; // Skip file inputs
    }

    if (key.endsWith("[]")) {
      const cleanKey = key.slice(0, -2);
      if (!data[cleanKey]) {
        data[cleanKey] = [];
      }
      data[cleanKey].push(value);
    } else {
      data[key] = value;
    }
  }

  // Extract first and last name
  const nameParts = data.fullName.trim().split(" ");
  data.firstName = nameParts[0];
  data.lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

  // Include blog checkbox
  data.includeBlog = document.getElementById("includeBlog").checked;

  // Merge with stored images and files
  data.aboutImage = formData.images.aboutImage;
  data.projectImages = formData.images.projectImages;
  data.blogImages = formData.images.blogImages;
  data.resumeFile = formData.files.resumeFile;
  data.resumeFileName = formData.files.resumeFileName;

  const selectedTemplate = document.querySelector(
    'input[name="selectedTemplate"]'
  ).value;

  if (!selectedTemplate) {
    showModal(
      "Template Selection Required",
      "Please select a template first!",
      "error"
    );
    return;
  }

  try {
    showModal(
      "Preparing Download",
      "Creating your portfolio package...",
      "info"
    );

    // Create ZIP file
    const zip = new JSZip();

    // Create assets folder
    const assetsFolder = zip.folder("assets");

    // Add favicon
    try {
      const faviconResponse = await fetch(
        "https://cdn-icons-png.flaticon.com/512/11441/11441961.png"
      );
      if (faviconResponse.ok) {
        const faviconBlob = await faviconResponse.blob();
        assetsFolder.file("favicon.png", faviconBlob);
      }
    } catch (error) {
      console.warn("Could not fetch favicon:", error);
    }

    // Add profile image if exists
    if (data.aboutImage) {
      const profileImageData = data.aboutImage.split(",")[1];
      assetsFolder.file("profile.png", profileImageData, { base64: true });
    }

    // Add project images if they exist
    if (data.projectImages && data.projectImages.length > 0) {
      data.projectImages.forEach((imageData, index) => {
        if (imageData) {
          const projectImageData = imageData.split(",")[1];
          assetsFolder.file(`project-${index + 1}.png`, projectImageData, {
            base64: true,
          });
        }
      });
    }

    // Add blog images if they exist
    if (data.blogImages && data.blogImages.length > 0) {
      data.blogImages.forEach((imageData, index) => {
        if (imageData) {
          const blogImageData = imageData.split(",")[1];
          assetsFolder.file(`blog-${index + 1}.png`, blogImageData, {
            base64: true,
          });
        }
      });
    }

    // Add resume file if exists
    if (data.resumeFile && data.resumeFileName) {
      const resumeData = data.resumeFile.split(",")[1];
      assetsFolder.file(data.resumeFileName, resumeData, { base64: true });
    }

    // Generate the complete portfolio HTML
    const portfolioHTML = generatePortfolioHTML(data);

    // Add the main HTML file
    zip.file("index.html", portfolioHTML);

    // Add a README file
    const readmeContent = `# Personal Portfolio Website

This archive contains the complete source code for your personalized portfolio website. It's fully self-contained and ready to be deployed or customized.

## Contents

- \`index.html\` – The main webpage displaying your portfolio content
- \`assets/\` – Folder containing all media and resource files:
  - \`favicon.png\` – Default favicon used for browser tabs  
  ${data.aboutImage ? "- `profile.png` – Your profile image" : ""}
  ${
    data.projectImages && data.projectImages.length
      ? data.projectImages
          .map((img, i) =>
            img ? `- \`project-${i + 1}.png\` – Project ${i + 1} image` : ""
          )
          .filter(Boolean)
          .join("\n  ")
      : ""
  }
  ${
    data.blogImages && data.blogImages.length
      ? data.blogImages
          .map((img, i) =>
            img ? `- \`blog-${i + 1}.png\` – Blog post ${i + 1} image` : ""
          )
          .filter(Boolean)
          .join("\n  ")
      : ""
  }
  ${data.resumeFile ? `- \`${data.resumeFileName}\` – Your resume file` : ""}

## Getting Started

1. **Extract** the ZIP file to a folder on your device.
2. **Open** \`index.html\` in any modern web browser to view your portfolio.
3. **Deploy** the website online using platforms like:
   - GitHub Pages
   - Netlify
   - Vercel

## Customization Tips

- To update text or layout, open \`index.html\` in a text editor (like VS Code).
- Replace any images or files in the \`assets/\` folder to refresh content.
- To change colors, fonts, or layout styles, consider editing the CSS inside \`index.html\` or linking an external stylesheet.

## Generated On

**${new Date().toLocaleDateString()}**

---

Enjoy showcasing your work!

`;

    zip.file("README.md", readmeContent);

    // Generate and download the ZIP file
    const content = await zip.generateAsync({ type: "blob" });

    // Create download link
    const url = window.URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.firstName}-${data.lastName}-portfolio.zip`
      .replace(/\s+/g, "-")
      .toLowerCase();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    showModal(
      "Download Complete",
      "Your portfolio source code has been downloaded successfully!",
      "success"
    );
  } catch (error) {
    console.error("Error creating ZIP file:", error);
    showModal(
      "Download Error",
      "There was an error creating your portfolio package. Please try again.",
      "error"
    );
  }
}

const skillIconMap = {
  // Programming Languages
  javascript: "fab fa-js-square",
  js: "fab fa-js-square",
  python: "fab fa-python",
  java: "fab fa-java",
  php: "fab fa-php",
  swift: "fab fa-swift",
  kotlin: "fab fa-android",
  "c++": "fas fa-code",
  "c#": "fas fa-code",
  c: "fas fa-code",
  ruby: "fas fa-gem",
  go: "fas fa-code",
  rust: "fas fa-code",
  typescript: "fab fa-js-square",
  dart: "fas fa-code",
  scala: "fas fa-code",
  perl: "fas fa-code",
  lua: "fas fa-code",
  r: "fas fa-chart-bar",
  matlab: "fas fa-calculator",

  // Web Technologies
  html: "fab fa-html5",
  html5: "fab fa-html5",
  css: "fab fa-css3-alt",
  css3: "fab fa-css3-alt",
  sass: "fab fa-sass",
  scss: "fab fa-sass",
  less: "fab fa-less",
  bootstrap: "fab fa-bootstrap",
  tailwind: "fas fa-wind",
  jquery: "fas fa-code",

  // Frameworks & Libraries
  react: "fab fa-react",
  reactjs: "fab fa-react",
  vue: "fab fa-vuejs",
  vuejs: "fab fa-vuejs",
  angular: "fab fa-angular",
  angularjs: "fab fa-angular",
  node: "fab fa-node-js",
  nodejs: "fab fa-node-js",
  express: "fas fa-server",
  django: "fas fa-code",
  flask: "fas fa-flask",
  laravel: "fab fa-laravel",
  spring: "fas fa-leaf",
  rails: "fas fa-gem",
  nextjs: "fas fa-code",
  nuxt: "fab fa-vuejs",
  gatsby: "fas fa-code",
  svelte: "fas fa-code",
  flutter: "fas fa-mobile-alt",
  "react native": "fab fa-react",
  ionic: "fas fa-mobile-alt",
  xamarin: "fas fa-mobile-alt",

  // Databases
  mysql: "fas fa-database",
  postgresql: "fas fa-database",
  mongodb: "fas fa-database",
  sqlite: "fas fa-database",
  oracle: "fas fa-database",
  redis: "fas fa-database",
  firebase: "fas fa-fire",
  firestore: "fas fa-fire",
  cassandra: "fas fa-database",
  dynamodb: "fas fa-database",
  elasticsearch: "fas fa-search",

  // Cloud & DevOps
  aws: "fab fa-aws",
  azure: "fab fa-microsoft",
  gcp: "fab fa-google",
  "google cloud": "fab fa-google",
  docker: "fab fa-docker",
  kubernetes: "fas fa-dharmachakra",
  jenkins: "fas fa-tools",
  git: "fab fa-git-alt",
  github: "fab fa-github",
  gitlab: "fab fa-gitlab",
  bitbucket: "fab fa-bitbucket",
  heroku: "fas fa-cloud",
  netlify: "fas fa-cloud",
  vercel: "fas fa-cloud",
  terraform: "fas fa-tools",
  ansible: "fas fa-cogs",
  circleci: "fas fa-circle",
  travis: "fas fa-tools",

  // Design & UI/UX
  figma: "fab fa-figma",
  sketch: "fab fa-sketch",
  "adobe xd": "fas fa-pen-nib",
  photoshop: "fas fa-image",
  illustrator: "fas fa-palette",
  "after effects": "fas fa-video",
  "premiere pro": "fas fa-video",
  "ui/ux": "fas fa-paint-brush",
  ux: "fas fa-paint-brush",
  ui: "fas fa-paint-brush",
  design: "fas fa-paint-brush",
  "graphic design": "fas fa-palette",
  "web design": "fas fa-desktop",
  prototyping: "fas fa-drafting-compass",
  wireframing: "fas fa-sitemap",

  // Data Science & Analytics
  "machine learning": "fas fa-robot",
  ml: "fas fa-robot",
  ai: "fas fa-robot",
  "artificial intelligence": "fas fa-robot",
  "data science": "fas fa-chart-line",
  "data analysis": "fas fa-chart-bar",
  pandas: "fas fa-table",
  numpy: "fas fa-calculator",
  tensorflow: "fas fa-brain",
  pytorch: "fas fa-brain",
  "scikit-learn": "fas fa-robot",
  keras: "fas fa-brain",
  jupyter: "fas fa-book",
  tableau: "fas fa-chart-pie",
  "power bi": "fas fa-chart-bar",
  excel: "fas fa-file-excel",
  statistics: "fas fa-chart-line",
  "deep learning": "fas fa-brain",
  nlp: "fas fa-comments",
  "computer vision": "fas fa-eye",

  // Mobile Development
  android: "fab fa-android",
  ios: "fab fa-apple",
  mobile: "fas fa-mobile-alt",
  "mobile development": "fas fa-mobile-alt",
  "app development": "fas fa-mobile-alt",

  // Game Development
  unity: "fas fa-gamepad",
  unreal: "fas fa-gamepad",
  "game development": "fas fa-gamepad",
  "game design": "fas fa-gamepad",
  blender: "fas fa-cube",
  "3d modeling": "fas fa-cube",

  // Testing & Quality
  testing: "fas fa-vial",
  "unit testing": "fas fa-vial",
  "automation testing": "fas fa-robot",
  selenium: "fas fa-vial",
  cypress: "fas fa-vial",
  jest: "fas fa-vial",
  mocha: "fas fa-vial",
  qa: "fas fa-check-circle",
  "quality assurance": "fas fa-check-circle",

  // Blockchain & Crypto
  blockchain: "fas fa-link",
  cryptocurrency: "fab fa-bitcoin",
  bitcoin: "fab fa-bitcoin",
  ethereum: "fab fa-ethereum",
  solidity: "fas fa-code",
  web3: "fas fa-globe",
  "smart contracts": "fas fa-file-contract",

  // Soft Skills
  leadership: "fas fa-users",
  management: "fas fa-users-cog",
  communication: "fas fa-comments",
  teamwork: "fas fa-handshake",
  "problem solving": "fas fa-puzzle-piece",
  "project management": "fas fa-tasks",
  agile: "fas fa-sync-alt",
  scrum: "fas fa-sync-alt",
  kanban: "fas fa-columns",
  "public speaking": "fas fa-microphone",
  presentation: "fas fa-presentation",
  writing: "fas fa-pen",
  research: "fas fa-search",
  mentoring: "fas fa-chalkboard-teacher",
  training: "fas fa-graduation-cap",

  // Cybersecurity
  cybersecurity: "fas fa-shield-alt",
  security: "fas fa-lock",
  "penetration testing": "fas fa-user-secret",
  "ethical hacking": "fas fa-user-secret",
  "network security": "fas fa-network-wired",
  cryptography: "fas fa-key",

  // Networking & Systems
  networking: "fas fa-network-wired",
  "system administration": "fas fa-server",
  linux: "fab fa-linux",
  ubuntu: "fab fa-ubuntu",
  centos: "fab fa-centos",
  windows: "fab fa-windows",
  macos: "fab fa-apple",
  bash: "fas fa-terminal",
  powershell: "fas fa-terminal",
  "shell scripting": "fas fa-terminal",

  // General/Fallback icons
  programming: "fas fa-code",
  coding: "fas fa-code",
  development: "fas fa-laptop-code",
  software: "fas fa-laptop-code",
  technology: "fas fa-microchip",
  innovation: "fas fa-lightbulb",
  creativity: "fas fa-palette",
  analytics: "fas fa-chart-line",
  optimization: "fas fa-tachometer-alt",
  automation: "fas fa-robot",
  integration: "fas fa-puzzle-piece",
  architecture: "fas fa-building",
  strategy: "fas fa-chess",
};

// Function to get icon for a skill
function getSkillIcon(skillName) {
  if (!skillName) return "fas fa-code"; // Default fallback

  const normalizedSkill = skillName.toLowerCase().trim();

  // Direct match
  if (skillIconMap[normalizedSkill]) {
    return skillIconMap[normalizedSkill];
  }

  // Partial match - check if any key is contained in the skill name
  for (const [key, icon] of Object.entries(skillIconMap)) {
    if (normalizedSkill.includes(key) || key.includes(normalizedSkill)) {
      return icon;
    }
  }

  // Category-based fallback
  if (
    normalizedSkill.includes("web") ||
    normalizedSkill.includes("frontend") ||
    normalizedSkill.includes("front-end")
  ) {
    return "fas fa-desktop";
  }
  if (
    normalizedSkill.includes("backend") ||
    normalizedSkill.includes("back-end") ||
    normalizedSkill.includes("server")
  ) {
    return "fas fa-server";
  }
  if (normalizedSkill.includes("database") || normalizedSkill.includes("db")) {
    return "fas fa-database";
  }
  if (normalizedSkill.includes("mobile") || normalizedSkill.includes("app")) {
    return "fas fa-mobile-alt";
  }
  if (
    normalizedSkill.includes("data") ||
    normalizedSkill.includes("analytics")
  ) {
    return "fas fa-chart-bar";
  }
  if (
    normalizedSkill.includes("design") ||
    normalizedSkill.includes("ui") ||
    normalizedSkill.includes("ux")
  ) {
    return "fas fa-paint-brush";
  }
  if (normalizedSkill.includes("test") || normalizedSkill.includes("qa")) {
    return "fas fa-vial";
  }
  if (normalizedSkill.includes("cloud") || normalizedSkill.includes("devops")) {
    return "fas fa-cloud";
  }
  if (
    normalizedSkill.includes("security") ||
    normalizedSkill.includes("cyber")
  ) {
    return "fas fa-shield-alt";
  }
  if (
    normalizedSkill.includes("management") ||
    normalizedSkill.includes("lead")
  ) {
    return "fas fa-users-cog";
  }

  // Final fallback
  return "fas fa-code";
}

// Form submission handler
document
  .getElementById("portfolioForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const formDataObj = new FormData(this);
    const data = {};

    // Process form data
    for (let [key, value] of formDataObj.entries()) {
      if (value instanceof File) {
        continue; // Skip file inputs
      }

      if (key.endsWith("[]")) {
        const cleanKey = key.slice(0, -2);
        if (!data[cleanKey]) {
          data[cleanKey] = [];
        }
        data[cleanKey].push(value);
      } else {
        data[key] = value;
      }
    }

    // Extract first and last name
    const nameParts = data.fullName.trim().split(" ");
    data.firstName = nameParts[0];
    data.lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

    // Include blog checkbox
    data.includeBlog = document.getElementById("includeBlog").checked;

    // Merge with stored images and files
    data.aboutImage = formData.images.aboutImage;
    data.projectImages = formData.images.projectImages;
    data.blogImages = formData.images.blogImages;
    data.resumeFile = formData.files.resumeFile;
    data.resumeFileName = formData.files.resumeFileName;

    // Check if template is selected
    if (!data.selectedTemplate) {
      showAlert("Please select a template first!", "warning");
      return;
    }

    // Generate and open portfolio
    generatePortfolio(data);
  });

// Modal functions
function showModal(title, message, type = "info", showCancel = false) {
  return new Promise((resolve) => {
    const modal = document.getElementById("modalOverlay");
    const modalTitle = document.getElementById("modalTitle");
    const modalMessage = document.getElementById("modalMessage");
    const modalIcon = document.getElementById("modalIcon");
    const modalConfirm = document.getElementById("modalConfirm");
    const modalCancel = document.getElementById("modalCancel");

    // Set content
    modalTitle.textContent = title;
    modalMessage.textContent = message;

    // Reset classes
    modal.className = "modal-overlay";

    // Set icon and styling based on type
    switch (type) {
      case "success":
        modalIcon.className = "fas fa-check-circle";
        modal.classList.add("modal-success");
        break;
      case "warning":
        modalIcon.className = "fas fa-exclamation-triangle";
        modal.classList.add("modal-warning");
        break;
      case "danger":
      case "error":
        modalIcon.className = "fas fa-exclamation-circle";
        modal.classList.add("modal-danger");
        break;
      default:
        modalIcon.className = "fas fa-info-circle";
        break;
    }

    // Show/hide cancel button
    if (showCancel) {
      modalCancel.style.display = "inline-flex";
      modalConfirm.textContent = "Confirm";
      modalConfirm.className = "btn btn-danger";
    } else {
      modalCancel.style.display = "none";
      modalConfirm.textContent = "OK";
      modalConfirm.className = "btn btn-primary";
    }

    // Show modal
    modal.classList.add("show");

    // Handle confirm
    const handleConfirm = () => {
      hideModal();
      resolve(true);
      modalConfirm.removeEventListener("click", handleConfirm);
      modalCancel.removeEventListener("click", handleCancel);
    };

    // Handle cancel
    const handleCancel = () => {
      hideModal();
      resolve(false);
      modalConfirm.removeEventListener("click", handleConfirm);
      modalCancel.removeEventListener("click", handleCancel);
    };

    // Handle overlay click
    const handleOverlayClick = (e) => {
      if (e.target === modal) {
        hideModal();
        resolve(false);
        modal.removeEventListener("click", handleOverlayClick);
      }
    };

    modalConfirm.addEventListener("click", handleConfirm);
    modalCancel.addEventListener("click", handleCancel);
    modal.addEventListener("click", handleOverlayClick);
  });
}

function hideModal() {
  const modal = document.getElementById("modalOverlay");
  modal.classList.remove("show");
}

// Convenience functions
function showAlert(message, type = "info") {
  const titles = {
    info: "Information",
    success: "Success",
    warning: "Warning",
    error: "Error",
    danger: "Error",
  };
  return showModal(titles[type] || "Information", message, type, false);
}

function showConfirm(message, title = "Confirm Action") {
  return showModal(title, message, "warning", true);
}

// Form Navigation
let navigationCollapsed = false;
let isScrolling = false;
let scrollTimer = null;

function toggleNavigation() {
  const nav = document.getElementById("formNavigation");
  navigationCollapsed = !navigationCollapsed;

  if (navigationCollapsed) {
    nav.classList.add("collapsed");
  } else {
    nav.classList.remove("collapsed");
  }
}

function scrollToSection(sectionName) {
  const sectionMap = {
    template: 0,
    personal: 1,
    contact: 2,
    backend: 3,
    social: 4,
    skills: 5,
    projects: 6,
    experience: 7,
    blog: 8,
  };

  const sections = document.querySelectorAll(".form-section");
  const targetIndex = sectionMap[sectionName];

  if (sections[targetIndex]) {
    // Set scrolling flag to prevent section detection during programmatic scroll
    isScrolling = true;

    // Update active section immediately for better UX
    updateActiveSection(sectionName);

    sections[targetIndex].scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    // Clear the scrolling flag after scroll completes
    setTimeout(() => {
      isScrolling = false;
    }, 800); // Slightly longer than scroll animation
  }
}

function updateActiveSection(activeSection) {
  // Remove active class from all nav links
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active");
  });

  // Add active class to current section
  const activeLink = document.querySelector(
    `[data-section="${activeSection}"]`
  );
  if (activeLink) {
    activeLink.classList.add("active");
  }
}

function checkSectionCompletion(sectionName) {
  const requiredFields = getSectionRequiredFields(sectionName);
  let completedFields = 0;

  requiredFields.forEach((fieldName) => {
    const field = document.querySelector(`[name="${fieldName}"]`);
    if (field) {
      if (field.type === "checkbox") {
        // For checkboxes, just check if they exist (blog section)
        completedFields++;
      } else if (field.value && field.value.trim() !== "") {
        completedFields++;
      }
    } else {
      // Handle array fields
      const arrayFields = document.querySelectorAll(`[name="${fieldName}[]"]`);
      if (
        arrayFields.length > 0 &&
        arrayFields[0].value &&
        arrayFields[0].value.trim() !== ""
      ) {
        completedFields++;
      }
    }
  });

  return completedFields === requiredFields.length;
}

function getSectionRequiredFields(sectionName) {
  const fieldMap = {
    template: ["selectedTemplate"],
    personal: [
      "fullName",
      "title",
      "specialty",
      "degree",
      "university",
      "aboutMe",
    ],
    contact: ["email", "phone", "location"],
    backend: [], // Optional section
    social: ["linkedinUrl", "githubUrl"],
    skills: ["skillName", "skillDesc"],
    projects: ["projectTitle", "projectDesc", "projectTechs"],
    experience: [
      "jobTitle",
      "jobCompany",
      "jobStartDate",
      "jobEndDate",
      "jobDesc",
    ],
    blog: [], // Optional section, completion based on checkbox
  };

  return fieldMap[sectionName] || [];
}

function updateSectionProgress() {
  const sections = [
    "template",
    "personal",
    "contact",
    "social",
    "skills",
    "projects",
    "experience",
  ];
  let completedSections = 0;

  sections.forEach((sectionName) => {
    const navLink = document.querySelector(`[data-section="${sectionName}"]`);
    const isCompleted = checkSectionCompletion(sectionName);

    if (isCompleted) {
      if (!navLink.classList.contains("completed")) {
        navLink.classList.add("completed");
        // Add a small animation delay for visual effect
        setTimeout(() => {
          navLink.style.transform = "scale(1.02)";
          setTimeout(() => {
            navLink.style.transform = "";
          }, 200);
        }, 100);
      }
      completedSections++;
    } else {
      navLink.classList.remove("completed");
    }
  });

  // Handle blog section separately (optional)
  const blogCheckbox = document.getElementById("includeBlog");
  const blogNavLink = document.querySelector('[data-section="blog"]');
  if (blogCheckbox && blogCheckbox.checked) {
    const blogCompleted = checkBlogSectionCompletion();
    if (blogCompleted) {
      blogNavLink.classList.add("completed");
      completedSections += 0.5; // Half point for optional section
    } else {
      blogNavLink.classList.remove("completed");
    }
  } else {
    blogNavLink.classList.remove("completed");
    completedSections += 0.5; // Half point if not included
  }

  // Handle backend section (optional)
  const backendNavLink = document.querySelector('[data-section="backend"]');
  const backendInput = document.getElementById("formBackend");
  if (backendInput && backendInput.value.trim() !== "") {
    backendNavLink.classList.add("completed");
  } else {
    backendNavLink.classList.remove("completed");
  }
  completedSections += 0.5; // Half point for optional section

  // Update progress bar
  const totalSections = 8; // 7 required + 1 for optional sections
  const progressPercentage = Math.round(
    (completedSections / totalSections) * 100
  );

  document.getElementById(
    "progressFill"
  ).style.width = `${progressPercentage}%`;
  document.getElementById(
    "progressPercentage"
  ).textContent = `${progressPercentage}%`;
}

function checkBlogSectionCompletion() {
  const blogTitles = document.querySelectorAll('[name="blogTitle[]"]');
  const blogDates = document.querySelectorAll('[name="blogDate[]"]');
  const blogExcerpts = document.querySelectorAll('[name="blogExcerpt[]"]');
  const blogUrls = document.querySelectorAll('[name="blogUrl[]"]');

  if (blogTitles.length === 0) return false;

  // Check if at least the first blog entry is filled
  return (
    blogTitles[0].value.trim() !== "" &&
    blogDates[0].value.trim() !== "" &&
    blogExcerpts[0].value.trim() !== "" &&
    blogUrls[0].value.trim() !== ""
  );
}

function detectCurrentSection() {
  // Don't update during programmatic scrolling
  if (isScrolling) return;

  const sections = document.querySelectorAll(".form-section");
  const viewportHeight = window.innerHeight;
  const scrollTop = window.scrollY;

  // Use a smaller offset for more accurate detection
  const offset = viewportHeight * 0.3; // 30% of viewport height

  let currentSection = "template";
  let maxVisibleArea = 0;

  sections.forEach((section, index) => {
    const rect = section.getBoundingClientRect();
    const sectionTop = rect.top + scrollTop;
    const sectionBottom = sectionTop + rect.height;

    // Calculate visible area of this section
    const visibleTop = Math.max(rect.top, 0);
    const visibleBottom = Math.min(rect.bottom, viewportHeight);
    const visibleArea = Math.max(0, visibleBottom - visibleTop);

    // If this section has the most visible area and is substantially visible
    if (visibleArea > maxVisibleArea && visibleArea > rect.height * 0.3) {
      maxVisibleArea = visibleArea;
      const sectionMap = [
        "template",
        "personal",
        "contact",
        "backend",
        "social",
        "skills",
        "projects",
        "experience",
        "blog",
      ];
      currentSection = sectionMap[index] || "template";
    }
  });

  updateActiveSection(currentSection);
}

function handleScroll() {
  // Clear existing timer
  if (scrollTimer) {
    clearTimeout(scrollTimer);
  }

  // Set new timer for debounced execution
  scrollTimer = setTimeout(() => {
    detectCurrentSection();
  }, 50); // 50ms debounce
}

function saveToSessionStorage() {
  try {
    // Collect all form data
    const form = document.getElementById("portfolioForm");
    const formDataObj = new FormData(form);
    const savedData = {
      formFields: {},
      images: formData.images,
      files: formData.files,
      counters: {
        skillCount: document.querySelectorAll(".skill-item").length,
        projectCount: document.querySelectorAll(".project-item").length,
        experienceCount: document.querySelectorAll(".experience-item").length,
        blogCount: document.querySelectorAll(".blog-item").length,
      },
      selectedTemplate:
        document.querySelector('input[name="selectedTemplate"]')?.value || "",
      includeBlog: document.getElementById("includeBlog")?.checked || false,
    };

    // Save form field values
    for (let [key, value] of formDataObj.entries()) {
      if (!(value instanceof File)) {
        if (key.endsWith("[]")) {
          const cleanKey = key.slice(0, -2);
          if (!savedData.formFields[cleanKey]) {
            savedData.formFields[cleanKey] = [];
          }
          savedData.formFields[cleanKey].push(value);
        } else {
          savedData.formFields[key] = value;
        }
      }
    }

    sessionStorage.setItem("portfolioFormData", JSON.stringify(savedData));
  } catch (error) {
    console.error("Error saving to sessionStorage:", error);
  }
}

function loadFromSessionStorage() {
  try {
    const savedData = sessionStorage.getItem("portfolioFormData");
    if (!savedData) return;

    const data = JSON.parse(savedData);
    const form = document.getElementById("portfolioForm");

    // Restore template selection first
    if (data.selectedTemplate) {
      document
        .querySelectorAll(".template-option")
        .forEach((opt) => opt.classList.remove("selected"));

      document.querySelector('input[name="selectedTemplate"]').value =
        data.selectedTemplate;

      document
        .querySelector(`[data-template="${data.selectedTemplate}"]`)
        ?.classList.add("selected");
    }

    // Restore blog checkbox first
    if (data.includeBlog) {
      document.getElementById("includeBlog").checked = true;
      toggleBlogSection();
    }

    // Restore images and files
    formData.images = data.images || {};
    formData.files = data.files || {};

    // Recreate dynamic sections based on saved data
    if (data.formFields.skillName && data.formFields.skillName.length > 1) {
      for (let i = 1; i < data.formFields.skillName.length; i++) {
        addSkill();
      }
    }

    if (
      data.formFields.projectTitle &&
      data.formFields.projectTitle.length > 1
    ) {
      for (let i = 1; i < data.formFields.projectTitle.length; i++) {
        addProject();
      }
    }

    if (data.formFields.jobTitle && data.formFields.jobTitle.length > 1) {
      for (let i = 1; i < data.formFields.jobTitle.length; i++) {
        addExperience();
      }
    }

    if (data.formFields.blogTitle && data.formFields.blogTitle.length > 1) {
      for (let i = 1; i < data.formFields.blogTitle.length; i++) {
        addBlog();
      }
    }

    // Now restore form fields after all sections are created
    Object.entries(data.formFields || {}).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // Handle array fields (skills, projects, etc.)
        value.forEach((val, index) => {
          const inputs = form.querySelectorAll(`[name="${key}[]"]`);
          if (inputs[index]) inputs[index].value = val;
        });
      } else {
        const input = form.querySelector(`[name="${key}"]`);
        if (input) input.value = value;
      }
    });

    // Update counters based on actual DOM elements
    updateSkillCount();
    updateProjectCount();
    updateExperienceCount();
    updateBlogCount();

    // Handle resume file required attribute
    const resumeInput = document.getElementById("resumeFile");
    if (data.files.resumeFile && data.files.resumeFileName) {
      // File exists in storage, remove required attribute
      resumeInput.removeAttribute("required");
    } else {
      // No file in storage, ensure required attribute is present
      resumeInput.setAttribute("required", "");
    }

    // Restore image previews
    if (data.images.aboutImage) {
      document.getElementById(
        "aboutImagePreview"
      ).innerHTML = `<img src="${data.images.aboutImage}" alt="Preview" style="max-width: 200px; max-height: 200px; border-radius: 8px;">`;
    }

    // Restore project image previews
    if (data.images.projectImages) {
      data.images.projectImages.forEach((img, index) => {
        if (img) {
          const preview = document.getElementById(
            `projectImagePreview${index + 1}`
          );
          if (preview) {
            preview.innerHTML = `<img src="${img}" alt="Preview" style="max-width: 200px; max-height: 200px; border-radius: 8px;">`;
          }
        }
      });
    }

    // Restore blog image previews
    if (data.images.blogImages) {
      data.images.blogImages.forEach((img, index) => {
        if (img) {
          const preview = document.getElementById(
            `blogImagePreview${index + 1}`
          );
          if (preview) {
            preview.innerHTML = `<img src="${img}" alt="Preview" style="max-width: 200px; max-height: 200px; border-radius: 8px;">`;
          }
        }
      });
    }

    // Restore resume file preview
    if (data.files.resumeFileName) {
      const resumePreview = document.getElementById("resumeFilePreview");
      if (resumePreview) {
        resumePreview.textContent = `File ready: ${data.files.resumeFileName}`;
      }
    }
  } catch (error) {
    console.error("Error loading from sessionStorage:", error);
  }
}
