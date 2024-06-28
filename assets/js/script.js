'use strict';

const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }

const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });

const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-selecct-value]");
const filterBtn = document.querySelectorAll("[data-filter-btn]");

select.addEventListener("click", function () { elementToggleFunc(this); });

for (let i = 0; i < selectItems.length; i++) {
  selectItems[i].addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    elementToggleFunc(select);
    filterFunc(selectedValue);

  });
}

const filterItems = document.querySelectorAll("[data-filter-item]");

const filterFunc = function (selectedValue) {

  for (let i = 0; i < filterItems.length; i++) {

    if (selectedValue === "wszystko"  || selectedValue === "all") {
      filterItems[i].classList.add("active");
    } else if (selectedValue === filterItems[i].dataset.category) {
      filterItems[i].classList.add("active");
    } else {
      filterItems[i].classList.remove("active");
    }
  }
}

let lastClickedBtn = filterBtn[0];

for (let i = 0; i < filterBtn.length; i++) {

  filterBtn[i].addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    filterFunc(selectedValue);

    lastClickedBtn.classList.remove("active");
    this.classList.add("active");
    lastClickedBtn = this;

  });

}

const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");

for (let i = 0; i < formInputs.length; i++) {
  formInputs[i].addEventListener("input", function () {

    if (form.checkValidity()) {
      formBtn.removeAttribute("disabled");
    } else {
      formBtn.setAttribute("disabled", "");
    }

  });
}

const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {

    for (let i = 0; i < pages.length; i++) {
      if (this.innerHTML.toLowerCase() === pages[i].dataset.page) {
        pages[i].classList.add("active");
        navigationLinks[i].classList.add("active");
        window.scrollTo(0, 0);
      } else {
        pages[i].classList.remove("active");
        navigationLinks[i].classList.remove("active");
      }
    }

  });
}

form.addEventListener('submit', event => {
  event.preventDefault();

  const fullname = document.querySelector('input[name="fullname"]').value;
  const email = document.querySelector('input[name="email"]').value;
  const message = document.querySelector('textarea[name="message"]').value;

  window.location.href = `mailto:b.bugara.kontakt@gmail.com?subject=Wiadomość od ${fullname}&body=Nazwa/Imię: ${fullname}%0AEmail: ${email}%0AWiadomość: ${message}`;
});


document.addEventListener('DOMContentLoaded', function() {
  var modal = document.getElementById('project-modal');
  var span = document.getElementsByClassName('close')[0];
  var leftArrow = document.querySelector('.left-arrow');
  var rightArrow = document.querySelector('.right-arrow');
  var currentImageIndex = 0;
  var galleryImages = [];

  span.onclick = function() {
    modal.style.display = 'none';
  };

  window.onclick = function(event) {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  };

  var links = document.querySelectorAll('a.open-modal');
  links.forEach(function(link) {
    link.onclick = function(event) {
      event.preventDefault();

      var title = this.dataset.title;
      var description = this.dataset.description;
      var mainImageSrc = this.querySelector('.main-img').src;
      galleryImages = JSON.parse(this.dataset.gallery);

      var modalTitle = modal.querySelector('.modal-title');
      var modalDescription = modal.querySelector('.modal-description');
      var modalMainImage = modal.querySelector('.main-image');
      var modalGallery = modal.querySelector('.gallery');

      modalTitle.textContent = title;
      modalDescription.innerHTML = description;
      modalMainImage.src = mainImageSrc;
      modalMainImage.alt = title;

      currentImageIndex = 0;

      updateGalleryThumbnails();

      modal.style.display = 'block';
    };
  });

  leftArrow.onclick = function() {
    showPreviousImage();
  };

  rightArrow.onclick = function() {
    showNextImage();
  };

  document.addEventListener('keydown', function(event) {
    if (modal.style.display === 'block') {
      if (event.key === 'ArrowLeft') {
        showPreviousImage();
      } else if (event.key === 'ArrowRight') {
        showNextImage();
      }
    }
  });

  function showPreviousImage() {
    if (currentImageIndex > 0) {
      currentImageIndex--;
    } else {
      currentImageIndex = galleryImages.length - 1;
    }
    updateMainImage();
    updateGalleryThumbnails();
  }

  function showNextImage() {
    if (currentImageIndex < galleryImages.length - 1) {
      currentImageIndex++;
    } else {
      currentImageIndex = 0;
    }
    updateMainImage();
    updateGalleryThumbnails();
  }

  function updateMainImage() {
    var modalMainImage = modal.querySelector('.main-image');
    modalMainImage.src = galleryImages[currentImageIndex];
  }

  function updateGalleryThumbnails() {
    var modalGallery = modal.querySelector('.gallery');
    modalGallery.innerHTML = '';

    var indices = [
      (currentImageIndex - 1 + galleryImages.length) % galleryImages.length,
      currentImageIndex,
      (currentImageIndex + 1) % galleryImages.length
    ];

    indices.forEach(function(index) {
      var img = document.createElement('img');
      img.src = galleryImages[index];
      img.alt = `Gallery Image ${index + 1}`;
      img.classList.toggle('active', index === currentImageIndex);
      img.onclick = function() {
        currentImageIndex = index;
        updateMainImage();
        updateGalleryThumbnails();
      };
      modalGallery.appendChild(img);
    });
  }
});
