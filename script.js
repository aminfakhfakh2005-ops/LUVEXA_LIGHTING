const SUPABASE_URL = "https://bimttawmwzuzlbzgpbqo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_TTQQPHcHGI_a_47m3k_ujg_AN0MpqDA";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

const modal = document.getElementById("orderModal");
const closeOrder = document.getElementById("closeOrder");
const form = document.getElementById("orderForm");
const quantityInput = document.getElementById("orderQuantity");
const selectedProduct = document.getElementById("selectedProduct");
const totalElement = document.getElementById("orderTotal");
const message = document.getElementById("orderMessage");
const submitButton = document.getElementById("submitOrder");

let currentProduct = "";
let currentPrice = 0;

function updateTotal() {
  const quantity = Math.max(1, Number(quantityInput.value) || 1);
  quantityInput.value = quantity;
  totalElement.textContent = `${(currentPrice * quantity).toFixed(2)} TND`;
}

function openOrder(product, price) {
  currentProduct = product;
  currentPrice = Number(price);
  selectedProduct.textContent = `${product} — ${currentPrice} TND / unité`;
  quantityInput.value = 1;
  message.className = "order-message";
  message.textContent = "";
  updateTotal();
  modal.classList.add("active");
}

document.querySelectorAll(".order-btn").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    openOrder(button.dataset.product, button.dataset.price);
  });
});

quantityInput.addEventListener("input", updateTotal);

closeOrder.addEventListener("click", () => {
  modal.classList.remove("active");
});

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.classList.remove("active");
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const quantity = Math.max(1, Number(quantityInput.value) || 1);
  const customerName = document.getElementById("customerName").value.trim();
  const phone = document.getElementById("customerPhone").value.trim();
  const address = document.getElementById("customerAddress").value.trim();
  const governorate = document.getElementById("governorate").value;
  const notes = document.getElementById("orderNotes").value.trim();
  const total = currentPrice * quantity;

  if (!customerName || !phone || !address || !governorate) {
    message.className = "order-message error";
    message.textContent = "Veuillez remplir tous les champs obligatoires.";
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Enregistrement...";

  const { error } = await supabaseClient.from("orders").insert([{
    customer_name: customerName,
    phone: phone,
    address: `${address} — ${governorate}${notes ? ` — Note: ${notes}` : ""}`,
    products: [{
      name: currentProduct,
      price: currentPrice,
      quantity: quantity
    }],
    total: total,
    status: "pending"
  }]);

  submitButton.disabled = false;
  submitButton.textContent = "Confirmer la commande";

  if (error) {
    console.error("Supabase order error:", error);
    message.className = "order-message error";
    message.textContent = "Impossible d'enregistrer la commande. Vérifiez la connexion à Supabase.";
    return;
  }

  message.className = "order-message success";
  message.textContent = "Commande confirmée ! Nous allons vous contacter prochainement.";
  form.reset();
  quantityInput.value = 1;
  updateTotal();
});
