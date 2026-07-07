/* =========================================================
   NAFAS — script du site
   ========================================================= */

const WHATSAPP_NUMBER = "213540143511";

/* Tarifs de livraison à domicile par wilaya (en DA) — tarifs réels NAFAS.
   null = wilaya non desservie actuellement. */
const WILAYAS = [
  ["01","Adrar",1400],["02","Chlef",850],["03","Laghouat",950],["04","Oum El Bouaghi",850],
  ["05","Batna",900],["06","Béjaïa",800],["07","Biskra",950],["08","Béchar",1100],
  ["09","Blida",600],["10","Bouira",700],["11","Tamanrasset",1600],["12","Tébessa",900],
  ["13","Tlemcen",900],["14","Tiaret",850],["15","Tizi Ouzou",750],["16","Alger",500],
  ["17","Djelfa",950],["18","Jijel",900],["19","Sétif",800],["20","Saïda",900],
  ["21","Skikda",900],["22","Sidi Bel Abbès",900],["23","Annaba",850],["24","Guelma",900],
  ["25","Constantine",800],["26","Médéa",800],["27","Mostaganem",900],["28","M'Sila",850],
  ["29","Mascara",900],["30","Ouargla",950],["31","Oran",800],["32","El Bayadh",1100],
  ["33","Illizi",null],["34","Bordj Bou Arreridj",800],["35","Boumerdès",700],["36","El Tarf",850],
  ["37","Tindouf",null],["38","Tissemsilt",900],["39","El Oued",950],["40","Khenchela",900],
  ["41","Souk Ahras",900],["42","Tipaza",700],["43","Mila",900],["44","Aïn Defla",900],
  ["45","Naâma",1100],["46","Aïn Témouchent",900],["47","Ghardaïa",950],["48","Relizane",900],
  ["49","Timimoun",1400],["50","Bordj Badji Mokhtar",null],["51","Ouled Djellal",950],
  ["52","Béni Abbès",1100],["53","In Salah",1600],["54","In Guezzam",1600],["55","Touggourt",950],
  ["56","Djanet",null],["57","El M'Ghair",950],["58","El Meniaa",1000]
];

/* ---------- Remplir le select des wilayas ---------- */
const wilayaSelect = document.getElementById("wilayaSelect");
WILAYAS.forEach(([code, name, fee]) => {
  const opt = document.createElement("option");
  if (fee === null) {
    opt.value = "";
    opt.textContent = `${code} — ${name} (non desservie actuellement)`;
    opt.disabled = true;
  } else {
    opt.value = fee;
    opt.textContent = `${code} — ${name}`;
  }
  wilayaSelect.appendChild(opt);
});

const feeDisplay = document.getElementById("feeDisplay");
function updateFee(){
  const fee = wilayaSelect.value;
  feeDisplay.textContent = fee ? `${Number(fee).toLocaleString("fr-FR")} DA` : "—";
}
wilayaSelect.addEventListener("change", updateFee);

/* ---------- Ouverture / fermeture de la modale ---------- */
const modal = document.getElementById("orderModal");
const modalProductName = document.getElementById("modalProductName");
const couleurInput = document.getElementById("couleurInput");
const orderForm = document.getElementById("orderForm");

let currentProduct = { name: "", price: 0, colors: "" };

document.querySelectorAll(".btn-order").forEach(btn => {
  btn.addEventListener("click", () => {
    currentProduct = {
      name: btn.dataset.product,
      price: Number(btn.dataset.price),
      colors: btn.dataset.colors || ""
    };
    modalProductName.textContent = currentProduct.name;
    couleurInput.value = currentProduct.colors;
    wilayaSelect.selectedIndex = 0;
    updateFee();
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  });
});

function closeModal(){
  modal.classList.remove("open");
  document.body.style.overflow = "";
}
document.getElementById("closeModal").addEventListener("click", closeModal);
modal.addEventListener("click", (e) => { if(e.target === modal) closeModal(); });

/* ---------- Soumission -> WhatsApp ---------- */
orderForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(orderForm);
  const nom = data.get("nom");
  const telephone = data.get("telephone");
  const wilayaLabel = wilayaSelect.options[wilayaSelect.selectedIndex]?.textContent || "";
  const fraisLivraison = Number(wilayaSelect.value || 0);
  const adresse = data.get("adresse");
  const couleur = data.get("couleur");
  const quantite = data.get("quantite");
  const remarque = data.get("remarque");

  const totalProduit = currentProduct.price * Number(quantite);
  const totalGeneral = totalProduit + fraisLivraison;

  const message =
`Nouvelle commande NAFAS

Produit : ${currentProduct.name}
Couleur : ${couleur}
Quantité : ${quantite}
Prix unitaire : ${currentProduct.price.toLocaleString("fr-FR")} DA
Sous-total : ${totalProduit.toLocaleString("fr-FR")} DA

Nom : ${nom}
Téléphone : ${telephone}
Wilaya : ${wilayaLabel}
Adresse : ${adresse}
Frais de livraison estimés : ${fraisLivraison.toLocaleString("fr-FR")} DA
Total estimé : ${totalGeneral.toLocaleString("fr-FR")} DA
${remarque ? "Remarque : " + remarque : ""}`;

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
  closeModal();
  orderForm.reset();
});
