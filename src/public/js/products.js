console.log("Products frontend javascript file");

$(function () {
  $(".product-collection").on("change", function () {
    const selectedValue = $(".product-collection").val();
    if (selectedValue === "FISH") {
      $("#product-collection").show();
      $("#product-volume").hide();
    } else {
      $("#product-volume").show();
      $("#product-collection").hide();
    }
  });

  $("#process-btn").on("click", () => {
    $(".animal-container").slideToggle(500);
    $("#process-btn").css("display", "none");
  });

  $("#cancel-btn").on("click", () => {
    $(".animal-container").slideToggle(100);
    $("#process-btn").css("display", "flex");
  });

  $(".new-product-status").on("change", async function (e) {
    const id = e.target.id;
    const productStatus = $(`#${id}.new-product-status`).val();

    try {
      const response = await axios.post(`/admin/product/${id}`, {
        productStatus: productStatus,
      });
      console.log("response:", response);
      const result = response.data;
      if (result.data) {
        console.log("Product updated!");
        $(".new-product-status").blur();
      } else alert("Product update failed!");
    } catch (err) {
      console.log(err);
      alert("Product update failed!");
    }
  });
});

function validateForm() {
  const productName = $(".product-name").val(),
    productPrice = $(".product-price").val(),
    productLeftCount = $(".product-left-count").val(),
    productCollection = $(".product-collection").val(),
    productDesc = $(".product-desc").val(),
    productStatus = $(".product-status").val();

  if (
    productName === "" ||
    productPrice === "" ||
    productLeftCount === "" ||
    productCollection === "" ||
    productDesc === "" ||
    productStatus === ""
  ) {
    alert("Please insert all details");
    return false;
  } else return true;
}

function previewFileHandler(input, order) {
  const imgClassName = input.className;

  const file = $(`.${imgClassName}`).get(0).files[0],
    fileType = file["type"],
    validImageType = ["image/jpg", "image/jpeg", "image/png"];

  if (!validImageType.includes(fileType)) {
    alert("Please insert only jpeg, jpg and png!");
  } else {
    if (file) {
      const reader = new FileReader();
      reader.onload = function () {
        $(`#image-section-${order}`).attr("src", reader.result);
      };
      reader.readAsDataURL(file);
    }
  }
}

// EDIT MODAL

// $(function () {
//   // Create yangi product formni ochish
//   $("#process-btn").on("click", () => {
//     $(".animal-container").not(".update-container").slideDown(500);
//     $("#process-btn").hide();
//     $(".update-container").hide();
//   });

//   $("#cancel-btn").on("click", () => {
//     $(".animal-container").not(".update-container").slideUp(200);
//     $("#process-btn").show();
//   });

//   // Update form uchun Cancel tugmasi
//   $("#update-cancel-btn").on("click", () => {
//     $(".update-container").slideUp(200);
//     $("#process-btn").show();
//   });

//   // Edit tugma bosilganda update formni to‘ldirib ochish
//   $(document).on("click", ".edit-btn", async function () {
//     const id = $(this).data("id");

//     try {
//       // Backenddan product malumotlarini olish (agar kerak bo'lsa)
//       const res = await axios.post(`/admin/product/${id}`); // backendda bunday route bo‘lishi kerak
//       const product = res.data.data;

//       // Update formga qiymatlarni joylash
//       $("#update-id").val(product._id);
//       $("#update-productName").val(product.productName);
//       $("#update-productPrice").val(product.productPrice);
//       $("#update-productLeftCount").val(product.productLeftCount);
//       $("#update-productDesc").val(product.productDesc);
//       $("#update-productCollection")
//         .val(product.productCollection)
//         .trigger("change");
//       $("#update-productSize").val(product.productSize || "NORMAL");
//       $("#update-productVolume").val(product.productYear || "ONE_MONTH");

//       // Rasm previewlarni yangilash - agar rasm url larini backenddan olsa bo‘lsa
//       if (product.images && product.images.length > 0) {
//         product.images.forEach((img, idx) => {
//           $(`#update-image-section-${idx + 1}`).attr("src", `/uploads/${img}`);
//         });
//       }

//       // Show update form va yashirish create formni va process-btn ni
//       $(".update-container").slideDown(500);
//       $(".animal-container").not(".update-container").hide();
//       $("#process-btn").hide();
//     } catch (err) {
//       alert("Failed to load product info for update.");
//       console.error(err);
//     }
//   });

//   // Update form submit (update qilish)
//   $("#updateForm").on("submit", async function (e) {
//     e.preventDefault();

//     const id = $("#update-id").val();
//     const formData = new FormData(this);

//     try {
//       const res = await axios.post(`/admin/product/${id}`, formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//       if (res.status === 200) {
//         alert("Product updated successfully!");
//         $(".update-container").slideUp(200);
//         $("#process-btn").show();
//         location.reload(); // yoki xohlasangiz AJAX bilan jadvalni yangilash ham mumkin
//       } else {
//         alert("Update failed.");
//       }
//     } catch (err) {
//       alert("Error occurred during update.");
//       console.error(err);
//     }
//   });

//   // Product collection change (update form ichida)
//   $("#update-productCollection").on("change", function () {
//     if ($(this).val() === "FISH") {
//       $("#update-product-collection").show();
//       $("#update-product-volume").hide();
//     } else {
//       $("#update-product-volume").show();
//       $("#update-product-collection").hide();
//     }
//   });
// });

$(function () {
  // Rasmlarni preview qilish funksiyasi
  window.previewFileHandler = function (input) {
    const file = input.files[0];
    const validImageTypes = ["image/jpg", "image/jpeg", "image/png"];

    if (file && !validImageTypes.includes(file.type)) {
      alert("Please insert only jpeg, jpg and png!");
      input.value = ""; // noto'g'ri fayl bo'lsa inputni tozalash
      return;
    }

    if (file) {
      const reader = new FileReader();
      reader.onload = function () {
        $(input)
          .closest(".upload-img-box")
          .find(".image-preview")
          .attr("src", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Product collectionga qarab "Fish Size" yoki "Animals Year" ni ko'rsatish
  $("#update-productCollection").on("change", function () {
    if ($(this).val() === "FISH") {
      $("#update-product-collection").show();
      $("#update-product-volume").hide();
    } else {
      $("#update-product-volume").show();
      $("#update-product-collection").hide();
    }
  });

  // Edit tugmasi bosilganda backenddan ma'lumot olib formni to'ldirish
  $(document).on("click", ".edit-btn", async function () {
    const id = $(this).data("id");

    try {
      const res = await axios.post(`/admin/product/${id}`);
      const product = res.data.data;

      $("#update-id").val(product._id);
      $("#update-productName").val(product.productName);
      $("#update-productPrice").val(product.productPrice);
      $("#update-productLeftCount").val(product.productLeftCount);
      $("#update-productDesc").val(product.productDesc);
      $("#update-productCollection")
        .val(product.productCollection)
        .trigger("change");
      $("#update-productSize").val(product.productSize || "NORMAL");
      $("#update-productVolume").val(product.productVolume || "ONE_MONTH");

      // Rasmlarni preview qilish (cache ni oldini olish uchun vaqt qo'shilgan)
      if (product.images && product.images.length > 0) {
        $(".update-container .image-preview").each(function (index) {
          if (index < product.images.length) {
            $(this).attr(
              "src",
              `/uploads/${product.images[index]}?t=${Date.now()}`
            );
          } else {
            // Agar rasm yo'q bo'lsa default ikonani qo'yish
            $(this).attr("src", "/img/upload.svg");
          }
        });
      } else {
        // Hech qanday rasm bo'lmasa default ikonani qo'yish
        $(".update-container .image-preview").attr("src", "/img/upload.svg");
      }

      $(".update-container").slideDown(500);
      $(".animal-container").not(".update-container").hide();
      $("#process-btn").hide();
    } catch (err) {
      alert("Failed to load product info for update.");
      console.error(err);
    }
  });

  // Update form submit
  $("#updateForm").on("submit", async function (e) {
    e.preventDefault();

    const id = $("#update-id").val();
    const formData = new FormData(this);

    try {
      const res = await axios.post(`/admin/product/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.status === 200) {
        alert("Product updated successfully!");
        $(".update-container").slideUp(200);
        $("#process-btn").show();
        location.reload();
      } else {
        alert("Update failed.");
      }
    } catch (err) {
      alert("Error occurred during update.");
      console.error(err);
    }
  });

  // Cancel tugmasi
  $("#update-cancel-btn").on("click", function () {
    $(".update-container").slideUp(200);
    $("#process-btn").show();
  });
});
