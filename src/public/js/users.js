console.log("Users frontend javascript file");
console.log("Users frontend javascript file");

$(function () {
  $(".member-status").on("change", function (e) {
    const id = e.target.id,
      memberStatus = $(`#${id}.member-status`).val();

    axios
      .post("/admin/user/edit", {
        _id: id,
        memberStatus: memberStatus,
      })
      .then((response) => {
        console.log("response;", response);
        const result = response.data;

        if (result.data) {
          $(".member-status").blur();
        } else alert("User updat failed!");
      })
      .catch((err) => {
        console.log(err);
        alert("User updat failed!");
      });
  });
});

document.querySelectorAll(".toggle-orders-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetId = btn.getAttribute("data-target");
    const ordersDiv = document.getElementById(targetId);
    if (ordersDiv.style.display === "none") {
      ordersDiv.style.display = "block";
    } else {
      ordersDiv.style.display = "none";
    }
  });
});
