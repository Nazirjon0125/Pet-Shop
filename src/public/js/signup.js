console.log("Signup frontend javascript file");

// Toggle password visibility
document.querySelectorAll(".toggle-pass").forEach((icon) => {
  icon.addEventListener("click", () => {
    const input = icon.previousElementSibling;
    if (input.type === "password") {
      input.type = "text";
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-eye-slash");
    } else {
      input.type = "password";
      icon.classList.remove("fa-eye-slash");
      icon.classList.add("fa-eye");
    }
  });
});

// Image preview
document
  .getElementById("memberImageInput")
  .addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const validTypes = ["image/jpg", "image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      alert("Only JPG, JPEG, PNG files are allowed!");
      event.target.value = "";
      document.getElementById("preview").src = "/img/default.png";
      return;
    }
    document.getElementById("preview").src = URL.createObjectURL(file);
  });

// Form validation on submit
document.getElementById("signupForm").addEventListener("submit", (e) => {
  const memberNick = document.querySelector(".member-nick").value.trim();
  const memberPhone = document.querySelector(".member-phone").value.trim();
  const memberPassword = document.querySelector(".member-password").value;
  const confirmPassword = document.querySelector(".confirm-password").value;
  const memberImageInput = document.querySelector(".member-image");

  if (
    memberNick === "" ||
    memberPhone === "" ||
    memberPassword === "" ||
    confirmPassword === ""
  ) {
    alert("Please insert all required inputs!");
    e.preventDefault();
    return false;
  }

  if (memberPassword !== confirmPassword) {
    alert("Password differs, please check!");
    e.preventDefault();
    return false;
  }

  if (!memberImageInput.files.length) {
    alert("Please insert restaurant image!");
    e.preventDefault();
    return false;
  }
});
