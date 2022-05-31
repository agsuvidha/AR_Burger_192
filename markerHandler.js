var tableNumber = null;
AFRAME.registerComponent("marker-handler", {
  init: async function () {
    if (tableNumber === null) {
      this.askTableNumber();
    }
    var dishes = await this.getDishes();

    this.el.addEventListener("markerFound", () => {
      if (tableNumber !== null) {
        var markerId = this.el.id;
        this.handleMarkerFound(dishes, markerId);
      }

      
    });

    this.el.addEventListener("markerLost", () => {
      console.log("marker-lost");
      this.handleMarkerLost();
    });
  },
  handleMarkerFound: function (dishes, markerId) {
    var buttonDiv = document.getElementById("button-div");
    buttonDiv.style.display = "flex";
    var ratingButton = document.getElementById("rating-button");
    ratingButton.style.display = "flex";
    var orderButton = document.getElementById("order-button");
    orderButton.style.display = "flex";
    var dish = dishes.filter(dish => dish.id === markerId)[0];
    var orderSummaryButtton = document.getElementById("order-summary-button");
    orderSummaryButtton.style.display = "flex";
    


    var model = document.querySelector(`#model-${dish.id}`);
    model.setAttribute("position", dish.model_geometry.position);
    model.setAttribute("rotation", dish.model_geometry.rotation);
    model.setAttribute("scale", dish.model_geometry.scale);


    ratingButton.addEventListener("click", () => {
      this.handleRatings(dish);
    });

    orderButton.addEventListener("click", () => {
      var tNumber;
      tableNumber <= 9 ? (tNumber = `T0${tableNumber}`) : `T${tableNumber}`;
      console.log(tNumber);
      this.handleOrder(tNumber, dish);
      swal({
        icon: "warning",
        title: "Thanks for ur order",
        text: "order",
      });
    });

    orderSummaryButtton.addEventListener("click", () =>
      this.handleOrderSummary()
    );

    payButton.addEventListener("click", () => this.handlePayment());

   
  },

  askTableNumber: function () {
    var iconUrl =
      "https://raw.githubusercontent.com/whitehatjr/menu-card-app/main/hunger.png";
    swal({
      title: "welcome to menu card",
      icon: iconUrl,
      content: {
        element: "input",
        attributes: {
          placeholder: "enter ur table no",
          type: "number",
          min: 1,
        },
      },
      closeOnClickOutside: false,
    }).then(val => {
      tableNumber = val;
    });
  },
  handleOrder: function (tNumber, dish) {
    console.log("order");
    firebase
      .firestore()
      .collection("tables")
      .doc(tNumber)
      .get()
      .then(doc => {
        var details = doc.data();

        if (details["current_orders"][dish.id]) {
          details["current_orders"][dish.id]["quantity"] += 1;

          var currentQuantity = details["current_orders"][dish.id]["quantity"];
          details["current_orders"][dish.id]["subtotal"] =
            currentQuantity * dish.price;
        } else {
          details["current_orders"][dish.id] = {
            item: dish.dish_name,
            price: dish.price,
            quantity: 1,
            subtotal: dish.price * 1,
          };
        }

        details.total_bill += dish.price;

        firebase.firestore().collection("tables").doc(doc.id).update(details);
      });
  },

  getDishes: async function () {
    return await firebase
      .firestore()
      .collection("dishes")
      .get()
      .then(snap => {
        return snap.docs.map(doc => doc.data());
      });
  },
  getOrderSummary: async function (tNumber) {
    return await firebase
      .firestore()
      .collection("tables")
      .doc(tNumber)
      .get()
      .then(doc => doc.data());
  },
  handleOrderSummary: async function () {
    var modalDiv = document.getElementById("modal-div");
    modalDiv.style.display = "flex";

    var tableBodyTag = document.getElementById("bill-table-body");

    tableBodyTag.innerHTML = "";
    var tNumber;
    tableNumber <= 9 ? (tNumber = `T0${tableNumber}`) : `T${tableNumber}`;

    var orderSummary = await this.getOrderSummary(tNumber);

    var currentOrders = Object.keys(orderSummary.current_orders);

    currentOrders.map(i => {
      var tr = document.createElement("tr");
      var item = document.createElement("td");
      var price = document.createElement("td");
      var quantity = document.createElement("td");
      var subtotal = document.createElement("td");

      item.innerHTML = orderSummary.current_orders[i].item;
      price.innerHTML = "$" + orderSummary.current_orders[i].price;
      price.setAttribute("class", "text-center");

      quantity.innerHTML = orderSummary.current_orders[i].quantity;
      quantity.setAttribute("class", "text-center");

      subtotal.innerHTML = "$" + orderSummary.current_orders[i].subtotal;
      subtotal.setAttribute("class", "text-center");

      tr.appendChild(item);
      tr.appendChild(price);
      tr.appendChild(quantity);
      tr.appendChild(subtotal);
      tableBodyTag.appendChild(tr);
    });

    var totalTr = document.createElement("tr");

    var td1 = document.createElement("td");
    td1.setAttribute("class", "no-line");

    var td2 = document.createElement("td");
    td1.setAttribute("class", "no-line");

    var td3 = document.createElement("td");
    td1.setAttribute("class", "no-line text-center");

    var strongTag = document.createElement("strong");
    strongTag.innerHTML = "Total";
    td3.appendChild(strongTag);

    var td4 = document.createElement("td");
    td1.setAttribute("class", "no-line text-right");
    td4.innerHTML = "$" + orderSummary.total_bill;

    totalTr.appendChild(td1);
    totalTr.appendChild(td2);
    totalTr.appendChild(td3);
    totalTr.appendChild(td4);

    tableBodyTag.appendChild(totalTr);
  },
  handlePayment: function () {
    document.getElementById("modal-div").style.display = "none";
    var tNumber;
    tableNumber <= 9 ? (tNumber = `T0${tableNumber}`) : `T${tableNumber}`;
    firebase
      .firestore()
      .collection("tables")
      .doc(tNumber)
      .update({
        current_orders: {},
        total_bill: 0,
      })
      .then(() => {
        swal({
          icon: "success",
          title: "Thanks For Paying !",
          text: "Hope You Enjoyed Your Food",
          timer: 3000,
          buttons: false,
        });
      });
  },
  handleRatings: async function (dish) {
    var tNumber;
    tableNumber <= 9 ? (tNumber = `T0${tableNumber}`) : `T${tableNumber}`;

    var orderSummary = await this.getOrderSummary(tNumber);
    var current_orders = Object.keys(orderSummary.current_orders);
    console.log(current_orders);
    if (current_orders.length > 0) {
      document.getElementById("rating-modal-div").style.display = "flex";
      document.getElementById("rating-input").value = "0";
      document.getElementById("feedback-input").value = "";

      var saveRatingButton = document.getElementById("save-rating-button");
      saveRatingButton.addEventListener("click", () => {
        document.getElementById("rating-modal-feedback").style.display = "none";
        var rating = document.getElementById("rating-input").value;
        var feedback = document.getElementById("feedback-input").value;
        firebase
          .firestore()
          .collection("dishes")
          .doc(dish.id)
          .update({
            last_review: feedback,
            last_rating: rating,
          })
          .then(() => {
            swal({
              icon: "success",
              title: "thanks for rating",
              text: "hoped u liked the dish",
              time: 2300,
              buttons: false,
            });
          });
      });
    } else {
      swal({
        icon: "warning",
        title: "oops!!",
        text: "no dish found to give ratings",
        timer: 2500,
        buttons: false,
      });
    }
  },
  handleMarkerLost: function () {
    var buttonDiv = document.getElementById("button-div");
    buttonDiv.style.display = "none";
    console.log("marker-lost");
  },
});
